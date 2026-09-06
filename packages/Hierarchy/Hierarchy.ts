export class HierarchyNode<T> {
	/** `undefined` for a leaf and for a node whose children are not loaded yet. */
	readonly children: ReadonlyArray<HierarchyNode<T>> | undefined = undefined
	readonly siblings: ReadonlyArray<HierarchyNode<T>> = []

	constructor(
		readonly data: T,
		readonly key: unknown,
		readonly parent: HierarchyNode<T> | undefined,
		/** 0-based depth; `aria-level` is `level + 1`. */
		readonly level: number,
		/** Position in the pre-order sequence of ALL nodes, expanded or not. */
		readonly index: number,
		/** 0-based position among its siblings; `aria-posinset` is `position + 1`. */
		readonly position: number,
		/** Number of siblings including itself; `aria-setsize`. */
		readonly setSize: number,
		/** Known children, or unloaded ones declared through `hasChildren`. */
		readonly hasChildren: boolean,
	) { }

	/** Root first. */
	get ancestors(): ReadonlyArray<HierarchyNode<T>> {
		const ancestors = new Array<HierarchyNode<T>>()
		for (let current = this.parent; current; current = current.parent) {
			ancestors.unshift(current)
		}
		return ancestors
	}

	/** Pre-order. */
	get descendants(): ReadonlyArray<HierarchyNode<T>> {
		return this.children?.flatMap(child => [child, ...child.descendants]) ?? []
	}
}

export type HierarchyFilterMode =
	/** A match brings its subtree along. */
	| 'subtree'
	/** Only the matches themselves. */
	| 'match'

export interface HierarchyVisibilityOptions<T> {
	readonly isExpanded: (node: HierarchyNode<T>) => boolean
	/** Leaves out a node and its subtree. */
	readonly isIncluded?: (node: HierarchyNode<T>) => boolean
}

export interface HierarchyOptions<T> {
	/** Identity. Defaults to the datum itself. */
	readonly key?: (data: T) => unknown
	/** `undefined` or empty for a leaf. */
	readonly children: (data: T) => ReadonlyArray<T> | undefined | null
	/** Declares children that are not loaded yet, so a node offers to expand before it has any. */
	readonly hasChildren?: (data: T) => boolean
	/** Applied to every sibling set. */
	readonly sort?: (a: T, b: T) => number
}

/**
 * A hierarchy as the flat, ordered sequence every item-wise controller reads: the nodes in pre-order,
 * each knowing its parent, level, position and set size, plus what is visible under an expansion state
 * and what survives a filter.
 *
 * ```ts
 * const model = new Hierarchy<Folder>({ children: folder => folder.folders, key: folder => folder.path })
 * model.roots = folders
 * model.visible({ isExpanded: node => expanded.has(node.key) })
 * ```
 *
 * The nodes are derived once and memoised until `roots` is assigned, children are loaded or
 * {@link invalidate} is called. {@link visible} walks them per call; memoise it where that matters.
 */
export class Hierarchy<T> {
	constructor(private readonly options: HierarchyOptions<T>) { }

	private _roots: ReadonlyArray<T> = []
	private readonly loadedChildren = new Map<unknown, ReadonlyArray<T>>()
	private cache?: { readonly nodes: ReadonlyArray<HierarchyNode<T>>, readonly byKey: ReadonlyMap<unknown, HierarchyNode<T>> }

	get roots() { return this._roots }
	set roots(value: ReadonlyArray<T>) {
		if (value !== this._roots) {
			this._roots = value
			this.invalidate()
		}
	}

	keyOf(data: T): unknown {
		return this.options.key?.(data) ?? data
	}

	/** For when an answer of the options changed without the roots doing so — a sort, say. */
	invalidate() {
		this.cache = undefined
	}

	/** Every node in pre-order. */
	get nodes(): ReadonlyArray<HierarchyNode<T>> {
		return this.derive().nodes
	}

	get(data: T): HierarchyNode<T> | undefined {
		return this.derive().byKey.get(this.keyOf(data))
	}

	/** Hands a lazily loaded node its children, which from then on take precedence over `children(data)`. */
	setChildren(data: T, children: ReadonlyArray<T>) {
		this.loadedChildren.set(this.keyOf(data), children)
		this.invalidate()
	}

	isLoaded(data: T) {
		return this.loadedChildren.has(this.keyOf(data))
	}

	/**
	 * Every root and the children of every expanded node, in pre-order. A node `isIncluded` rejects is
	 * left out along with its subtree, which is how a filter prunes.
	 */
	visible(options: HierarchyVisibilityOptions<T>): ReadonlyArray<HierarchyNode<T>> {
		const visible = new Array<HierarchyNode<T>>()
		const walk = (siblings: ReadonlyArray<HierarchyNode<T>>) => {
			for (const node of siblings) {
				if (options.isIncluded?.(node) === false) {
					continue
				}
				visible.push(node)
				if (node.children && options.isExpanded(node)) {
					walk(node.children)
				}
			}
		}
		walk(this.nodes.filter(node => node.level === 0))
		return visible
	}

	/** The keys that survive a filter: the matches, their ancestors either way as the context that keeps them meaningful, and their subtrees unless asked otherwise. */
	filter(predicate: (data: T) => boolean, mode: HierarchyFilterMode = 'subtree'): ReadonlySet<unknown> {
		const keys = new Set<unknown>()
		for (const node of this.nodes) {
			if (predicate(node.data)) {
				for (const ancestor of node.ancestors) {
					keys.add(ancestor.key)
				}
				keys.add(node.key)
				if (mode === 'subtree') {
					for (const descendant of node.descendants) {
						keys.add(descendant.key)
					}
				}
			}
		}
		return keys
	}

	private derive() {
		if (this.cache) {
			return this.cache
		}
		const nodes = new Array<HierarchyNode<T>>()
		const byKey = new Map<unknown, HierarchyNode<T>>()
		const build = (data: ReadonlyArray<T>, parent: HierarchyNode<T> | undefined, level: number): ReadonlyArray<HierarchyNode<T>> => {
			const sorted = this.options.sort ? [...data].sort(this.options.sort) : data
			const siblings = sorted.map((datum, position) => {
				const key = this.keyOf(datum)
				const childrenData = this.loadedChildren.get(key) ?? this.options.children(datum) ?? undefined
				const hasChildren = (childrenData?.length ?? 0) > 0 || (childrenData === undefined && (this.options.hasChildren?.(datum) ?? false))
				const node = new HierarchyNode(datum, key, parent, level, nodes.length, position, sorted.length, hasChildren)
				nodes.push(node)
				byKey.set(key, node)
				if (childrenData?.length) {
					(node as { children: ReadonlyArray<HierarchyNode<T>> }).children = build(childrenData, node, level + 1)
				}
				return node
			})
			for (const node of siblings) {
				(node as { siblings: ReadonlyArray<HierarchyNode<T>> }).siblings = siblings
			}
			return siblings
		}
		build(this._roots, undefined, 0)
		return this.cache = { nodes, byKey }
	}
}