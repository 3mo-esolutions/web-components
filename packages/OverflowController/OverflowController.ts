import { Controller, ElementRef, ElementRefs, isServer, type DirectiveResult, type ReactiveControllerHost } from '@a11d/lit'

export type OverflowItemOptions = {
	/** Keeps the item in the container even while the items around it overflow. */
	readonly pinned?: boolean
}

export interface OverflowControllerOptions<TItem extends Element = Element> {
	/** The single-line container clipping what does not fit. Re-read per measurement; left out when @see container designates it. */
	readonly container?: Element | null
	/** Every overflow candidate in visual order. Re-read per measurement; left out when @see item registers them. */
	readonly items?: ReadonlyArray<TItem>
	/** Suspends the controller as long as this is `true`. */
	readonly disabled?: boolean
	/** Inline space to set aside as soon as anything overflows — usually the anchor which opens the overflow menu. */
	readonly reservedSize?: number
	/** Exempts an item from overflowing. Answered by the item's own `pinned` when left out. */
	isPinned?(item: TItem): boolean
	/** Applies an item's verdict. Called when one changes, and once per newly encountered item. */
	handleChange?(item: TItem, overflows: boolean): void
}

/** Overhang granted at the border of fitting, which the container clips, so that layout wobbles do not flip a verdict. */
const tolerance = 0.5

/**
 * Decides which of a single-line container's items fit and which overflow — the "Priority+" pattern.
 * Where the overflowing ones go is entirely the host's business.
 *
 * A host which renders its own items declares them where they stand:
 *
 * ```html
 * <div ${this.overflowController.container()}>
 *     ${this.actions.map(action => html`<button ${this.overflowController.item()}>${action}</button>`)}
 * </div>
 * ```
 *
 * A host whose items are light-DOM children it cannot put a directive on passes them as options instead:
 *
 * ```ts
 * readonly overflowController = new OverflowController(this, host => ({
 *     get container() { return host.pane },
 *     get items() { return host.items },
 *     handleChange: (item, overflows) => item.slot = overflows ? 'overflow' : '',
 * }))
 * ```
 *
 * Verdicts come from arithmetic over measured sizes, never from moving items to probe the layout, so an
 * overflowed item never flashes back in to be re-measured and right-to-left needs no special treatment.
 * Items are assumed not to shrink below their measured size (e.g. `flex: 0 0 auto`), spacing is taken
 * from the container's `gap` rather than from margins, and a container without layout overflows everything.
 *
 * @ssr false
 */
export class OverflowController<TItem extends Element = Element, THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller {
	protected readonly options: OverflowControllerOptions<TItem>

	constructor(
		protected override readonly host: THost,
		options: OverflowControllerOptions<TItem> | ((host: THost) => OverflowControllerOptions<TItem>) = {}
	) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
	}

	/** The container, designated by @see container or by hand. */
	private readonly containerRef = new ElementRef<Element>({ updated: () => this.requestMeasurement() })

	/** The candidates, registered by @see item or by hand, in the order they were first declared. */
	private readonly itemRefs = new ElementRefs<TItem, OverflowItemOptions | undefined>({
		updated: () => this.requestMeasurement(),
		disconnected: () => this.requestMeasurement(),
	})

	/** Designates the element it is rendered on as the container. */
	readonly container = (): DirectiveResult => this.containerRef.ref()

	/** Registers the element it is rendered on as an overflow candidate. */
	readonly item = (options?: OverflowItemOptions): DirectiveResult => this.itemRefs.ref(options)

	private _overflowingItems = new Set<TItem>()
	/** The items which do not fit the container. */
	get overflowingItems(): ReadonlySet<TItem> { return this._overflowingItems }

	/** Whether at least one item does not fit the container. */
	get hasOverflow() { return this._overflowingItems.size > 0 }

	/** Whether the given item does not fit the container. */
	overflows(item: TItem) { return this._overflowingItems.has(item) }

	/** The container being measured, however it was given. */
	get containerElement() { return this.options.container ?? this.containerRef.value }

	/** The overflow candidates, however they were given. */
	get items(): ReadonlyArray<TItem> { return this.options.items ?? [...this.itemRefs] }

	private isPinned(item: TItem) {
		return this.options.isPinned?.(item) ?? this.itemRefs.get(item)?.pinned ?? false
	}

	/** Overflowed items retain the size they last had in the container. */
	private readonly sizes = new WeakMap<TItem, number>()
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

	/** Schedules a measurement, at most one per microtask, running before the next paint. */
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
		// Measuring a frame later keeps the writes out of the observer's delivery loop, which would otherwise error.
		return this.resizeObserver ??= new ResizeObserver(() => requestAnimationFrame(() => this.requestMeasurement()))
	}

	private measure() {
		if (this.connected === false) {
			return
		}

		const container = this.containerElement
		this.observeContainer(container ?? undefined)

		if (!container || this.options.disabled === true) {
			return
		}

		const items = this.items

		// Reads first, writes last — one layout pass, no thrashing:

		for (const item of items) {
			if (this._overflowingItems.has(item) === false) {
				const size = item.getBoundingClientRect().width
				// Zero means no layout right now, so the last known size remains the better estimate.
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
			if (this.isPinned(item)) {
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

		// Never-measured items count as zero and fit optimistically; the next pass measures them for real.
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

		// Only laid-out items are observed; an overflowed item's home is none of our business.
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