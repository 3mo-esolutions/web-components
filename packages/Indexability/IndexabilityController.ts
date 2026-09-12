import { Controller, ElementRefs, type DirectiveResult, type ReactiveElement } from '@a11d/lit'

export type IndexabilityItemOptions<TData = unknown> = {
	/** The item's position in the owner's data, never DOM order: items may live in separate shadow roots. */
	readonly index: number
	/** The datum this element renders, for consumers which resolve an event to a value. */
	readonly data?: TData
	/** Keeps its place in the order, but interactions are expected to refuse to act on it. */
	readonly disabled?: boolean
}

export type IndexabilityItem<TData = unknown, TItemOptions extends IndexabilityItemOptions<TData> = IndexabilityItemOptions<TData>> = {
	readonly element: HTMLElement
	readonly options: TItemOptions
}

/** Notified as the registry changes. `handleItemUpdated` runs during the host's render. */
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
 * It owns no gesture, no state and no styling. It is the substrate the controllers which do own those
 * build on, so that an item declares itself once however many interactions it takes part in:
 *
 * ```ts
 * readonly indexability = new IndexabilityController<Person, ItemOptions>(this)
 * readonly selectability = new SelectabilityController(this, { indexability: this.indexability })
 * ```
 *
 * Items no template can put a directive on are registered through {@link register} and {@link unregister}.
 * Only rendered items are known here, so anything needing the full universe takes it from the owner's data.
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

	private readonly elements = new ElementRefs<HTMLElement, TItemOptions>({
		updated: (element, options) => {
			for (const observer of this.observers) {
				observer.handleItemUpdated?.({ element, options })
			}
		},
		disconnected: element => {
			for (const observer of this.observers) {
				observer.handleItemRemoved?.(element)
			}
		},
	})

	/** Registers the element it is rendered on, with what it renders. */
	readonly item = (options: TItemOptions): DirectiveResult => this.elements.ref(options)

	/** The rendered items in ascending declared index. */
	get items(): ReadonlyArray<IndexabilityItem<TData, TItemOptions>> {
		return [...this.elements]
			.map(element => ({ element, options: this.elements.get(element)! }))
			.sort((a, b) => a.options.index - b.options.index)
	}

	/** The rendered items' data in declared order. Items registered without data are skipped. */
	get data(): ReadonlyArray<TData> {
		return this.items
			.map(item => item.options.data)
			.filter(data => data !== undefined) as ReadonlyArray<TData>
	}

	/** The nearest registered item an event landed on, resolved through {@link Event.composedPath}. */
	itemAt(path: ReadonlyArray<EventTarget>): IndexabilityItem<TData, TItemOptions> | undefined {
		for (const target of path) {
			const options = this.elements.get(target as HTMLElement)
			if (options) {
				return { element: target as HTMLElement, options }
			}
		}
		return undefined
	}

	register(element: HTMLElement, options: TItemOptions) {
		this.elements.set(element, options)
	}

	unregister(element: HTMLElement) {
		this.elements.delete(element)
	}
}