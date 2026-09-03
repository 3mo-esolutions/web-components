import { cache, component, Component, html, render, repeat } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { IndexabilityController, type IndexabilityItem } from './IndexabilityController.js'

@component('indexability-test-child')
class IndexabilityTestChild extends Component {
	controller!: IndexabilityController<string>
	idx = 0

	protected override get template() {
		return html`<div class='shadow-item' ${this.controller.item({ index: this.idx, data: `shadow-${this.idx}` })}></div>`
	}
}

@component('indexability-controller-test-component')
class IndexabilityControllerTestComponent extends Component {
	items = [0, 1, 2]
	reversed = false
	withData = true
	nested = false
	withShadowChild = false

	readonly controller = new IndexabilityController<string>(this)
	readonly other = new IndexabilityController<string>(this)

	get itemElements() { return [...this.renderRoot.querySelectorAll<HTMLElement>('.item')] }
	get innerElements() { return [...this.renderRoot.querySelectorAll<HTMLElement>('.inner')] }
	get otherElement() { return this.renderRoot.querySelector<HTMLElement>('.other')! }
	get shadowItem() { return this.renderRoot.querySelector<IndexabilityTestChild>('indexability-test-child')!.renderRoot.querySelector<HTMLElement>('.shadow-item')! }

	protected override get template() {
		const items = this.reversed ? [...this.items].reverse() : this.items
		return html`
			${repeat(items, item => item, item => html`
				<div class='item' data-declared=${item} ${this.controller.item({ index: item, data: this.withData ? `data-${item}` : undefined })}>
					${!this.nested ? html.nothing : html`<span class='inner' ${this.controller.item({ index: 100 + item, data: `inner-${item}` })}></span>`}
				</div>
			`)}
			${!this.withShadowChild ? html.nothing : html`
				<indexability-test-child .controller=${this.controller} .idx=${50}></indexability-test-child>
			`}
			<div class='other' ${this.other.item({ index: 0, data: 'other-0' })}></div>
		`
	}
}

@component('indexability-cache-test')
class IndexabilityCacheTest extends Component {
	swapped = false

	readonly controller = new IndexabilityController<string>(this)

	get cachedElement() { return this.renderRoot.querySelector<HTMLElement>('.cached')! }

	protected override get template() {
		return html`${cache(this.swapped
			? html`<div class='elsewhere'></div>`
			: html`<div class='cached' ${this.controller.item({ index: 0, data: 'cached-0' })}></div>`)}`
	}
}

describe('IndexabilityController', () => {
	const create = (setup: Partial<IndexabilityControllerTestComponent> = {}) =>
		new ComponentTestFixture(() => Object.assign(new IndexabilityControllerTestComponent(), setup))

	/** The composed path of a real event, which is what consumers hand to `itemAt`. */
	const pathOf = (target: EventTarget) => {
		let path = new Array<EventTarget>()
		const listener = (e: Event) => path = e.composedPath()
		window.addEventListener('click', listener, true)
		target.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
		window.removeEventListener('click', listener, true)
		return path
	}

	describe('registration', () => {
		const fixture = create()
		const cacheFixture = new ComponentTestFixture(() => new IndexabilityCacheTest())

		it('registers an item on render and drops it when lit does', async () => {
			expect(fixture.component.controller.items.length).toBe(3)

			fixture.component.items = [0, 1]
			await fixture.update()
			expect(fixture.component.controller.items.map(item => item.options.index)).toEqual([0, 1])

			fixture.component.items = [0, 1, 2, 3]
			await fixture.update()
			expect(fixture.component.controller.items.map(item => item.options.index)).toEqual([0, 1, 2, 3])
		})

		it('maps each item to the element that rendered it', () => {
			expect(fixture.component.controller.items.map(item => item.element)).toEqual(fixture.component.itemElements)
		})

		it('re-registers in place on re-render, rather than dropping and adding', async () => {
			const updated = new Array<number>()
			const removed = new Array<HTMLElement>()
			fixture.component.controller.observe({
				handleItemUpdated: item => updated.push(item.options.index),
				handleItemRemoved: element => removed.push(element),
			})

			await fixture.update()

			expect(updated).toEqual([0, 1, 2])
			expect(removed).toEqual([])
		})

		it('memoises the directive, so a re-render never tears the part down', () => {
			expect(fixture.component.controller.item).toBe(fixture.component.controller.item)
		})

		it('refuses to be used anywhere but on an element', () => {
			const controller = fixture.component.controller
			expect(() => render(html`<div>${controller.item({ index: 0 })}</div>`, document.createElement('div')))
				.toThrowError('This directive can only be used on an element')
		})

		it('reflects a registry change in the very next read', async () => {
			expect(fixture.component.controller.items.length).toBe(3)
			fixture.component.items = [0]
			await fixture.update()
			expect(fixture.component.controller.items.length).toBe(1)
		})

		it('re-registers an item whose template is restored from lit’s cache, so a cached swap never loses items', async () => {
			const { component } = cacheFixture
			const element = component.cachedElement
			expect(component.controller.items.map(item => item.options.data)).toEqual(['cached-0'])

			component.swapped = true
			await cacheFixture.update()
			expect(component.controller.items).toEqual([]) // put aside, and deregistered with it

			component.swapped = false
			await cacheFixture.update()

			expect(component.controller.items.map(item => item.options.data)).toEqual(['cached-0'])
			expect(component.controller.items[0]!.element).toBe(element) // the very element lit cached
		})
	})

	describe('ordering', () => {
		const fixture = create({ reversed: true })

		it('orders by the DECLARED index, not by document position', () => {
			// Rendered 2, 1, 0 — but declared 0, 1, 2.
			expect(fixture.component.itemElements.map(element => element.dataset.declared)).toEqual(['2', '1', '0'])
			expect(fixture.component.controller.items.map(item => item.options.index)).toEqual([0, 1, 2])
		})

		it('reports the rendered items’ data in that same declared order', () => {
			expect(fixture.component.controller.data).toEqual(['data-0', 'data-1', 'data-2'])
		})
	})

	describe('across shadow roots', () => {
		const fixture = create({ withShadowChild: true })

		it('orders items whose document position says nothing about their order', () => {
			expect(fixture.component.controller.items.map(item => item.options.index)).toEqual([0, 1, 2, 50])
			expect(fixture.component.controller.items[3]!.element).toBe(fixture.component.shadowItem)
		})

		it('resolves an event through the shadow boundary', () => {
			expect(fixture.component.controller.itemAt(pathOf(fixture.component.shadowItem))?.options.data).toBe('shadow-50')
		})
	})

	describe('without data', () => {
		const fixture = create({ withData: false })

		it('skips data-less items, so a positions-only registry reports none', () => {
			expect(fixture.component.controller.data).toEqual([])
			expect(fixture.component.controller.items.length).toBe(3)
		})
	})

	describe('itemAt', () => {
		const fixture = create()

		it('resolves an event to the item it landed on', () => {
			expect(fixture.component.controller.itemAt(pathOf(fixture.component.itemElements[1]!))?.options.data).toBe('data-1')
		})

		it('answers nothing for an event outside every item', () => {
			expect(fixture.component.controller.itemAt(pathOf(fixture.component))).toBeUndefined()
		})

		it('answers nothing for another registry’s item, which is what keeps sibling controllers apart', () => {
			const { controller, other, otherElement, itemElements } = fixture.component
			expect(controller.itemAt(pathOf(otherElement))).toBeUndefined()
			expect(other.itemAt(pathOf(otherElement))?.options.data).toBe('other-0')
			expect(other.itemAt(pathOf(itemElements[0]!))).toBeUndefined()
		})
	})

	describe('with nested items', () => {
		const fixture = create({ nested: true })

		it('resolves to the NEAREST item, so an item nested inside another resolves to itself', () => {
			const { controller, innerElements, itemElements } = fixture.component
			expect(controller.itemAt(pathOf(innerElements[1]!))?.options.data).toBe('inner-1')
			expect(controller.itemAt(pathOf(itemElements[1]!))?.options.data).toBe('data-1')
		})
	})

	describe('observation', () => {
		const fixture = create()

		it('reports each registration with its element and options', async () => {
			const items = new Array<IndexabilityItem<string>>()
			fixture.component.controller.observe({ handleItemUpdated: item => items.push(item) })

			fixture.component.items = [0, 1, 2, 3]
			await fixture.update()

			expect(items.map(item => item.options.index)).toEqual([0, 1, 2, 3])
			expect(items.map(item => item.element)).toEqual(fixture.component.itemElements)
		})

		it('reports a removal with the element that left', async () => {
			const dropped = fixture.component.itemElements[2]!
			const removed = new Array<HTMLElement>()
			fixture.component.controller.observe({ handleItemRemoved: element => removed.push(element) })

			fixture.component.items = [0, 1]
			await fixture.update()

			expect(removed).toEqual([dropped])
		})

		it('serves several observers, and stops at unobserve', async () => {
			const counts = [0, 0]
			const observers = counts.map((_, i) => ({ handleItemUpdated: () => counts[i]!++ }))
			observers.forEach(observer => fixture.component.controller.observe(observer))

			await fixture.update()
			expect(counts).toEqual([3, 3])

			fixture.component.controller.unobserve(observers[0]!)
			await fixture.update()
			expect(counts).toEqual([3, 6])
		})

		it('notifies only the registry the item belongs to', async () => {
			const indices = new Array<number>()
			fixture.component.other.observe({ handleItemUpdated: item => indices.push(item.options.index) })

			await fixture.update()

			expect(indices).toEqual([0]) // the lone `.other` item, never the three `.item`s
		})
	})
})