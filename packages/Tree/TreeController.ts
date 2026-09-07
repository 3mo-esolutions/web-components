import { Controller, eventListener, type ReactiveControllerHost, type ReactiveElement } from '@a11d/lit'
import { IndexabilityController, type IndexabilityItem, type IndexabilityItemOptions } from '@3mo/indexability'
import { NavigabilityController } from '@3mo/navigability'
import { ExpandabilityController, type ExpandabilityChange } from '@3mo/expandability'
import { SelectabilityController, Selectability, SelectabilityInteraction } from '@3mo/selectability'
import { Hierarchy, type HierarchyNode } from '@3mo/hierarchy'

export interface TreeControllerOptions<T extends HTMLElement> {
	/** The root items. */
	readonly items: ReadonlyArray<T>
	readonly children: (item: T) => ReadonlyArray<T>
	/** Neither navigable nor selectable. */
	readonly isDisabled?: (item: T) => boolean
	readonly selectability?: Selectability
	readonly selection?: ReadonlyArray<T>
	readonly handleSelectionChange?: (selection: ReadonlyArray<T>) => void
	readonly expanded?: ReadonlyArray<T>
	readonly handleExpandedChange?: (expanded: ReadonlyArray<T>) => void
	/** Whether the row toggles a parent, not only its indicator. Defaults to `true`. */
	readonly expandOnClick?: boolean
}

export interface TreeItemOptions<T> extends IndexabilityItemOptions<T> {
	readonly data: T
}

type TreeHost = ReactiveControllerHost & EventTarget

/**
 * The WAI-ARIA tree view pattern over a hierarchy of elements
 *
 * ```ts
 * readonly tree = new TreeController<HTMLElement>(this, host => ({
 *   get items() { return host.roots },
 *   children: item => [...item.querySelectorAll(':scope > .children > .item')],
 * }))
 * ```
 *
 * It registers the items on screen with one {@link IndexabilityController} and hands that to
 * {@link ExpandabilityController}, {@link SelectabilityController} and {@link NavigabilityController},
 * which then keep the expansion, the selection and the cursor — and stamp their own ARIA — themselves.
 * What it adds is what none of them knows alone: the hierarchy and the sequence it renders as, Right and
 * Left, the asterisk, Space, Enter as a click, the level a row indents by, and revealing an item.
 *
 * A click on `part~=indicator` toggles without selecting; anything else selects. Hiding a closed item's
 * children is the host's.
 */
export class TreeController<T extends HTMLElement, THost extends TreeHost = TreeHost> extends Controller {
	protected readonly model: Hierarchy<T>
	readonly indexability: IndexabilityController<T, TreeItemOptions<T>>
	readonly expandability: ExpandabilityController<T, THost>
	readonly selectability: SelectabilityController<T, TreeItemOptions<T>>
	readonly navigability: NavigabilityController<T, THost>

	protected readonly options: TreeControllerOptions<T>

	private registered = new Set<T>()
	private visibleCache?: {
		readonly nodes: ReadonlyArray<HierarchyNode<T>>
		readonly expanded: ReadonlyArray<T>
		readonly visible: ReadonlyArray<HierarchyNode<T>>
		readonly items: ReadonlyArray<T>
	}

	constructor(protected override readonly host: THost, options: TreeControllerOptions<T> | ((host: THost) => TreeControllerOptions<T>)) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		const controller = this

		this.model = new Hierarchy<T>({ children: item => controller.options.children(item) })

		this.indexability = new IndexabilityController<T, TreeItemOptions<T>>(host as unknown as ReactiveElement)
		this.indexability.observe({ handleItemUpdated: item => this.stamp(item) })

		this.expandability = new ExpandabilityController<T, THost>(host, {
			get items() { return controller.nodes.filter(node => node.hasChildren).map(node => node.data) },
			isExpandable: item => controller.nodeOf(item)?.hasChildren ?? false,
			get expanded() { return controller.options.expanded },
			handleChange: change => controller.handleExpandedChange(change),
			indexability: this.indexability,
		})

		this.selectability = new SelectabilityController<T, TreeItemOptions<T>>(host as unknown as ReactiveElement, {
			get selectability() { return controller.options.selectability },
			get items() { return controller.visibleItems },
			isSelectable: item => !controller.isDisabled(item),
			get selection() { return controller.options.selection },
			handleChange: change => controller.options.handleSelectionChange?.(change.selection),
			// A click on the indicator must not select, and only the anatomy tells the two apart.
			interaction: SelectabilityInteraction.Manual,
			get stamping() { return !!controller.options.selectability },
			indexability: this.indexability,
		})

		this.navigability = new NavigabilityController<T, THost>(host, {
			get items() { return controller.visibleItems },
			isNavigable: item => !controller.isDisabled(item),
			typeahead: true,
			handleChange: change => controller.selectability.follow(change.item, change.event),
			handleKeyDown: (event, item) => controller.handleKeyDown(event, item),
			indexability: this.indexability as unknown as IndexabilityController<T>,
		})

		// Last in the host's controller order, so that its stamps land after the primitives have moved.
		host.removeController(this)
		host.addController(this)
	}

	/** The items changed shape — a row was added to or removed from the hierarchy. */
	invalidate() {
		this.model.invalidate()
	}

	/** The hierarchy with its roots up to date, so that a node resolves before the first render too. */
	private get syncedModel() {
		this.model.roots = this.options.items
		return this.model
	}

	get nodes() {
		return this.syncedModel.nodes
	}

	/** The nodes on screen: the roots and the children of every expanded node, in reading order. */
	get visible(): ReadonlyArray<HierarchyNode<T>> {
		const nodes = this.nodes
		const expanded = this.expandability.expanded
		const cache = this.visibleCache
		if (cache && cache.nodes === nodes && cache.expanded === expanded) {
			return cache.visible
		}
		const visible = this.model.visible({ isExpanded: node => this.expandability.isExpanded(node.data) })
		this.visibleCache = { nodes, expanded, visible, items: visible.map(node => node.data) }
		return visible
	}

	private get visibleItems(): ReadonlyArray<T> {
		this.visible
		return this.visibleCache!.items
	}

	nodeOf(item: T) {
		return this.syncedModel.get(item)
	}

	private isDisabled(item: T) {
		return this.options.isDisabled?.(item) ?? false
	}

	/** The current item, or the first navigable one. */
	get focusableElement(): T | undefined {
		return this.navigability.current ?? this.visibleItems.find(item => !this.isDisabled(item))
	}

	/** Opens the item's ancestors and puts the cursor on it. */
	async reveal(item: T) {
		const node = this.nodeOf(item)
		if (!node) {
			return
		}
		for (const ancestor of node.ancestors) {
			await this.expandability.expand(ancestor.data)
		}
		this.navigability.goTo(item)
		this.host.requestUpdate()
	}

	/** The rows on screen ARE the registry, so that the primitives resolve every event and stamp every
	 * state of their own onto the same items. Before the render for a host whose items are its light-DOM
	 * children, and after it for one that renders them itself. */
	override hostUpdate() {
		this.register()
	}

	override hostUpdated() {
		this.register()
	}

	private register() {
		const registered = new Set<T>()
		for (const [index, node] of this.visible.entries()) {
			registered.add(node.data)
			this.indexability.register(node.data, { index, data: node.data, disabled: this.isDisabled(node.data) })
		}
		for (const item of this.registered) {
			if (!registered.has(item)) {
				this.indexability.unregister(item)
				item.removeAttribute('tabindex')
				delete item.dataset.navigability
			}
		}
		this.registered = registered
	}

	/** What the hierarchy knows and no primitive does. */
	private stamp({ element, options }: IndexabilityItem<T, TreeItemOptions<T>>) {
		const node = this.nodeOf(options.data)
		if (!node) {
			return
		}
		element.setAttribute('role', 'treeitem')
		element.setAttribute('aria-level', String(node.level + 1))
		element.setAttribute('aria-setsize', String(node.setSize))
		element.setAttribute('aria-posinset', String(node.position + 1))
		element.style.setProperty('--mo-tree-level', String(node.level))
		if (this.isDisabled(options.data)) {
			element.setAttribute('aria-disabled', 'true')
		} else {
			element.removeAttribute('aria-disabled')
		}
		if (!this.options.selectability) {
			// Selectability stamps nothing while it is off, so what it stamped before is cleared here.
			element.removeAttribute('aria-selected')
			delete element.dataset.selectability
		}
	}

	private partOf(path: ReadonlyArray<EventTarget>, name: string) {
		return path.some(target => target instanceof Element && (target.getAttribute('part')?.split(' ').includes(name) ?? false))
	}

	@eventListener('click')
	protected handleClick(event: MouseEvent) {
		const path = event.composedPath()
		const item = this.indexability.itemAt(path)?.options.data
		const node = item === undefined ? undefined : this.nodeOf(item)
		if (!node || this.isDisabled(node.data)) {
			return
		}
		if (this.partOf(path, 'indicator')) {
			this.expandability.toggle(node.data)
			return
		}
		this.navigability.goTo(node.data, { method: 'pointer', event })
		this.selectability.select(node.data, { event })
		if ((this.options.expandOnClick ?? true) && node.hasChildren) {
			this.expandability.toggle(node.data)
		}
	}

	private handleKeyDown(event: KeyboardEvent, item: T | undefined): boolean {
		const rtl = this.host instanceof Element && getComputedStyle(this.host).direction === 'rtl'
		const right = rtl ? 'ArrowLeft' : 'ArrowRight'
		const left = rtl ? 'ArrowRight' : 'ArrowLeft'

		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && this.options.selectability === Selectability.Multiple) {
			this.selectability.selectAll()
			return true
		}

		const node = item === undefined ? undefined : this.nodeOf(item)
		if (!node) {
			return false
		}

		switch (event.key) {
			case right:
				if (node.hasChildren && !this.expandability.isExpanded(node.data)) {
					this.expandability.expand(node.data)
				} else if (node.children?.length && this.expandability.isExpanded(node.data)) {
					this.navigability.goTo(node.children[0]!.data, { method: 'keyboard', event })
				}
				return true
			case left:
				if (this.expandability.isExpanded(node.data)) {
					this.expandability.collapse(node.data)
				} else if (node.parent) {
					this.navigability.goTo(node.parent.data, { method: 'keyboard', event })
				}
				return true
			case '*':
				for (const sibling of node.siblings) {
					if (sibling.hasChildren) {
						this.expandability.expand(sibling.data)
					}
				}
				return true
			case 'Enter':
				node.data.click()
				return true
			case ' ':
				if (!this.options.selectability) {
					return false
				}
				this.selectability.select(node.data, this.options.selectability === Selectability.Multiple ? { preserve: true, event } : { event })
				return true
			default:
				return false
		}
	}

	private handleExpandedChange(change: ExpandabilityChange<T>) {
		this.options.handleExpandedChange?.(change.expanded)
		// The cursor was inside a subtree that just closed: it moves to the item that closed it.
		const current = this.navigability.current
		if (current !== undefined && change.removed.length) {
			const ancestor = this.nodeOf(current)?.ancestors.find(candidate => change.removed.includes(candidate.data))
			if (ancestor) {
				this.navigability.goTo(ancestor.data)
			}
		}
		this.host.requestUpdate()
	}
}