import { Controller, isServer, type ReactiveControllerHost } from '@a11d/lit'

export interface OverflowControllerOptions<TItem extends Element = Element> {
	/**
	 * The container laying the items out in a single line along its inline axis, clipping those which
	 * do not fit. It is re-read before every measurement, so it shall be provided as a getter whenever
	 * the container renders late or gets replaced.
	 */
	readonly container: Element | null | undefined
	/**
	 * All overflow candidates in visual order - including those currently overflowing, wherever they
	 * live in the meantime. Re-read before every measurement. Items overflow from the end of this list.
	 */
	readonly items: ReadonlyArray<TItem>
	/** Suspends the controller as long as this is `true`. */
	readonly disabled?: boolean
	/**
	 * The inline space to set aside as soon as at least one item overflows - usually the width of the
	 * anchor opening the overflow menu. An anchor which instead occupies its space permanently, like
	 * the toolbar's ever-present overflow icon-button, needs no reservation.
	 */
	readonly reservedSize?: number
	/**
	 * Exempts an item from overflowing. It keeps occupying space in the container even when
	 * the remaining items overflow around it.
	 */
	isPinned?(item: TItem): boolean
	/**
	 * Applies an item's verdict - e.g. by reassigning it to another slot, or by toggling an attribute
	 * CSS hides it by. Called when the verdict changes, and once for every newly encountered item
	 * whose verdict disagrees with @see overflowingItems - so a freshly added item always ends up
	 * where the verdict says, no matter where it started out.
	 */
	handleChange?(item: TItem, overflows: boolean): void
}

/**
 * Layout wobbles at the border of fitting and overflowing are absorbed by granting the last fitting
 * item this much of an overhang, which the clipping container swallows invisibly.
 */
const tolerance = 0.5

/**
 * A controller which watches a single-line container and determines which of its items fit and which
 * overflow - the "Priority+" pattern of toolbars and menu bars. It only decides *what* overflows;
 * where overflowing items go (an overflow menu, hidden via CSS, ...) is entirely up to the host.
 *
 * Options are usually provided as a factory, whose host parameter enables getter-backed,
 * lazily-read options right in a field initializer:
 *
 * ```ts
 * readonly overflowController = new OverflowController(this, host => ({
 *     get container() { return host.pane },
 *     get items() { return host.items },
 *     handleChange: (item, overflows) => item.slot = overflows ? 'overflow' : '',
 * }))
 * ```
 *
 * Fitting is decided by arithmetic over measured item sizes rather than by moving items around to
 * probe the layout: items are measured while they are laid out in the container, and keep their last
 * known size once they overflow. A container resize therefore never causes overflowed items to flash
 * back in for re-measurement - only the items whose verdict actually changes are touched. As the
 * sizes are summed up instead of compared to coordinates, right-to-left containers need no special
 * treatment. Measurements are batched to one per microtask and run before paint, so verdicts never
 * appear a frame late.
 *
 * Items are assumed not to shrink below the measured size (e.g. `flex: 0 0 auto`), margins are not
 * accounted for - spacing shall be provided by the container's `gap` - and a container hidden
 * e.g. via `display: none` overflows all of its items while preserving their known sizes.
 *
 * @ssr false
 */
export class OverflowController<TItem extends Element = Element, THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller {
	protected readonly options: OverflowControllerOptions<TItem>

	constructor(
		protected override readonly host: THost,
		options: OverflowControllerOptions<TItem> | ((host: THost) => OverflowControllerOptions<TItem>)
	) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
	}

	private _overflowingItems = new Set<TItem>()
	/** The items which do not fit the container, in visual order. */
	get overflowingItems(): ReadonlySet<TItem> { return this._overflowingItems }

	/** Whether at least one item overflows the container. */
	get hasOverflow() { return this._overflowingItems.size > 0 }

	/** Whether the given item does not fit the container. */
	overflows(item: TItem) { return this._overflowingItems.has(item) }

	/** The last known inline sizes, keyed by item. Overflowed items retain the size they last had in the container. */
	private readonly sizes = new WeakMap<TItem, number>()
	/** Items which have received a verdict before, distinguishing transitions from first encounters. */
	private readonly known = new WeakSet<TItem>()

	private connected = false
	private scheduled = false
	private observedContainer?: Element
	private readonly observedItems = new Set<TItem>()
	private resizeObserver?: ResizeObserver

	override hostConnected() {
		this.connected = true
		this.requestMeasurement()
	}

	override hostUpdated() {
		this.requestMeasurement()
	}

	override hostDisconnected() {
		this.connected = false
		this.resizeObserver?.disconnect()
		this.resizeObserver = undefined
		this.observedContainer = undefined
		this.observedItems.clear()
	}

	/** Schedules a measurement - at most one per microtask, running before the next paint. */
	requestMeasurement() {
		if (this.connected === false || this.scheduled || isServer) {
			return
		}
		this.scheduled = true
		queueMicrotask(() => {
			this.scheduled = false
			this.measure()
		})
	}

	private get observer() {
		// Measuring in the next frame keeps the writes out of the observer's own delivery loop, whose
		// notifications would otherwise stay undelivered and surface as a global error.
		return this.resizeObserver ??= new ResizeObserver(() => requestAnimationFrame(() => this.requestMeasurement()))
	}

	private measure() {
		if (this.connected === false) {
			return
		}

		const container = this.options.container ?? undefined
		this.observeContainer(container)

		if (container === undefined || this.options.disabled === true) {
			return
		}

		const items = this.options.items

		// Reads first, writes last - one layout pass, no thrashing:

		for (const item of items) {
			if (this._overflowingItems.has(item) === false) {
				const size = item.getBoundingClientRect().width
				// A zero size means the item has no layout right now - e.g. in a hidden container -
				// so the last size it had while visible remains the better estimate.
				if (size > 0) {
					this.sizes.set(item, size)
				}
			}
		}

		const style = getComputedStyle(container)
		const gap = parseFloat(style.columnGap) || 0
		const budget = container.getBoundingClientRect().width
			- (parseFloat(style.borderInlineStartWidth) || 0)
			- (parseFloat(style.borderInlineEndWidth) || 0)
			- (parseFloat(style.paddingInlineStart) || 0)
			- (parseFloat(style.paddingInlineEnd) || 0)

		const flexible = new Array<TItem>()
		let pinnedCount = 0
		let pinnedSize = 0
		for (const item of items) {
			if (this.options.isPinned?.(item)) {
				pinnedCount++
				pinnedSize += this.sizes.get(item) ?? 0
			} else {
				flexible.push(item)
			}
		}

		const sizeUpTo = new Array<number>(flexible.length + 1)
		sizeUpTo[0] = 0
		for (const [index, item] of flexible.entries()) {
			sizeUpTo[index + 1] = sizeUpTo[index]! + (this.sizes.get(item) ?? 0)
		}

		// The largest number of flexible items which fit alongside all pinned ones, leaving room
		// for the reservation whenever at least one item has to overflow. Never-measured items
		// count as zero and fit optimistically - once laid out, the next pass measures them for real.
		let fitting = budget <= 0 ? 0 : flexible.length
		while (fitting > 0) {
			const total = pinnedSize
				+ sizeUpTo[fitting]!
				+ gap * Math.max(0, pinnedCount + fitting - 1)
				+ (fitting < flexible.length ? this.options.reservedSize ?? 0 : 0)
			if (total <= budget + tolerance) {
				break
			}
			fitting--
		}

		const overflowing = new Set(flexible.slice(fitting))
		const previous = this._overflowingItems
		this._overflowingItems = overflowing

		let changed = previous.size !== overflowing.size || [...overflowing].some(item => previous.has(item) === false)
		for (const item of items) {
			const overflows = overflowing.has(item)
			if (overflows !== previous.has(item) || this.known.has(item) === false) {
				this.known.add(item)
				changed = true
				this.options.handleChange?.(item, overflows)
			}
		}

		// Only laid-out items are observed: their size changes shall re-measure,
		// whereas an overflowed item's home (e.g. a closed menu) is none of our business.
		this.observeItems(items.filter(item => overflowing.has(item) === false))

		if (changed) {
			this.host.requestUpdate()
		}
	}

	private observeContainer(container: Element | undefined) {
		if (container === this.observedContainer) {
			return
		}
		if (this.observedContainer !== undefined) {
			this.resizeObserver?.unobserve(this.observedContainer)
		}
		this.observedContainer = container
		if (container !== undefined) {
			this.observer.observe(container)
		}
	}

	private observeItems(fitting: ReadonlyArray<TItem>) {
		const next = new Set(fitting)
		for (const item of this.observedItems) {
			if (next.has(item) === false) {
				this.observer.unobserve(item)
				this.observedItems.delete(item)
			}
		}
		for (const item of next) {
			if (this.observedItems.has(item) === false) {
				this.observer.observe(item)
				this.observedItems.add(item)
			}
		}
	}
}