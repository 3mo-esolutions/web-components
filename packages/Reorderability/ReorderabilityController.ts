import { Controller, render, type HTMLTemplateResult, type ReactiveElement } from '@a11d/lit'
import { IndexabilityController, type IndexabilityItemOptions } from '@3mo/indexability'
import { PointerDragController, type PointerDrag } from '@3mo/pointer-controller'

export enum ReorderabilityState {
	Idle = 'idle',
	Dragging = 'dragging',
	DropBefore = 'drop-before',
	DropAfter = 'drop-after',
}

/**
 * - `live`: the dragged item follows the pointer and the displaced items move aside, previewing the result.
 * - `indicator`: nothing moves; the consumer draws an insertion line from the stamped state. For layouts
 *   that translating the items would break, such as sticky columns or subgrid separators.
 */
export type ReorderabilityStrategy = 'live' | 'indicator'

export interface ReorderabilityControllerItemDirectiveOptions extends IndexabilityItemOptions {
	/** The item's position in the owner's data. Items are ordered by it rather than by document
	 * position, which is not comparable across shadow roots. */
	readonly index: number
	/** Can be neither grabbed nor dropped onto, but may still be displaced by a reorder around it. */
	readonly disabled?: boolean
	/** Confines the grab to a descendant, e.g. `'#handle'`. A press inside it is always a drag, so a
	 * handle may be a button. */
	readonly handle?: string
	/** Descendants a drag must not start from, in addition to {@link ReorderabilityController.interactive}.
	 * For items whose controls sit inside the element a body press resolves to, e.g. a chip built on a
	 * button, where no handle selector can single out the body. */
	readonly excluded?: string
	/** A preview following the pointer instead of the item. Meant for the `indicator` strategy. */
	readonly dragImage?: HTMLTemplateResult
}

/** Measured in content coordinates (client + scroll), so auto-scrolling never invalidates them. */
interface ReorderabilitySlot {
	readonly element: HTMLElement
	readonly index: number
	readonly disabled: boolean
	readonly dragImage?: HTMLTemplateResult
	readonly x: number
	readonly y: number
	readonly width: number
	readonly height: number
}

interface ReorderabilityDrag {
	readonly slots: ReadonlyArray<ReorderabilitySlot>
	readonly position: number
	/** Absent when the items wrap, which resolves the drop by hit-testing instead. */
	readonly line?: {
		readonly vertical: boolean
		/** -1 where the coordinates descend in data order (RTL). */
		readonly sign: 1 | -1
	}
	readonly bounds: { x: number, y: number, right: number, bottom: number }
	readonly origin: { x: number, y: number }
	readonly startScroll: { x: number, y: number }
	readonly scroller?: Element
	readonly scrollerRect?: DOMRect
	readonly scrollsVertically: boolean
	readonly scrollsHorizontally: boolean
	readonly preview?: HTMLElement
	point: { x: number, y: number }
	frame?: number
	target: number
}

/**
 * Drag-to-reorder for items declared inline in a template:
 *
 * ```html
 * <div ${this.reorderabilityController.item({ index })}>
 * ```
 *
 * The drop reports `(source, destination)` indices through {@link handleReorder}; the controller never
 * touches the data. The layout is read off the items' boxes at drag start: items on one line get
 * single-axis rules, anything else is hit-tested.
 *
 * Built on pointer events rather than native drag and drop: on Android the page receives native drag
 * events only a few times a second, and Firefox on Android has no touch drag at all.
 */
export class ReorderabilityController<TItemOptions extends ReorderabilityControllerItemDirectiveOptions = ReorderabilityControllerItemDirectiveOptions> extends Controller {
	/** Touch and pen hold first, so a plain swipe still scrolls. */
	protected static readonly touchHoldDuration = 500
	protected static readonly touchHoldFeedback = 15
	protected static readonly autoScrollZone = 28
	protected static readonly autoScrollMax = 12

	/** Descendants a drag never starts from, unless they are inside the item's `handle`. */
	protected static readonly interactive = 'input, select, textarea, a[href], [popover], [contenteditable]:not([contenteditable=false])'

	readonly indexability: IndexabilityController<unknown, TItemOptions>

	constructor(override readonly host: ReactiveElement, readonly options: {
		handleReorder?: (source: number, destination: number) => void
		strategy?: ReorderabilityStrategy
		/** A registry shared with other controllers on the same host; created when absent. */
		indexability?: IndexabilityController<unknown, TItemOptions>
	} = {}) {
		super(host)
		this.indexability = options.indexability ?? new IndexabilityController<unknown, TItemOptions>(host)
		this.indexability.observe({
			handleItemUpdated: ({ element, options }) => element.dataset.reorderability = this.stateOf(options.index),
		})
		this.pointerDrag = new PointerDragController(host, {
			holdDuration: ReorderabilityController.touchHoldDuration,
			handlePress: event => this.handlePress(event),
			handleDragStart: drag => this.handleDragStart(drag),
			handleDrag: drag => this.handleDrag(drag),
			handleDragEnd: () => this.handleDragEnd(),
			handleDragCancel: () => this.teardown(),
		})
	}

	private readonly pointerDrag: PointerDragController
	private pressed?: HTMLElement
	private drag?: ReorderabilityDrag

	override hostDisconnected() {
		this.teardown()
	}

	private get strategy() { return this.options.strategy ?? 'live' }

	private stateOf(index: number): ReorderabilityState {
		const drag = this.drag
		if (!drag) {
			return ReorderabilityState.Idle
		}
		if (index === drag.slots[drag.position]!.index) {
			return ReorderabilityState.Dragging
		}
		if (this.strategy === 'live' || drag.target === drag.position) {
			return ReorderabilityState.Idle
		}
		return drag.slots[drag.target]?.index !== index
			? ReorderabilityState.Idle
			: drag.target < drag.position ? ReorderabilityState.DropBefore : ReorderabilityState.DropAfter
	}

	get item() { return this.indexability.item }

	private scrollerOf(element: Element): Element | undefined {
		for (let node: Node | null = element; node; node = node.parentNode ?? (node as ShadowRoot).host) {
			if (!(node instanceof HTMLElement)) {
				continue
			}
			const style = getComputedStyle(node)
			const scrollable = (overflow: string, size: number, scrollSize: number) =>
				['auto', 'scroll'].includes(overflow) && scrollSize > size
			if (scrollable(style.overflowY, node.clientHeight, node.scrollHeight) || scrollable(style.overflowX, node.clientWidth, node.scrollWidth)) {
				return node
			}
		}
		return undefined
	}

	private scrollOf(scroller: Element | undefined) {
		return { x: scroller?.scrollLeft ?? 0, y: scroller?.scrollTop ?? 0 }
	}

	private snapshot() {
		const items = this.indexability.items
		if (items.length < 2) {
			return undefined
		}
		const scroller = this.scrollerOf(items[0]!.element)
		const scroll = this.scrollOf(scroller)
		const slots = items.map(({ element, options }) => {
			const rect = element.getBoundingClientRect()
			return {
				element,
				index: options.index,
				disabled: !!options.disabled,
				dragImage: options.dragImage,
				x: rect.left + scroll.x,
				y: rect.top + scroll.y,
				width: rect.width,
				height: rect.height,
			}
		})
		const bounds = {
			x: Math.min(...slots.map(slot => slot.x)),
			y: Math.min(...slots.map(slot => slot.y)),
			right: Math.max(...slots.map(slot => slot.x + slot.width)),
			bottom: Math.max(...slots.map(slot => slot.y + slot.height)),
		}
		// The items form a line when every box overlaps every other on the cross axis.
		const overlapping = (start: (slot: ReorderabilitySlot) => number, end: (slot: ReorderabilitySlot) => number) =>
			Math.min(...slots.map(end)) > Math.max(...slots.map(start))
		const column = overlapping(slot => slot.x, slot => slot.x + slot.width)
		const row = !column && overlapping(slot => slot.y, slot => slot.y + slot.height)
		const first = slots[0]!
		const last = slots[slots.length - 1]!
		const line = !column && !row ? undefined : {
			vertical: column,
			sign: ((column ? last.y >= first.y : last.x >= first.x) ? 1 : -1) as 1 | -1,
		}
		return { slots, line, bounds, scroller, scroll }
	}

	private handlePress(e: PointerEvent) {
		const path = e.composedPath()
		const item = this.indexability.itemAt(path)
		if (!item || item.options.disabled) {
			return false
		}
		const withinItem = path.slice(0, path.indexOf(item.element))
		const within = (selector: string) => withinItem.some(target => (target as HTMLElement)?.matches?.(selector))
		const handle = item.options.handle
		if (item.options.excluded && within(item.options.excluded)) {
			return false
		}
		if (handle) {
			if (!within(handle)) {
				return false
			}
		} else if (within(ReorderabilityController.interactive)) {
			return false
		}
		if (this.indexability.items.filter(({ options }) => !options.disabled).length < 2) {
			return false
		}
		this.pressed = item.element
		return true
	}

	private handleDragStart({ origin, event }: PointerDrag) {
		const snapshot = this.snapshot()
		const position = snapshot?.slots.findIndex(slot => slot.element === this.pressed) ?? -1
		if (!snapshot || position === -1) {
			this.pointerDrag.abandon()
			return
		}
		const drag: ReorderabilityDrag = {
			slots: snapshot.slots,
			position,
			line: snapshot.line,
			bounds: snapshot.bounds,
			origin,
			startScroll: snapshot.scroll,
			scroller: snapshot.scroller,
			scrollerRect: snapshot.scroller?.getBoundingClientRect(),
			scrollsVertically: !!snapshot.scroller && snapshot.scroller.scrollHeight > snapshot.scroller.clientHeight,
			scrollsHorizontally: !!snapshot.scroller && snapshot.scroller.scrollWidth > snapshot.scroller.clientWidth,
			point: { x: event.clientX, y: event.clientY },
			target: position,
		}
		this.drag = drag
		this.host.toggleAttribute('data-reordering', true)
		this.mount(drag)
		this.paint()
		if (event.pointerType === 'touch' || event.pointerType === 'pen') {
			navigator.vibrate?.(ReorderabilityController.touchHoldFeedback)
		}
	}

	private mount(drag: ReorderabilityDrag) {
		const template = drag.slots[drag.position]!.dragImage
		if (!template) {
			return
		}
		const preview = document.createElement('div')
		preview.style.cssText = 'position: fixed; inset-block-start: 0; inset-inline-start: 0; z-index: 2147483647; pointer-events: none;'
		render(template, preview)
		this.host.ownerDocument.body.appendChild(preview)
		Object.assign(drag, { preview } satisfies Partial<ReorderabilityDrag>)
	}

	private teardown() {
		const drag = this.drag
		this.drag = undefined
		this.pressed = undefined
		this.host.toggleAttribute('data-reordering', false)
		if (!drag) {
			return
		}
		if (drag.frame !== undefined) {
			cancelAnimationFrame(drag.frame)
		}
		drag.preview?.remove()
		for (const slot of drag.slots) {
			slot.element.style.removeProperty('transform')
			slot.element.dataset.reorderability = ReorderabilityState.Idle
		}
	}

	private handleDrag({ event }: PointerDrag) {
		const drag = this.drag
		if (drag) {
			drag.point = { x: event.clientX, y: event.clientY }
			drag.frame ??= requestAnimationFrame(() => this.paint())
		}
	}

	/** Runs every frame of a drag, so it must not read layout. */
	private paint() {
		const drag = this.drag
		if (!drag) {
			return
		}
		drag.frame = undefined

		if (drag.preview) {
			drag.preview.style.transform = `translate(calc(${drag.point.x}px - 50%), calc(${drag.point.y}px - 50%))`
		}

		// A pointer resting in the edge zone fires no moves, so a frame that scrolled schedules the next.
		const scroller = drag.scroller
		const rect = drag.scrollerRect
		if (scroller && rect) {
			const zone = ReorderabilityController.autoScrollZone
			const speed = (distance: number) => ReorderabilityController.autoScrollMax * Math.min(1, distance / zone)
			const scrolled = (['y', 'x'] as const).some(axis => {
				if (axis === 'y' ? !drag.scrollsVertically : !drag.scrollsHorizontally) {
					return false
				}
				const [property, point, start, end] = axis === 'y'
					? ['scrollTop', drag.point.y, rect.top, rect.bottom] as const
					: ['scrollLeft', drag.point.x, rect.left, rect.right] as const
				const before = scroller[property]
				if (point < start + zone) {
					scroller[property] = before - speed(start + zone - point)
				} else if (point > end - zone) {
					scroller[property] = before + speed(point - (end - zone))
				}
				return scroller[property] !== before
			})
			if (scrolled) {
				drag.frame ??= requestAnimationFrame(() => this.paint())
			}
		}

		// Clamped to the union of the slots, which in a list is also the axis lock.
		const scroll = this.scrollOf(scroller)
		const dragged = drag.slots[drag.position]!
		const dx = Math.max(
			drag.bounds.x - dragged.x,
			Math.min(drag.bounds.right - (dragged.x + dragged.width), drag.point.x + scroll.x - (drag.origin.x + drag.startScroll.x)))
		const dy = Math.max(
			drag.bounds.y - dragged.y,
			Math.min(drag.bounds.bottom - (dragged.y + dragged.height), drag.point.y + scroll.y - (drag.origin.y + drag.startScroll.y)))
		if (this.strategy === 'live') {
			dragged.element.style.transform = `translate(${dx}px, ${dy}px)`
		}

		drag.target = this.targetOf(drag, dx, dy, { x: drag.point.x + scroll.x, y: drag.point.y + scroll.y })

		if (this.strategy === 'live') {
			if (drag.line) {
				this.layOutLine(drag)
			} else {
				// Each displaced item takes its neighbour's place, which assumes the slots share a track.
				for (const [position, slot] of drag.slots.entries()) {
					if (position === drag.position) {
						continue
					}
					const displaced = position > drag.position
						? position <= drag.target ? drag.slots[position - 1]! : undefined
						: position >= drag.target ? drag.slots[position + 1]! : undefined
					slot.element.style.transform = !displaced ? '' : `translate(${displaced.x - slot.x}px, ${displaced.y - slot.y}px)`
				}
			}
		}
		for (const slot of drag.slots) {
			slot.element.dataset.reorderability = this.stateOf(slot.index)
		}
	}

	/** Lays the items end to end in the resulting order rather than onto their neighbour's place, so
	 * items of different sizes do not overlap. `u` ascends in data order, which covers RTL. */
	private layOutLine(drag: ReorderabilityDrag) {
		const { vertical, sign } = drag.line!
		const sizeOf = (slot: ReorderabilitySlot) => vertical ? slot.height : slot.width
		const startOf = (slot: ReorderabilitySlot) => {
			const u = sign * (vertical ? slot.y : slot.x)
			return sign > 0 ? u : u - sizeOf(slot)
		}
		const first = drag.slots[0]!
		const second = drag.slots[1]!
		// Assumes one gap throughout the line.
		const gap = startOf(second) - (startOf(first) + sizeOf(first))
		const order = [...drag.slots.keys()]
		order.splice(drag.target, 0, ...order.splice(drag.position, 1))
		let cursor = startOf(first)
		for (const position of order) {
			const slot = drag.slots[position]!
			if (position !== drag.position) {
				const travel = sign * (cursor - startOf(slot))
				slot.element.style.transform = !travel ? '' : vertical ? `translate(0px, ${travel}px)` : `translate(${travel}px, 0px)`
			}
			cursor += sizeOf(slot) + gap
		}
	}

	/** On a line, an item flips when the dragged item's leading edge crosses its midpoint. Comparing
	 * midpoints instead leaves a small outermost item unreachable for a large dragged one within the clamp. */
	private targetOf(drag: ReorderabilityDrag, dx: number, dy: number, pointer: { x: number, y: number }): number {
		let target = drag.position
		if (drag.line) {
			const { vertical, sign } = drag.line
			const startOf = (slot: ReorderabilitySlot, travel = 0) => {
				const u = sign * ((vertical ? slot.y : slot.x) + travel)
				return sign > 0 ? u : u - (vertical ? slot.height : slot.width)
			}
			const dragged = drag.slots[drag.position]!
			const start = startOf(dragged, vertical ? dy : dx)
			const end = start + (vertical ? dragged.height : dragged.width)
			target = 0
			for (const [position, slot] of drag.slots.entries()) {
				if (position === drag.position) {
					continue
				}
				const middle = startOf(slot) + (vertical ? slot.height : slot.width) / 2
				if (position < drag.position ? middle < start : middle <= end) {
					target++
				}
			}
		} else {
			const within = drag.slots.findIndex(slot =>
				pointer.x >= slot.x && pointer.x <= slot.x + slot.width && pointer.y >= slot.y && pointer.y <= slot.y + slot.height)
			target = within !== -1 ? within : drag.slots.reduce((nearest, slot, position) => {
				const distance = Math.hypot(
					pointer.x - Math.max(slot.x, Math.min(slot.x + slot.width, pointer.x)),
					pointer.y - Math.max(slot.y, Math.min(slot.y + slot.height, pointer.y)))
				return distance < nearest.distance ? { position, distance } : nearest
			}, { position: drag.target, distance: Infinity }).position
		}
		while (target !== drag.position && drag.slots[target]!.disabled) {
			target += target > drag.position ? -1 : 1
		}
		return target
	}

	private handleDragEnd() {
		const drag = this.drag
		this.teardown()
		if (drag && drag.target !== drag.position) {
			this.handleReorder(drag.slots[drag.position]!.index, drag.slots[drag.target]!.index)
		}
	}

	protected handleReorder(source: number, destination: number) {
		this.options.handleReorder?.(source, destination)
	}
}