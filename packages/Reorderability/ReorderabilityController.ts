import { Controller, render, type HTMLTemplateResult, type ReactiveElement } from '@a11d/lit'
import { IndexabilityController, type IndexabilityItemOptions } from '@3mo/indexability'

export enum ReorderabilityState {
	Idle = 'idle',
	Dragging = 'dragging',
	DropBefore = 'drop-before',
	DropAfter = 'drop-after',
}

/**
 * How the reorder is presented while dragging:
 * - `live` — the dragged item follows the pointer and the items it displaces glide into the freed
 *   slot, so the list previews its own result. Exact whatever the items' sizes on a line, which is
 *   laid out anew; a wrapping grid steps them onto their neighbour's place, which asks that its
 *   slots share a track.
 * - `indicator` — nothing moves; only {@link ReorderabilityState} is stamped, and the consumer draws
 *   an insertion line from it. The right choice where translating the real items would fight their
 *   layout (sticky columns, subgrid separators).
 *
 * Both strategies always stamp `data-reorderability`, so state-driven styling applies either way.
 */
export type ReorderabilityStrategy = 'live' | 'indicator'

export interface ReorderabilityControllerItemDirectiveOptions extends IndexabilityItemOptions {
	/** The item's position in the OWNER's data — what {@link ReorderabilityController.handleReorder}
	 * reports, and the order the items are read in (never DOM order: items may live in separate
	 * shadow roots, where document position is not comparable). */
	readonly index: number
	/** A disabled item can neither be grabbed nor be a drop position — though a reorder around it may
	 * still displace it, exactly as the owner's data move does. */
	readonly disabled?: boolean
	/** Confines the grab to a descendant of the item (e.g. `'#handle'`). Without it the whole item
	 * is the handle. A press inside the handle is always a drag, so a handle may itself be a button. */
	readonly handle?: string
	/** Descendants of THIS item a drag must never be started from, on top of the ones every item
	 * excludes anyway (@see {@link ReorderabilityController.interactive}). It is what a {@link handle}
	 * cannot express: an item whose own controls are DESCENDANTS of the very element a press on its
	 * body resolves to — a chip built on a button, say — shares its whole ancestry with them, so no
	 * selector can single the body out, while singling the controls out is exact. */
	readonly excluded?: string
	/** Rendered as a preview that follows the pointer, in place of moving the item itself. Meant for
	 * the `indicator` strategy; the item is expected to efface itself via its `Dragging` state styling. */
	readonly dragImage?: HTMLTemplateResult
}

/** One item measured at drag start, in CONTENT coordinates (client + scroll), so auto-scrolling
 * mid-drag never invalidates the numbers and every frame stays pure arithmetic. */
interface ReorderabilitySlot {
	readonly element: HTMLElement
	readonly index: number
	readonly disabled: boolean
	/** Captured with the geometry, so the preview is the one the item declared when the drag began. */
	readonly dragImage?: HTMLTemplateResult
	readonly x: number
	readonly y: number
	readonly width: number
	readonly height: number
}

/** Everything about one in-flight drag, or `undefined` when idle — so "are we dragging" is a single
 * check and tearing down is a single assignment. */
interface ReorderabilityDrag {
	readonly slots: ReadonlyArray<ReorderabilitySlot>  // in data (index) order
	readonly position: number                          // the dragged item's position within `slots`
	/** Present when the items sit on ONE line (a column or a row) — the refined 1D rules apply.
	 * Absent for wrapping/2D grids, which resolve the drop by hit-testing instead. */
	readonly line?: {
		readonly vertical: boolean
		readonly sign: 1 | -1                            // -1 where visual coords descend in data order (RTL)
	}
	readonly bounds: { x: number, y: number, right: number, bottom: number } // union of all slots
	readonly pointerId: number
	readonly origin: { x: number, y: number }          // pointer-down, client coordinates
	readonly startScroll: { x: number, y: number }
	readonly scroller?: Element                        // nearest scrollable ancestor — the auto-scroll surface
	readonly scrollerRect?: DOMRect                    // its bounds (client coords, static while dragging)
	readonly scrollsVertically: boolean
	readonly scrollsHorizontally: boolean
	readonly preview?: HTMLElement                     // the pointer-following dragImage, when one was given
	point: { x: number, y: number }
	moved: boolean
	armed: boolean                                     // touch/pen only — waiting for the press-and-hold
	holdTimer?: ReturnType<typeof setTimeout>
	frame?: number
	target: number                                     // the position the item would drop into
}

/**
 * Drag-to-reorder for items declared inline in a template:
 *
 * ```html
 * <div ${this.reorderabilityController.item({ index })}>
 * ```
 *
 * The `item` element-part directive is the whole registration story — an item registers on render
 * and deregisters when lit drops it, so nothing has to be queried, and no identity attributes are
 * needed in the DOM. That registry is {@link IndexabilityController}, which this controller owns and
 * exposes: it is the same substrate every item-wise interaction reads, so an item that also takes
 * part in others need not declare itself once per concern. Items are ordered by their declared
 * `index` (never by document position: they may live in separate shadow roots, where that is not
 * comparable), and the drop reports `(source, destination)` in those same indices through
 * {@link handleReorder} — which owners either pass as an option or override in a subclass. The
 * controller never touches the data.
 *
 * Several controllers may share one host: each knows only its own items, so a host with one
 * controller per list gets independent lists — a board whose cards reorder within their own column.
 * A drag never crosses from one controller's items into another's.
 *
 * The LAYOUT is never configured — it is read off the items' own boxes at drag start: items on one
 * line (a column of rows, a row of columns, LTR or RTL) get the refined single-axis treatment, and
 * anything else (a wrapping grid) resolves the drop by hit-testing the pointer against the items'
 * slots, which is layout-agnostic by construction. Even the movement constraint is geometric: the
 * dragged item is clamped to the union of all slots, which in a list collapses the cross-axis
 * freedom to zero — a vertical list drags vertically without anyone saying "vertical".
 *
 * The engine is POINTER events, not HTML5 drag-and-drop. Native DnD looks attractive here — the
 * browser owns the preview and cross-window drags come free — but on Android a web drag is handed to
 * the platform's own drag subsystem, and the `dragover`/`drag` events the page gets back are
 * forwarded across process boundaries at roughly the HTML spec's floor (a task "every 350ms ±200ms"),
 * so anything JS draws from them updates a few times a second while the OS-composited drag shadow
 * glides: the drag looks smooth and the feedback looks like a slideshow. Neither that cadence nor the
 * long-press delay can be influenced from the page, and Firefox on Android has no touch DnD at all.
 * Pointer events run at input rate on every platform, which is why SortableJS excludes Chrome-Android
 * and iOS from its native path too, and why dnd-kit dropped native DnD outright.
 *
 * What this costs: dragging out of the window (and file drops) can only be done with native DnD.
 * What it buys, beyond cadence: haptics, drags that work while the list auto-scrolls, and a preview
 * that isn't subject to the platform's drag-image rules.
 */
export class ReorderabilityController<TItemOptions extends ReorderabilityControllerItemDirectiveOptions = ReorderabilityControllerItemDirectiveOptions> extends Controller implements EventListenerObject {
	/** Touch/pen: how long (ms) a press must stay still — within {@link touchHoldTolerance} — before a
	 * drag begins, so a plain swipe still scrolls the list. ~half a second matches the OS long-press. */
	protected static readonly touchHoldDuration = 500

	/** Movement (px) tolerated during the hold before the press is read as a scroll and released. */
	protected static readonly touchHoldTolerance = 10

	/** Haptic pulse (ms) fired the instant the hold lands, where the Vibration API exists (not on iOS). */
	protected static readonly touchHoldFeedback = 15

	/** Mouse/trackpad: movement (px) below which a press stays a click. The pointer is captured only
	 * once this is exceeded — capturing on pointerdown would retarget the release's click/dblclick to
	 * the host and break whatever the item itself does with a plain click. */
	protected static readonly deadZone = 4

	/** Auto-scroll while dragging near the scroller's edges: engages within the zone (px), up to max px/frame. */
	protected static readonly autoScrollZone = 28
	protected static readonly autoScrollMax = 12

	/** Interactive descendants a drag must never be started from — their own gesture wins. An item's
	 * `handle` overrides this, so a drag handle is allowed to be a button, while an item's `excluded`
	 * adds to it. */
	protected static readonly interactive = 'input, select, textarea, a[href], [popover], [contenteditable]:not([contenteditable=false])'

	/** The item registry this controller reads — adopted or its own. See {@link IndexabilityController}. */
	readonly indexability: IndexabilityController<unknown, TItemOptions>

	constructor(override readonly host: ReactiveElement, readonly options: {
		handleReorder?: (source: number, destination: number) => void
		/** Defaults to `live` — see {@link ReorderabilityStrategy}. */
		strategy?: ReorderabilityStrategy
		/** A shared registry to adopt — the owner declares the item directive once per element and
		 * every controller reading the registry acts on it. Absent, the controller creates its own.
		 * Read once, and expected to live on this controller's own host. */
		indexability?: IndexabilityController<unknown, TItemOptions>
	} = {}) {
		super(host)
		// Constructed from the PARAMETERS rather than the fields, and observed from the constructor
		// body, so neither depends on where TypeScript happens to place field initializers.
		this.indexability = options.indexability ?? new IndexabilityController<unknown, TItemOptions>(host)
		this.indexability.observe({
			handleItemUpdated: ({ element, options }) => element.dataset.reorderability = this.stateOf(options.index),
		})
	}

	private drag?: ReorderabilityDrag

	// The controller registers ITSELF as the listener (an EventListenerObject) rather than bound
	// handlers. That is load-bearing, not a matter of taste: `Controller`'s constructor adds the
	// controller to its host, and lit calls `hostConnected` right there when the host is already
	// connected — i.e. BEFORE this class's field initializers have run. Registering a field
	// (`this.handlePointerDown`) would register `undefined` and then silently never listen, which is
	// exactly what a controller constructed mid-render, or one of several constructed per list, does.
	// Prototype methods, by contrast, exist before construction even begins.
	override hostConnected() {
		this.host.addEventListener('pointerdown', this)
	}

	override hostDisconnected() {
		this.host.removeEventListener('pointerdown', this)
		this.teardown()
	}

	handleEvent(e: Event) {
		switch (e.type) {
			case 'pointerdown': return this.handlePointerDown(e as PointerEvent)
			case 'pointermove': return this.handlePointerMove(e as PointerEvent)
			case 'pointerup': return this.handlePointerUp(e as PointerEvent)
			case 'pointercancel': return this.handlePointerCancel(e as PointerEvent)
			case 'touchmove': return this.handleTouchMove(e as TouchEvent)
		}
	}

	private get strategy() { return this.options.strategy ?? 'live' }

	/** What a given item's state is right now — the value stamped as `data-reorderability`. With the
	 * `indicator` strategy the item now holding the target position reports which of its sides the
	 * drop lands on; with `live` the items have already moved, so only the dragged one is distinguished. */
	private stateOf(index: number): ReorderabilityState {
		const drag = this.drag
		if (!drag || !drag.moved) {
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

	/** Registers an item: `<div ${controller.item({ index })}>`. See {@link IndexabilityController.item}. */
	get item() { return this.indexability.item }

	/** The nearest scrollable ancestor, crossing shadow boundaries. */
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

	/**
	 * Measures every item once, in content coordinates. The layout is derived, not declared: items
	 * whose boxes all share a column (or a row) are a LINE — with its direction read off whether the
	 * coordinates ascend or descend in data order (RTL) — and get the single-axis refinements;
	 * anything else is treated as a grid of slots and resolved by hit-testing.
	 */
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
		// One line = every box overlaps every other on the CROSS axis (they share a column or a row).
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

	private handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) {
			return
		}
		// A stale gesture can only survive from the pre-capture phase (a press released outside the
		// host); nothing was drawn there, so a bare teardown clears it.
		if (this.drag) {
			this.teardown()
		}
		const path = e.composedPath()
		const item = this.indexability.itemAt(path)
		if (!item || item.options.disabled) {
			return
		}
		const withinItem = path.slice(0, path.indexOf(item.element))
		const within = (selector: string) => withinItem.some(target => (target as HTMLElement)?.matches?.(selector))
		const handle = item.options.handle
		// The item's own exclusions hold whatever else the press is in, a handle included.
		if (item.options.excluded && within(item.options.excluded)) {
			return
		}
		if (handle) {
			// Inside a handle every press is a drag — a handle is allowed to be a button.
			if (!within(handle)) {
				return
			}
		} else if (within(ReorderabilityController.interactive)) {
			return
		}
		const snapshot = this.snapshot()
		const position = snapshot?.slots.findIndex(slot => slot.element === item.element) ?? -1
		if (!snapshot || position === -1 || snapshot.slots.filter(slot => !slot.disabled).length < 2) {
			return
		}
		this.drag = {
			slots: snapshot.slots,
			position,
			line: snapshot.line,
			bounds: snapshot.bounds,
			pointerId: e.pointerId,
			origin: { x: e.clientX, y: e.clientY },
			startScroll: snapshot.scroll,
			scroller: snapshot.scroller,
			scrollerRect: snapshot.scroller?.getBoundingClientRect(),
			scrollsVertically: !!snapshot.scroller && snapshot.scroller.scrollHeight > snapshot.scroller.clientHeight,
			scrollsHorizontally: !!snapshot.scroller && snapshot.scroller.scrollWidth > snapshot.scroller.clientWidth,
			point: { x: e.clientX, y: e.clientY },
			moved: false,
			armed: e.pointerType === 'touch' || e.pointerType === 'pen',
			target: position,
		}
		this.host.addEventListener('pointermove', this)
		this.host.addEventListener('pointerup', this)
		this.host.addEventListener('pointercancel', this)
		// Non-passive, so a committed touch drag can veto the scroller's own panning (see handleTouchMove).
		this.host.addEventListener('touchmove', this, { passive: false })
		if (this.drag.armed) {
			this.drag.holdTimer = setTimeout(() => this.activate(true), ReorderabilityController.touchHoldDuration)
		}
		// Mouse: nothing is captured or lifted yet — the dead zone in handlePointerMove decides whether
		// this press is a drag at all, so an item's own click affordances keep working.
	}

	/** Commit the press to a drag: capture the pointer and lift the item. `fromHold` is the touch path —
	 * the press-and-hold just landed, so confirm it at once with a haptic pulse and the lift. */
	private activate(fromHold: boolean) {
		const drag = this.drag!
		drag.armed = false
		clearTimeout(drag.holdTimer)
		drag.holdTimer = undefined
		try {
			this.host.setPointerCapture(drag.pointerId)
		} catch {
			// The pointer is no longer active (lifted in the same instant, or a synthetic event) — the
			// drag simply continues uncaptured and ends with the pointer's own up/cancel.
		}
		drag.moved = true
		this.host.toggleAttribute('data-reordering', true)
		// A pointer drag would otherwise paint a text selection across whatever it passes over.
		this.host.ownerDocument.getSelection()?.removeAllRanges()
		this.mount(drag)
		this.paint()
		if (fromHold) {
			navigator.vibrate?.(ReorderabilityController.touchHoldFeedback)
		}
	}

	/** The pointer-following preview, when the item declared a `dragImage`. */
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

	/** End the gesture: release capture, unbind, drop the preview, clear every transform and
	 * state attribute. An owner re-rendering its new order in the same task as this makes the
	 * release paint the settled list exactly once. */
	private teardown() {
		const drag = this.drag
		this.drag = undefined
		this.host.removeEventListener('pointermove', this)
		this.host.removeEventListener('pointerup', this)
		this.host.removeEventListener('pointercancel', this)
		this.host.removeEventListener('touchmove', this)
		this.host.toggleAttribute('data-reordering', false)
		if (!drag) {
			return
		}
		clearTimeout(drag.holdTimer)
		if (drag.frame !== undefined) {
			cancelAnimationFrame(drag.frame)
		}
		if (this.host.hasPointerCapture(drag.pointerId)) {
			this.host.releasePointerCapture(drag.pointerId)
		}
		drag.preview?.remove()
		for (const slot of drag.slots) {
			slot.element.style.removeProperty('transform')
			slot.element.dataset.reorderability = ReorderabilityState.Idle
		}
	}

	private handlePointerMove(e: PointerEvent) {
		const drag = this.drag
		if (!drag || e.pointerId !== drag.pointerId) {
			return
		}
		// A press released OUTSIDE the host (possible only before capture) never delivers its
		// pointerup — don't let the buttonless pointer wandering back in resurrect the gesture.
		if (!(e.buttons & 1)) {
			this.teardown()
			return
		}
		if (drag.armed) {
			// Still waiting for the hold: a finger travelling past the tolerance is scrolling, not
			// pressing — release the gesture and let the browser pan (nothing was captured or vetoed).
			if (Math.hypot(e.clientX - drag.origin.x, e.clientY - drag.origin.y) > ReorderabilityController.touchHoldTolerance) {
				this.teardown()
			}
			return
		}
		drag.point = { x: e.clientX, y: e.clientY }
		if (!drag.moved) {
			if (Math.hypot(e.clientX - drag.origin.x, e.clientY - drag.origin.y) <= ReorderabilityController.deadZone) {
				return // an incidental press — still a click as far as the item is concerned
			}
			this.activate(false)
			return
		}
		drag.frame ??= requestAnimationFrame(() => this.paint())
	}

	/** Touch only: once a drag has committed, stop the scroller (whose `touch-action` lets a finger pan
	 * it) from scrolling out from under it. Pointer capture alone does NOT: a captured touch still
	 * drives the native pan, which seizes the touch and fires `pointercancel`, dropping the drag.
	 * While still `armed` this lets the touch through, so a plain swipe keeps scrolling; mouse and pen
	 * emit no touch events, so it is inert for them. */
	private handleTouchMove(e: TouchEvent) {
		if (this.drag?.moved) {
			e.preventDefault()
		}
	}

	/** One frame: auto-scroll, place the dragged item (and preview), resolve the drop position, and —
	 * with the `live` strategy — glide the displaced items aside. Nothing here reads layout. */
	private paint() {
		const drag = this.drag
		if (!drag?.moved) {
			return
		}
		drag.frame = undefined

		if (drag.preview) {
			drag.preview.style.transform = `translate(calc(${drag.point.x}px - 50%), calc(${drag.point.y}px - 50%))`
		}

		// Auto-scroll near the scroller's edges, along whichever axes it actually scrolls; the delta
		// feeds back into the content-space math below. The pointer resting in the zone fires no
		// moves, so a scrolled frame re-arms itself.
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

		// The travel in content space, clamped so the dragged item stays within the union of the
		// slots. In a list this clamp IS the axis lock: equal-width rows leave zero cross-axis room.
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
			// Preview the displacement the owner's move will cause.
			if (drag.line) {
				this.layOutLine(drag)
			} else {
				// A wrapping GRID: everything between the vacated and the target slot steps one slot
				// toward the vacancy — a plain 2D FLIP to the neighbour's place, which is what carries a
				// step across a row boundary. Its slots share a track, so a neighbour's place fits.
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

	/**
	 * Lays the LINE out anew in the order the drop would produce, and translates every item that is not
	 * the dragged one to where it would then sit. Items are laid end to end from the line's start, so
	 * items of DIFFERENT sizes close the vacancy exactly: stepping each one onto its neighbour's start
	 * instead — which is what a wrapping grid does — would leave every displaced item its own size
	 * rather than its neighbour's out of place, and a row of differently sized items overlapping.
	 *
	 * The arithmetic runs in the line's own coordinate `u`, which ascends in DATA order, so a
	 * right-to-left flow needs no second case.
	 */
	private layOutLine(drag: ReorderabilityDrag) {
		const { vertical, sign } = drag.line!
		const sizeOf = (slot: ReorderabilitySlot) => vertical ? slot.height : slot.width
		const startOf = (slot: ReorderabilitySlot) => {
			const u = sign * (vertical ? slot.y : slot.x)
			return sign > 0 ? u : u - sizeOf(slot)
		}
		const first = drag.slots[0]!
		const second = drag.slots[1]!
		// The spacing the line leaves between two items, which a line leaves between any two.
		const gap = startOf(second) - (startOf(first) + sizeOf(first))
		const order = [...drag.slots.keys()]
		order.splice(drag.target, 0, ...order.splice(drag.position, 1))
		let cursor = startOf(first)
		for (const position of order) {
			const slot = drag.slots[position]!
			// The dragged item is placed by the pointer, not by the layout — it merely takes its room.
			if (position !== drag.position) {
				const travel = sign * (cursor - startOf(slot))
				slot.element.style.transform = !travel ? '' : vertical ? `translate(0px, ${travel}px)` : `translate(${travel}px, 0px)`
			}
			cursor += sizeOf(slot) + gap
		}
	}

	/** The position the item would drop into. On a LINE, an item flips when the dragged item's leading
	 * edge crosses its midpoint (its start going backwards, its end going forwards) — edge-based
	 * rather than midpoint-vs-midpoint, because a large item's midpoint can never reach a small
	 * outermost neighbour's within the clamp, making the outermost slots unreachable. On a GRID, the
	 * drop is wherever the pointer is: the slot containing it, else the nearest one — hit-testing is
	 * what stays correct when the flow wraps. Disabled slots are never a drop position. */
	private targetOf(drag: ReorderabilityDrag, dx: number, dy: number, pointer: { x: number, y: number }): number {
		let target = drag.position
		if (drag.line) {
			const { vertical, sign } = drag.line
			// In line coordinates, u ascends in DATA order (a backwards flow is negated, which makes
			// a box's trailing visual edge its leading data edge — hence the size subtraction).
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
		// A disabled slot cannot take the drop — fall back toward the dragged item's own position.
		while (target !== drag.position && drag.slots[target]!.disabled) {
			target += target > drag.position ? -1 : 1
		}
		return target
	}

	private handlePointerUp(e: PointerEvent) {
		const drag = this.drag
		if (!drag || e.pointerId !== drag.pointerId) {
			return
		}
		const { slots, position, target, moved } = drag
		this.teardown()
		if (!moved || target === position) {
			return // a plain click/tap (the item's own affordances take it), or a drop back in place
		}
		this.handleReorder(slots[position]!.index, slots[target]!.index)
	}

	/** A browser-interrupted gesture (touch hand-off, an OS gesture): drop it — nothing is committed. */
	private handlePointerCancel(e: PointerEvent) {
		if (this.drag && e.pointerId === this.drag.pointerId) {
			this.teardown()
		}
	}

	protected handleReorder(source: number, destination: number) {
		this.options.handleReorder?.(source, destination)
	}
}