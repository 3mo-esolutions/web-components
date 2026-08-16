import { AsyncDirective, Controller, directive, noChange, PartType, type DirectiveResult, type ElementPart, type PartInfo, type ReactiveElement } from '@a11d/lit'

export type IndexabilityItemOptions<TData = unknown> = {
	/** The item's position in the OWNER's data — the order the items are read in, and what
	 * interactions built on this registry report. Never DOM order: items may live in separate shadow
	 * roots, where document position is not comparable. */
	readonly index: number
	/** The datum this element renders. Consumers that only care about positions (a reorder) leave it
	 * out; those that resolve an event to a value (a selection) pass it and read it back off the item. */
	readonly data?: TData
	/** A disabled item stays registered — it keeps its place in the order, so a reorder still displaces
	 * it and a range still spans it — but interactions are expected to refuse to act ON it. */
	readonly disabled?: boolean
}

export type IndexabilityItem<TData = unknown, TItemOptions extends IndexabilityItemOptions<TData> = IndexabilityItemOptions<TData>> = {
	readonly element: HTMLElement
	readonly options: TItemOptions
}

/**
 * Notified as the registry changes. `handleItemUpdated` runs DURING the host's render (an item
 * registering is a render), which is the moment to stamp state onto the element and never a moment
 * to request an update.
 */
export interface IndexabilityObserver<TData = unknown, TItemOptions extends IndexabilityItemOptions<TData> = IndexabilityItemOptions<TData>> {
	handleItemUpdated?(item: IndexabilityItem<TData, TItemOptions>): void
	handleItemRemoved?(element: HTMLElement): void
}

/**
 * Tracks which elements currently render which items:
 *
 * ```html
 * <div ${this.indexabilityController.item({ index, data })}>
 * ```
 *
 * The `item` element-part directive is the whole registration story — an item registers on render and
 * deregisters when lit drops it, so nothing has to be queried and no identity attributes are needed in
 * the DOM. That is all this controller does. It owns no gesture, no state and no styling; it is the
 * substrate the controllers that DO own those build on, so that an item declares itself once no matter
 * how many interactions it takes part in:
 *
 * ```ts
 * readonly indexability = new IndexabilityController<Person, ItemOptions>(this)
 * readonly selectability = new SelectabilityController(this, { indexability: this.indexability })
 * readonly reorderability = new ReorderabilityController(this, { indexability: this.indexability })
 * ```
 *
 * Items are ordered by their declared `index`, never by document position — they may sit in separate
 * shadow roots, where that is not comparable, and the owner's data order is the only order that means
 * anything anyway. Nothing validates that the indices are unique or contiguous; they are read as the
 * owner's own coordinates and reported back in them.
 *
 * Only RENDERED items are known here. A paginated or virtualized owner has items its registry has
 * never seen, so anything needing the full universe (a range, a select-all) must take it from the
 * owner's data instead — {@link items} answers "what is on screen", not "what exists".
 *
 * Several registries may share one host: each knows only its own items, which is what keeps sibling
 * controllers — one per list on a board — out of each other's events.
 */
export class IndexabilityController<TData = unknown, TItemOptions extends IndexabilityItemOptions<TData> = IndexabilityItemOptions<TData>> extends Controller {
	constructor(override readonly host: ReactiveElement) { super(host) }

	private readonly observers = new Set<IndexabilityObserver<TData, TItemOptions>>()

	observe(observer: IndexabilityObserver<TData, TItemOptions>) {
		this.observers.add(observer)
	}

	unobserve(observer: IndexabilityObserver<TData, TItemOptions>) {
		this.observers.delete(observer)
	}

	/** Keyed by element, because resolving an event to its item is the one lookup that happens per
	 * gesture and has to be cheap. The ordering the consumers read is derived from it. */
	private readonly optionsByItems = new Map<HTMLElement, TItemOptions>()

	/**
	 * The rendered items in ascending declared index — the order that makes "the item before this
	 * one" mean something when document position cannot say (items in separate shadow roots, or an
	 * owner rendering in an order that is not its data order).
	 *
	 * Built per read rather than cached: the one consumer that needs the ordering — a drag, which
	 * wants array neighbors to be data neighbors — reads it once per gesture, and the consumer that
	 * reads it per render only iterates it. The sort is near-linear anyway, since items register in
	 * declared order to begin with.
	 */
	get items(): ReadonlyArray<IndexabilityItem<TData, TItemOptions>> {
		return [...this.optionsByItems]
			.map(([element, options]) => ({ element, options }))
			.sort((a, b) => a.options.index - b.options.index)
	}

	/** The rendered items' data in declared order. Items registered without data are skipped, so a
	 * registry used purely for positions reports nothing here. */
	get data(): ReadonlyArray<TData> {
		return this.items
			.map(item => item.options.data)
			.filter(data => data !== undefined) as ReadonlyArray<TData>
	}

	/** The registered item an event landed on — resolved through {@link Event.composedPath}, so it works
	 * whether the items sit in the host's own tree or several shadow roots below it. Returns the
	 * NEAREST one, so an item nested inside another resolves to itself. An event on another registry's
	 * item resolves to nothing here, which is what keeps sibling controllers out of each other's
	 * gestures. */
	itemAt(path: ReadonlyArray<EventTarget>): IndexabilityItem<TData, TItemOptions> | undefined {
		for (const target of path) {
			const options = this.optionsByItems.get(target as HTMLElement)
			if (options) {
				return { element: target as HTMLElement, options }
			}
		}
		return undefined
	}

	private addItem(element: HTMLElement, options: TItemOptions) {
		this.optionsByItems.set(element, options)
		const item = { element, options }
		for (const observer of this.observers) {
			observer.handleItemUpdated?.(item)
		}
	}

	private deleteItem(element: HTMLElement) {
		this.optionsByItems.delete(element)
		for (const observer of this.observers) {
			observer.handleItemRemoved?.(element)
		}
	}

	// Explicitly typed, and memoised into a field: lit identifies a directive by its class, so a fresh
	// class per access would make every render tear the part down and construct a new one — and the
	// anonymous class itself cannot appear in the emitted declaration.
	private _item?: (options: TItemOptions) => DirectiveResult
	get item() {
		const controller = this
		return this._item ??= directive(class extends AsyncDirective {
			// Public: a directive class is part of the emitted declaration, which cannot expose private members.
			part?: ElementPart
			options?: TItemOptions

			constructor(partInfo: PartInfo) {
				super(partInfo)
				if (partInfo.type !== PartType.ELEMENT) {
					throw new Error('This directive can only be used on an element')
				}
			}

			override render(options: TItemOptions) {
				options
				return noChange
			}

			override update(part: ElementPart, [options]: [TItemOptions]) {
				this.part = part
				this.options = options
				controller.addItem(part.element as HTMLElement, options)
				return noChange
			}

			override disconnected() {
				controller.deleteItem(this.part!.element as HTMLElement)
			}

			override reconnected() {
				controller.addItem(this.part!.element as HTMLElement, this.options!)
			}
		})
	}
}