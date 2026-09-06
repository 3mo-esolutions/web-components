import { Controller, type ReactiveControllerHost, type ReactiveElement } from '@a11d/lit'
import { IndexabilityController, type IndexabilityItem, type IndexabilityItemOptions } from '@3mo/indexability'

export enum ExpandabilityAllState {
	None = 'none',
	Some = 'some',
	All = 'all',
}

export type ExpandabilityState = 'expanded' | 'collapsed' | 'loading' | 'failed'

export type ExpandabilityChange<T> = {
	readonly expanded: ReadonlyArray<T>
	readonly added: ReadonlyArray<T>
	readonly removed: ReadonlyArray<T>
}

export interface ExpandabilityItemOptions<T> extends IndexabilityItemOptions<T> {
	readonly data: T
}

export interface ExpandabilityControllerOptions<T> {
	/** The owner's full universe, rendered or not. */
	readonly items: ReadonlyArray<T>
	/** Identity. Defaults to the item itself. */
	readonly key?: (item: T) => unknown
	readonly isExpandable?: (item: T) => boolean
	/** Given, the host owns the state and commits the controller's answer in {@link handleChange}. */
	readonly expanded?: ReadonlyArray<T>
	readonly handleChange?: (change: ExpandabilityChange<T>) => void
	/** Defaults to `true`. */
	readonly multiple?: boolean
	/** Single mode only: the items that stay open when `item` opens. */
	readonly ancestorsOf?: (item: T) => ReadonlyArray<T>
	/** Awaited once before the item first opens. It stamps `loading` meanwhile and `failed` if it rejects. */
	readonly load?: (item: T) => Promise<unknown>
	/** Off, for a host that announces expansion itself. Defaults to `true`. */
	readonly stamping?: boolean
	readonly indexability?: IndexabilityController<T, ExpandabilityItemOptions<T>>
}

/**
 * Which items of a COLLECTION are open — selectability's shape applied to "open". A lone disclosure needs
 * none of it: a native `details` element keeps its own state and animates it itself.
 *
 * ```ts
 * readonly expandability = new ExpandabilityController<Folder>(this, host => ({
 *   get items() { return host.folders },
 *   get expanded() { return host.expanded },
 *   handleChange: ({ expanded }) => host.expanded = [...expanded],
 * }))
 * ```
 *
 * Identity is a `key`, so the same items stay open when a refetch hands back equal data as new objects.
 */
export class ExpandabilityController<T, THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller {
	readonly indexability: IndexabilityController<T, ExpandabilityItemOptions<T>>

	protected readonly options: ExpandabilityControllerOptions<T>

	constructor(protected override readonly host: THost, options: ExpandabilityControllerOptions<T> | ((host: THost) => ExpandabilityControllerOptions<T>)) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		this.indexability = this.options.indexability ?? new IndexabilityController<T, ExpandabilityItemOptions<T>>(host as unknown as ReactiveElement)
		this.indexability.observe({ handleItemUpdated: item => this.stampItem(item) })
	}

	private internalExpanded: ReadonlyArray<T> = []
	private readonly loading = new Set<unknown>()
	private readonly failed = new Set<unknown>()
	private readonly loaded = new Set<unknown>()
	private keyCache?: { readonly expanded: ReadonlyArray<T>, readonly keys: ReadonlySet<unknown> }

	/** Registers an item: `<li ${controller.item({ index, data })}>`. */
	get item() { return this.indexability.item }

	protected get items(): ReadonlyArray<T> { return this.options.items }
	private get expandableItems(): ReadonlyArray<T> { return this.items.filter(item => this.isExpandable(item)) }
	private get multiple() { return this.options.multiple ?? true }
	private get stamping() { return this.options.stamping ?? true }

	get expanded(): ReadonlyArray<T> { return this.options.expanded ?? this.internalExpanded }
	set expanded(items: ReadonlyArray<T>) {
		this.commit(items)
	}

	protected keyOf(item: T) { return this.options.key?.(item) ?? item }
	isExpandable(item: T) { return this.options.isExpandable?.(item) ?? true }
	isExpanded(item: T) { return this.expandedKeys.has(this.keyOf(item)) }
	isLoading(item: T) { return this.loading.has(this.keyOf(item)) }
	private hasFailed(item: T) { return this.failed.has(this.keyOf(item)) }

	stateOf(item: T): ExpandabilityState {
		return this.isLoading(item) ? 'loading' : this.hasFailed(item) ? 'failed' : this.isExpanded(item) ? 'expanded' : 'collapsed'
	}

	get allState(): ExpandabilityAllState {
		const expandable = this.expandableItems
		const keys = this.expandedKeys
		const expanded = expandable.filter(item => keys.has(this.keyOf(item))).length
		return expanded === 0 ? ExpandabilityAllState.None
			: expanded === expandable.length ? ExpandabilityAllState.All
				: ExpandabilityAllState.Some
	}

	private get expandedKeys(): ReadonlySet<unknown> {
		const expanded = this.expanded
		if (this.keyCache?.expanded !== expanded) {
			this.keyCache = { expanded, keys: new Set(expanded.map(item => this.keyOf(item))) }
		}
		return this.keyCache.keys
	}

	override hostUpdated() {
		this.stamp()
	}

	/** Resolves once the item is open, or once loading its children failed. */
	async expand(item: T): Promise<void> {
		if (!this.isExpandable(item) || this.isExpanded(item)) {
			return
		}
		const key = this.keyOf(item)
		if (this.options.load && !this.loaded.has(key)) {
			if (this.loading.has(key)) {
				return
			}
			this.loading.add(key)
			this.failed.delete(key)
			this.stamp()
			this.host.requestUpdate()
			try {
				await this.options.load(item)
				this.loaded.add(key)
			} catch (error) {
				this.failed.add(key)
				this.stamp()
				this.host.requestUpdate()
				throw error
			} finally {
				this.loading.delete(key)
			}
		}
		const kept = this.multiple
			? this.expanded
			: this.expanded.filter(candidate => this.options.ancestorsOf?.(item).some(ancestor => this.keyOf(ancestor) === this.keyOf(candidate)) ?? false)
		this.commit([...kept, item])
	}

	collapse(item: T) {
		if (this.isExpanded(item)) {
			this.commit(this.without(this.expanded, [item]))
		}
	}

	toggle(item: T) {
		return this.isExpanded(item) ? Promise.resolve(this.collapse(item)) : this.expand(item)
	}

	expandAll() {
		if (this.multiple) {
			this.commit(this.expandableItems.filter(item => !this.options.load || this.loaded.has(this.keyOf(item))))
		}
	}

	collapseAll() {
		this.commit([])
	}

	toggleAll() {
		if (this.allState === ExpandabilityAllState.None) {
			this.expandAll()
		} else {
			this.collapseAll()
		}
	}

	/** The owner replaced its items: the same ones stay open, resolved by key. {@link collapseAll} to start closed instead. */
	handleItemsChange() {
		const keys = this.expandedKeys
		this.commit(this.items.filter(item => keys.has(this.keyOf(item))))
	}

	private without(items: ReadonlyArray<T>, removed: ReadonlyArray<T>) {
		const keys = new Set(removed.map(item => this.keyOf(item)))
		return items.filter(item => !keys.has(this.keyOf(item)))
	}

	private constrain(items: ReadonlyArray<T>) {
		const seen = new Set<unknown>()
		const constrained = new Array<T>()
		for (const item of items) {
			const key = this.keyOf(item)
			if (this.isExpandable(item) && !seen.has(key)) {
				seen.add(key)
				constrained.push(item)
			}
		}
		return constrained
	}

	private commit(next: ReadonlyArray<T>) {
		const expanded = this.constrain(next)
		const previous = this.expanded
		if (expanded.length === previous.length && expanded.every((item, index) => item === previous[index])) {
			return
		}
		const previousKeys = this.expandedKeys
		const keys = new Set(expanded.map(item => this.keyOf(item)))
		const added = expanded.filter(item => !previousKeys.has(this.keyOf(item)))
		const removed = previous.filter(item => !keys.has(this.keyOf(item)))
		this.internalExpanded = expanded
		this.options.handleChange?.({ expanded, added, removed })
		this.host.requestUpdate()
		this.stamp()
	}

	private stamp() {
		if (this.stamping) {
			for (const item of this.indexability.items) {
				this.stampItem(item)
			}
		}
	}

	private stampItem({ element, options }: IndexabilityItem<T, ExpandabilityItemOptions<T>>) {
		if (!this.stamping) {
			return
		}
		if (!this.isExpandable(options.data)) {
			delete element.dataset.expandability
			element.removeAttribute('aria-expanded')
			return
		}
		const state = this.stateOf(options.data)
		element.dataset.expandability = state
		element.setAttribute('aria-expanded', String(state === 'expanded'))
	}
}