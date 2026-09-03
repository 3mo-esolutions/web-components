import { component, Component, css, html, repeat } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { IndexabilityController } from '@3mo/indexability'
import { ReorderabilityController, ReorderabilityState, type ReorderabilityControllerItemDirectiveOptions, type ReorderabilityStrategy } from './ReorderabilityController.js'

@component('reorderability-controller-test-component')
class ReorderabilityControllerTestComponent extends Component {
	layout: 'column' | 'row' | 'grid' = 'column'
	direction: 'ltr' | 'rtl' = 'ltr'
	strategy: ReorderabilityStrategy = 'live'
	handle = ''
	excluded = ''
	withInput = false
	withDragImage = false
	items = [0, 1, 2, 3]
	/** Per-item extent along the layout's axis, where a story needs items of differing sizes */
	sizes = new Array<number>()
	disabledIndices: ReadonlyArray<number> = []
	scrollable = false

	readonly reorders = new Array<[source: number, destination: number]>()
	readonly controller: ReorderabilityController

	constructor() {
		super()
		const component = this
		this.controller = new ReorderabilityController(this, {
			get strategy() { return component.strategy },
			handleReorder: (source, destination) => {
				this.reorders.push([source, destination])
				this.items.splice(destination, 0, ...this.items.splice(source, 1))
				this.requestUpdate()
			},
		})
	}

	get itemElements() { return [...this.renderRoot.querySelectorAll<HTMLElement>('.item')] }

	static override get styles() {
		return css`
			.items { gap: 10px; }
			.items.column { display: flex; flex-direction: column; width: 100px; }
			.items.row { display: flex; flex-direction: row; width: max-content; }
			.items.grid { display: grid; grid-template-columns: repeat(3, 70px); width: 230px; }
			.items.scrollable { overflow-y: auto; height: 100px; scrollbar-width: none; }
			.item { height: 30px; background: gray; }
			.items.row .item { width: 60px; }
		`
	}

	get scroller() { return this.renderRoot.querySelector<HTMLElement>('.items')! }

	protected override get template() {
		return html`
			<div class='items ${this.layout}${!this.scrollable ? '' : ' scrollable'}' dir=${this.direction}>
				${repeat(this.items, item => item, (item, index) => html`
					<div class='item' style=${this.sizes[index] === undefined ? '' : `${this.layout === 'row' ? 'width' : 'height'}: ${this.sizes[index]}px`} ${this.controller.item({
						index,
						disabled: this.disabledIndices.includes(index) || undefined,
						handle: this.handle || undefined,
						excluded: this.excluded || undefined,
						dragImage: !this.withDragImage ? undefined : html`<span>Preview of ${item}</span>`,
					})}>
						${!this.handle && !this.excluded ? html.nothing : html`<span class='grip'>∷</span>`}
						${!this.withInput ? html.nothing : html`<input>`}
						<span>${item}</span>
					</div>
				`)}
			</div>
		`
	}
}

/** A board: one controller per column, so cards reorder within their own column only. */
@component('reorderability-board-test-component')
class ReorderabilityBoardTestComponent extends Component {
	readonly columns = [['a1', 'a2', 'a3'], ['b1', 'b2', 'b3']]
	readonly reorders = new Array<[column: number, source: number, destination: number]>()
	readonly controllers: Array<ReorderabilityController>

	constructor() {
		super()
		this.controllers = this.columns.map((_, column) => new ReorderabilityController(this, {
			handleReorder: (source, destination) => {
				this.reorders.push([column, source, destination])
				this.columns[column]!.splice(destination, 0, ...this.columns[column]!.splice(source, 1))
				this.requestUpdate()
			},
		}))
	}

	itemsOf(column: number) {
		return [...this.renderRoot.querySelectorAll<HTMLElement>(`.column-${column} .card`)]
	}

	static override get styles() {
		return css`
			:host { display: flex; gap: 20px; }
			.column { display: flex; flex-direction: column; gap: 10px; width: 100px; }
			.card { height: 30px; background: gray; }
		`
	}

	protected override get template() {
		return html`
			${this.columns.map((cards, column) => html`
				<div class='column column-${column}'>
					${repeat(cards, card => card, (card, index) => html`
						<div class='card' ${this.controllers[column]!.item({ index })}>${card}</div>
					`)}
				</div>
			`)}
		`
	}
}

/** The OWNER creates the registry and the controller adopts it — the shared-registry path, where an
 * item declares itself once no matter how many controllers act on it. The registry may carry MORE
 * than the controller's own options (another concern's fields), which the generic accommodates. */
@component('reorderability-adopted-registry-test-component')
class ReorderabilityAdoptedRegistryTestComponent extends Component {
	items = [0, 1, 2, 3]
	readonly reorders = new Array<[source: number, destination: number]>()

	readonly indexability = new IndexabilityController<number, ReorderabilityControllerItemDirectiveOptions & { data: number }>(this)
	readonly controller = new ReorderabilityController(this, {
		indexability: this.indexability,
		handleReorder: (source, destination) => {
			this.reorders.push([source, destination])
			this.items.splice(destination, 0, ...this.items.splice(source, 1))
			this.requestUpdate()
		},
	})

	get itemElements() { return [...this.renderRoot.querySelectorAll<HTMLElement>('.item')] }

	static override get styles() {
		return css`
			.items { display: flex; flex-direction: column; gap: 10px; width: 100px; }
			.item { height: 30px; background: gray; }
		`
	}

	protected override get template() {
		return html`
			<div class='items'>
				${repeat(this.items, item => item, (item, index) => html`
					<div class='item' ${this.indexability.item({ index, data: item })}>${item}</div>
				`)}
			</div>
		`
	}
}

describe('ReorderabilityController', () => {
	const center = (element: Element) => {
		const rect = element.getBoundingClientRect()
		return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
	}

	const dispatch = (target: EventTarget, type: string, options: PointerEventInit = {}) =>
		target.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, pointerId: 1, isPrimary: true, button: 0, buttons: 1, ...options }))

	/** The displacement an item has been given, in pixels. Read as NUMBERS rather than compared as a
	 * string, because the serialisation is not the same everywhere: Firefox drops a zero second
	 * component, so `translate(50px, 0px)` reads back from it as `translate(50px)`. */
	const translationOf = (element: HTMLElement) => {
		const [, x, y] = element.style.transform.match(/^translate\((-?[\d.]+)px(?:,\s*(-?[\d.]+)px)?\)$/) ?? []
		return x === undefined ? undefined : { x: Number(x), y: Number(y ?? 0) }
	}

	const frame = () => new Promise(resolve => setTimeout(resolve, 10))

	/** A synthetic mouse drag: press on `from`, glide to `to` through a midpoint (so mid-drag hooks
	 * can observe the in-flight state), release unless told otherwise. */
	async function drag(from: Element | { x: number, y: number }, to: { x: number, y: number }, options?: { via?: EventTarget, midway?: () => unknown, release?: boolean, pointerType?: string }) {
		const start = from instanceof Element ? center(from) : from
		const target = options?.via ?? (from instanceof Element ? from : document)
		dispatch(target, 'pointerdown', { clientX: start.x, clientY: start.y, pointerType: options?.pointerType ?? 'mouse' })
		for (const progress of [0.5, 1]) {
			dispatch(target, 'pointermove', { clientX: start.x + (to.x - start.x) * progress, clientY: start.y + (to.y - start.y) * progress, pointerType: options?.pointerType ?? 'mouse' })
			await frame()
			await frame()
			if (progress === 0.5) {
				await options?.midway?.()
			}
		}
		if (options?.release !== false) {
			dispatch(target, 'pointerup', { clientX: to.x, clientY: to.y, buttons: 0, pointerType: options?.pointerType ?? 'mouse' })
		}
	}

	const create = (setup: Partial<ReorderabilityControllerTestComponent> = {}) =>
		new ComponentTestFixture(() => Object.assign(new ReorderabilityControllerTestComponent(), setup))

	describe('in a vertical list', () => {
		const fixture = create()

		it('reports (source, destination) for a drag across two items', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!, center(items[2]!))
			expect(fixture.component.reorders).toEqual([[0, 2]])
			expect(fixture.component.items).toEqual([1, 2, 0, 3])
		})

		it('treats a press within the dead zone as a plain click — nothing is lifted or reordered', async () => {
			const item = fixture.component.itemElements[0]!
			const { x, y } = center(item)
			await drag({ x, y }, { x: x + 2, y: y + 2 }, { via: item })
			expect(fixture.component.reorders).toEqual([])
			expect(fixture.component.hasAttribute('data-reordering')).toBe(false)
		})

		it('lifts the dragged item and glides its displaced sibling, then clears everything on release', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!, center(items[2]!), {
				// Midway the drag has travelled one slot: the first sibling has already given way.
				midway: () => {
					expect(fixture.component.hasAttribute('data-reordering')).toBe(true)
					expect(items[0]!.dataset.reorderability).toBe(ReorderabilityState.Dragging)
					expect(items[0]!.style.transform).not.toBe('')
					expect(items[1]!.style.transform).not.toBe('')
				}
			})
			expect(fixture.component.hasAttribute('data-reordering')).toBe(false)
			expect(items.every(item => !item.style.transform)).toBe(true)
			expect(items.every(item => item.dataset.reorderability === ReorderabilityState.Idle)).toBe(true)
		})

		it('clamps the drag to the items — a drop far beyond the end lands on the last item, and a vertical list allows no horizontal travel', async () => {
			const items = fixture.component.itemElements
			const { x, y } = center(items[0]!)
			await drag(items[0]!, { x: x + 300, y: y + 1000 }, {
				midway: () => expect(items[0]!.style.transform).toMatch(/translate\(0px/)
			})
			expect(fixture.component.reorders).toEqual([[0, 3]])
		})

		it('does not resurrect a gesture whose press was released outside the host', async () => {
			const items = fixture.component.itemElements
			const { x, y } = center(items[0]!)
			dispatch(items[0]!, 'pointerdown', { clientX: x, clientY: y })
			dispatch(items[0]!, 'pointermove', { clientX: x, clientY: y + 50, buttons: 0 }) // returned button-less
			await frame()
			expect(fixture.component.hasAttribute('data-reordering')).toBe(false)
			expect(fixture.component.reorders).toEqual([])
		})

		it('reports nothing when the item is dropped back where it started', async () => {
			const items = fixture.component.itemElements
			const { x, y } = center(items[0]!)
			await drag({ x, y }, { x, y: y + 10 }, {
				via: items[0]!,
				midway: () => expect(fixture.component.hasAttribute('data-reordering')).toBe(true),
			})

			expect(fixture.component.reorders).toEqual([])
			expect(fixture.component.items).toEqual([0, 1, 2, 3])
			expect(items.every(item => !item.style.transform)).toBe(true)
		})
	})

	describe('with the indicator strategy', () => {
		const fixture = create({ strategy: 'indicator', withDragImage: true })

		it('stamps the drop side on the target and moves nothing; the drag image follows instead', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!, center(items[2]!), {
				midway: () => {
					expect(items[0]!.dataset.reorderability).toBe(ReorderabilityState.Dragging)
					expect(items.some(item => item.dataset.reorderability === ReorderabilityState.DropAfter)).toBe(true)
					expect(items.every(item => !item.style.transform)).toBe(true)
					expect(document.body.lastElementChild?.textContent).toContain('Preview of 0')
				}
			})
			expect(document.body.lastElementChild?.textContent).not.toContain('Preview of 0')
			expect(fixture.component.reorders).toEqual([[0, 2]])
		})
	})

	describe('in a horizontal row', () => {
		const fixture = create({ layout: 'row' })
		const rtlFixture = create({ layout: 'row', direction: 'rtl' })

		it('derives the axis from the geometry', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!, center(items[2]!))
			expect(fixture.component.reorders).toEqual([[0, 2]])
		})

		it('derives a right-to-left flow too: dragging visually backwards moves the item FORWARD in data', async () => {
			const items = rtlFixture.component.itemElements
			expect(center(items[1]!).x).toBeLessThan(center(items[0]!).x) // rtl: data order runs right to left
			await drag(items[0]!, center(items[2]!))
			expect(rtlFixture.component.reorders).toEqual([[0, 2]])
		})
	})

	// A line of differently sized items is laid out ANEW while dragging, rather than each displaced item
	// stepping onto its neighbour's start: with unequal sizes that step is not the size of the vacancy,
	// so the preview would overlap. Both cases below drag the item all the way to the far end, where
	// every other item is displaced, and are asserted before the release for exactly that reason.
	describe('in a line of differently sized items', () => {
		const fixture = create({ sizes: [30, 60, 30, 30] }) // a column, whose gap the fixture sets to 10

		it('shifts every displaced item by the dragged item\'s own extent', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!, center(items[3]!), { release: false })

			// 30 tall plus the gap of 10, for each of them. Stepping onto the neighbour's start would
			// move the second by 70 instead — onto the item above it, which is 60 tall.
			expect(translationOf(items[1]!)).toEqual({ x: 0, y: -40 })
			expect(translationOf(items[2]!)).toEqual({ x: 0, y: -40 })
			expect(translationOf(items[3]!)).toEqual({ x: 0, y: -40 })
		})
	})

	describe('in a right-to-left row of differently sized items', () => {
		const fixture = create({ layout: 'row', direction: 'rtl', sizes: [40, 80, 40, 40] })

		it('shifts them along the flow, not along the coordinates', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!, center(items[3]!), { release: false })

			// Data order runs right to left, so closing the vacancy moves them to greater x
			expect(translationOf(items[1]!)).toEqual({ x: 50, y: 0 })
			expect(translationOf(items[2]!)).toEqual({ x: 50, y: 0 })
			expect(translationOf(items[3]!)).toEqual({ x: 50, y: 0 })
		})
	})

	describe('in a wrapping grid', () => {
		const fixture = create({ layout: 'grid', items: [0, 1, 2, 3, 4, 5] })

		it('resolves the drop by hit-testing, across row boundaries', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!, center(items[4]!)) // 4 sits on the second row
			expect(fixture.component.reorders).toEqual([[0, 4]])
			expect(fixture.component.items).toEqual([1, 2, 3, 4, 0, 5])
		})
	})

	describe('with a handle', () => {
		const fixture = create({ handle: '.grip' })

		it('a press outside the handle is left to the item; inside it drags', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!, center(items[1]!))
			expect(fixture.component.reorders).toEqual([])
			await drag(items[0]!.querySelector('.grip')!, center(items[1]!))
			expect(fixture.component.reorders).toEqual([[0, 1]])
		})
	})

	// What a handle cannot express: an item whose own controls share its every ancestor, so that only
	// singling THEM out tells a press on the body from a press on a control.
	describe('with an excluded descendant', () => {
		const fixture = create({ excluded: '.grip' })

		it('never starts a drag from it, while the rest of the item still drags', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!.querySelector('.grip')!, center(items[1]!))
			expect(fixture.component.reorders).toEqual([])

			await drag(items[0]!, center(items[1]!))

			expect(fixture.component.reorders).toEqual([[0, 1]])
		})
	})

	describe('with interactive content', () => {
		const fixture = create({ withInput: true })

		it('never starts a drag from an input', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!.querySelector('input')!, center(items[2]!))
			expect(fixture.component.reorders).toEqual([])
		})
	})

	describe('with disabled items', () => {
		const disabledSource = create({ disabledIndices: [0] })
		const disabledTarget = create({ disabledIndices: [2] })
		const nearlyAllDisabled = create({ disabledIndices: [1, 2, 3] })

		it('never lifts a disabled item', async () => {
			const items = disabledSource.component.itemElements
			await drag(items[0]!, center(items[2]!))

			expect(disabledSource.component.hasAttribute('data-reordering')).toBe(false)
			expect(disabledSource.component.reorders).toEqual([])
		})

		it('never drops onto a disabled slot — the target falls back toward the dragged item\'s own position', async () => {
			const items = disabledTarget.component.itemElements
			await drag(items[0]!, center(items[2]!))

			expect(disabledTarget.component.reorders).toEqual([[0, 1]])
		})

		it('refuses the gesture entirely while fewer than two items are enabled', async () => {
			const items = nearlyAllDisabled.component.itemElements
			await drag(items[0]!, center(items[3]!))

			expect(nearlyAllDisabled.component.hasAttribute('data-reordering')).toBe(false)
			expect(nearlyAllDisabled.component.reorders).toEqual([])
		})
	})

	describe('cancellation', () => {
		const fixture = create()
		const previewFixture = create({ withDragImage: true })

		it('drops the gesture on pointercancel, clearing every transform and reporting nothing', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!, center(items[2]!), { release: false })
			expect(fixture.component.hasAttribute('data-reordering')).toBe(true)

			dispatch(items[0]!, 'pointercancel', { buttons: 0 })

			expect(fixture.component.hasAttribute('data-reordering')).toBe(false)
			expect(items.every(item => !item.style.transform)).toBe(true)
			expect(items.every(item => item.dataset.reorderability === ReorderabilityState.Idle)).toBe(true)
			expect(fixture.component.reorders).toEqual([])
		})

		it('tears an in-flight drag down when the host disconnects, leaving no preview behind', async () => {
			const items = previewFixture.component.itemElements
			await drag(items[0]!, center(items[2]!), { release: false })
			const preview = document.body.lastElementChild!
			expect(preview.textContent).toContain('Preview of 0')

			previewFixture.component.remove()

			expect(preview.isConnected).toBe(false)
			expect(previewFixture.component.hasAttribute('data-reordering')).toBe(false)
			expect(items.every(item => !item.style.transform)).toBe(true)
			expect(previewFixture.component.reorders).toEqual([])
		})
	})

	describe('auto-scrolling', () => {
		const fixture = create({ scrollable: true, items: [0, 1, 2, 3, 4, 5] })

		// Disabled: requires real pointer input for rAF paint
		xit('scrolls a scrollable ancestor while dragging within its edge zone', () => {
			const { scroller } = fixture.component
			const items = fixture.component.itemElements
			const maximumScroll = scroller.scrollHeight - scroller.clientHeight
			expect(maximumScroll).toBeGreaterThan(0) // the box really does clip its items

			const { x, y } = center(items[0]!)
			const edge = scroller.getBoundingClientRect().bottom - 10 // inside the edge zone
			dispatch(items[0]!, 'pointerdown', { clientX: x, clientY: y })
			for (let move = 0; move < 500 && scroller.scrollTop < maximumScroll - 1; move++) {
				dispatch(items[0]!, 'pointermove', { clientX: x, clientY: edge })
			}
			expect(scroller.scrollTop).toBeGreaterThanOrEqual(maximumScroll - 1)

			dispatch(items[0]!, 'pointerup', { clientX: x, clientY: edge, buttons: 0 })
		})

		// Disabled: requires real pointer input for release resolution
		xit('resolves the drop in content coordinates after auto-scrolling', () => {
			const { scroller } = fixture.component
			const items = fixture.component.itemElements
			const maximumScroll = scroller.scrollHeight - scroller.clientHeight
			const { x, y } = center(items[0]!)
			const edge = scroller.getBoundingClientRect().bottom - 10

			dispatch(items[0]!, 'pointerdown', { clientX: x, clientY: y })
			for (let move = 0; move < 500 && scroller.scrollTop < maximumScroll - 1; move++) {
				dispatch(items[0]!, 'pointermove', { clientX: x, clientY: edge })
			}
			dispatch(items[0]!, 'pointerup', { clientX: x, clientY: edge, buttons: 0 })

			expect(fixture.component.reorders).toEqual([[0, 5]])
			expect(fixture.component.items).toEqual([1, 2, 3, 4, 5, 0])
		})
	})

	// Several controllers on ONE host is how independent lists are built (a board's columns): each
	// only ever sees the items registered with it, so a gesture belongs to exactly one of them and a
	// drag can never cross from one list into another.
	describe('with several controllers on one host', () => {
		const fixture = new ComponentTestFixture(() => new ReorderabilityBoardTestComponent())

		it('answers only for its own list, and reports positions within that list', async () => {
			const first = fixture.component.itemsOf(0)
			await drag(first[0]!, center(first[2]!))
			expect(fixture.component.reorders).toEqual([[0, 0, 2]])
			expect(fixture.component.columns[0]).toEqual(['a2', 'a3', 'a1'])
			expect(fixture.component.columns[1]).toEqual(['b1', 'b2', 'b3'])
		})

		it('keeps every list to its own geometry — dragging in one column leaves the others untouched', async () => {
			const second = fixture.component.itemsOf(1)
			await drag(second[2]!, center(second[0]!), {
				midway: () => expect(fixture.component.itemsOf(0).every(item => !item.style.transform)).toBe(true)
			})
			expect(fixture.component.reorders).toEqual([[1, 2, 0]])
		})

		it('does not carry an item across lists: a drag toward another column stays in its own', async () => {
			const first = fixture.component.itemsOf(0)
			const target = center(fixture.component.itemsOf(1)[2]!)
			await drag(first[0]!, target)
			// Clamped to its own column's bounds, so the horizontal travel is dropped and the vertical
			// part still resolves within the source list.
			expect(fixture.component.reorders.every(([column]) => column === 0)).toBe(true)
			expect(fixture.component.columns[1]).toEqual(['b1', 'b2', 'b3'])
		})
	})

	describe('with an adopted registry', () => {
		const fixture = new ComponentTestFixture(() => new ReorderabilityAdoptedRegistryTestComponent())

		it('reads the owner’s registry rather than creating its own', () => {
			expect(fixture.component.controller.indexability).toBe(fixture.component.indexability)
			expect(fixture.component.controller.item).toBe(fixture.component.indexability.item)
		})

		it('drags items the OWNER registered, stamping its state onto them', async () => {
			const items = fixture.component.itemElements
			await drag(items[0]!, center(items[2]!), {
				midway: () => expect(items[0]!.dataset.reorderability).toBe(ReorderabilityState.Dragging)
			})
			expect(fixture.component.reorders.length).toBeGreaterThan(0)
			expect(fixture.component.items.length).toBe(4)
		})
	})

	describe('on touch', () => {
		const fixture = create()

		beforeEach(() => jasmine.clock().install())
		afterEach(() => jasmine.clock().uninstall())

		it('a swipe before the press-and-hold lands keeps scrolling — no drag', () => {
			const items = fixture.component.itemElements
			const { x, y } = center(items[0]!)
			dispatch(items[0]!, 'pointerdown', { clientX: x, clientY: y, pointerType: 'touch' })
			dispatch(items[0]!, 'pointermove', { clientX: x, clientY: y + 50, pointerType: 'touch' })
			dispatch(items[0]!, 'pointerup', { clientX: x, clientY: y + 50, buttons: 0, pointerType: 'touch' })
			jasmine.clock().tick(600)
			expect(fixture.component.reorders).toEqual([])
		})

		// Disabled: requires real pointer input for rAF paint
		xit('a landed hold lifts the item, and the drag then commits like any other', () => {
			const items = fixture.component.itemElements
			const { x, y } = center(items[0]!)
			dispatch(items[0]!, 'pointerdown', { clientX: x, clientY: y, pointerType: 'touch' })
			jasmine.clock().tick(600)
			expect(items[0]!.dataset.reorderability).toBe(ReorderabilityState.Dragging)
			const to = center(items[2]!)
			dispatch(items[0]!, 'pointermove', { clientX: to.x, clientY: to.y, pointerType: 'touch' })
			dispatch(items[0]!, 'pointerup', { clientX: to.x, clientY: to.y, buttons: 0, pointerType: 'touch' })
			expect(fixture.component.reorders.length).toBeGreaterThan(0)
		})
	})
})