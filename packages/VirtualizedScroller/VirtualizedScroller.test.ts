import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type VirtualizedScroller } from './VirtualizedScroller.js'
import './index.js'

const itemCount = 400
const itemHeight = 40
const items = new Array(itemCount).fill(undefined).map((_, index) => index)

const wait = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

const pollUntil = async (predicate: () => boolean, timeout = 4000) => {
	const start = Date.now()
	while (!predicate() && Date.now() - start < timeout) {
		await wait(30)
	}
	return predicate()
}

describe('VirtualizedScroller', () => {
	// The items are their own indices, so the rendered text doubles as an index assertion.
	const fixture = new ComponentTestFixture<VirtualizedScroller<number>>(html`
		<mo-virtualized-scroller style='height: 200px'
			.items=${items}
			.getItemTemplate=${(item: number) => html`<div class='item' style='height: ${itemHeight}px'>Item ${item}</div>`}
		></mo-virtualized-scroller>
	`)

	const scroller = () => fixture.component.renderRoot.querySelector<HTMLElement>('mo-scroller')!

	/**
	 * The component's stylesheet never gives its own scroller a height, so the scroller grows to the
	 * full virtual height instead of clipping it — it never scrolls and the virtualizer's
	 * ResizeObserver loops. Bounding it here is what the component's own stylesheet is missing.
	 */
	beforeEach(() => scroller().style.height = '100%')

	/** The virtualizer keeps laying out for a few frames, so wait until the window stops moving. */
	const settle = async () => {
		await fixture.updateComplete
		await pollUntil(() => fixture.component.renderedItems.length > 0)
		let previous = ''
		await pollUntil(() => {
			const current = `${fixture.component.renderedItems.length}:${fixture.component.renderedItems[0]?.textContent}`
			const stable = current === previous
			previous = current
			return stable
		})
		await wait(150)
	}

	const firstRenderedIndex = () => {
		const [first] = fixture.component.renderedItems
		return first ? fixture.component.getRenderedElementIndex(first) : undefined
	}

	const scrollToEnd = async () => {
		scroller().scrollTop = scroller().scrollHeight
		await pollUntil(() => (firstRenderedIndex() ?? 0) > 0)
		await settle()
	}

	describe('virtualization', () => {
		it('should render each item through "getItemTemplate"', async () => {
			await settle()

			expect(fixture.component.renderedItems[0]!.className).toBe('item')
			expect(fixture.component.renderedItems[0]!.textContent).toContain('Item 0')
			expect(fixture.component.renderedItems[1]!.textContent).toContain('Item 1')
		})

		it('should render only the window of items which fits the viewport', async () => {
			await settle()

			expect(fixture.component.renderedItems.length).toBeGreaterThan(0)
			expect(fixture.component.renderedItems.length).toBeLessThan(itemCount / 2)
		})

		it('should move the rendered window when scrolled', async () => {
			await settle()
			expect(firstRenderedIndex()).toBe(0)

			await scrollToEnd()

			expect(firstRenderedIndex()).toBeGreaterThan(0)
			expect(fixture.component.getElement(0) instanceof Element).toBeFalse()
			expect(fixture.component.getElement(itemCount - 1) instanceof Element).toBeTrue()
		})

		// BROKEN: the component never gives its own "mo-scroller" a height, so it grows to the full
		// virtual height instead of clipping it — nothing ever scrolls and the virtualizer's
		// ResizeObserver loops. Every case above compensates for this in "beforeEach".
		xit('should bound its own scroller so that it clips and scrolls the virtual content', async () => {
			await settle()

			expect(scroller().getBoundingClientRect().height).toBeCloseTo(200, -1)
			expect(scroller().scrollHeight).toBeGreaterThan(scroller().clientHeight)
		})

		it('should re-render when the "items" array is replaced', async () => {
			await settle()

			fixture.component.items = items.map(index => index + 1000)
			await settle()

			expect(fixture.component.renderedItems[0]!.textContent).toContain('Item 1000')
		})
	})

	describe('getRenderedElementIndex', () => {
		it('should translate a rendered element to its index among all items', async () => {
			await settle()
			await scrollToEnd()

			const element = fixture.component.renderedItems[2]!
			const index = fixture.component.getRenderedElementIndex(element)

			expect(index).toBeGreaterThan(0)
			expect(element.textContent).toContain(`Item ${index}`)
		})

		it('should return undefined for an element it does not render', async () => {
			await settle()

			expect(fixture.component.getRenderedElementIndex(document.createElement('div'))).toBeUndefined()
		})
	})

	describe('getElement', () => {
		it('should return the rendered element for an index in view', async () => {
			await settle()

			const element = fixture.component.getElement(2)

			expect(element instanceof Element).toBeTrue()
			expect((element as Element).textContent).toContain('Item 2')
		})

		it('should return a handle for an index out of view whose scrollIntoView brings it into view', async () => {
			await settle()

			const handle = fixture.component.getElement(itemCount - 1)!
			expect(handle instanceof Element).toBeFalse()

			// Only the smooth path asks the virtualizer for coordinates; its default "pin" path
			// scrolls but leaves the window empty (see report).
			handle.scrollIntoView({ behavior: 'smooth', block: 'start' })
			await pollUntil(() => fixture.component.getElement(itemCount - 1) instanceof Element)
			await settle()

			const element = fixture.component.getElement(itemCount - 1)
			expect(element instanceof Element).toBeTrue()
			expect((element as Element).textContent).toContain(`Item ${itemCount - 1}`)
		})

		// BROKEN: without "behavior: smooth" the virtualizer takes its "pin" path, which scrolls to
		// the index but leaves the rendered window empty. This is the path ListFocusController uses.
		xit('should bring an index out of view into view with the default scroll behavior', async () => {
			await settle()

			fixture.component.getElement(itemCount - 1)!.scrollIntoView()
			await pollUntil(() => fixture.component.getElement(itemCount - 1) instanceof Element)

			expect(fixture.component.renderedItems.length).toBeGreaterThan(0)
			expect(fixture.component.getElement(itemCount - 1) instanceof Element).toBeTrue()
		})
	})
})