import { Component, component, css, event, eventListener, html, property } from '@a11d/lit'
import { Selectability } from '@3mo/selectability'
import { SlotController } from '@3mo/slot-controller'
import { TreeController } from './TreeController.js'
import { TreeItem } from './TreeItem.js'

/**
 * @element mo-tree
 *
 * A hierarchy to browse, select from and act on — the WAI-ARIA tree view, written as nested `mo-tree-item`s.
 *
 * ```html
 * <mo-tree selectability='single'>
 *   <mo-tree-item value='documents' open>Documents
 *     <mo-tree-item value='taxes'>Taxes</mo-tree-item>
 *   </mo-tree-item>
 * </mo-tree>
 * ```
 *
 * Which rows are open is the items' own state — `open` on each of them, which they report as `openChange`.
 * The selection is the tree's, since only one row can hold it, and it reports the items by their `value`.
 *
 * @attr selectability - `single` or `multiple`; unset, items are not selectable and a click opens instead.
 * @attr value - The selected item, or the selected items while `multiple`.
 *
 * @slot - The items.
 *
 * @fires change - The new value, whenever the selection changes through the tree.
 */
@component('mo-tree')
export class Tree extends Component {
	@event() readonly change!: EventDispatcher<string | Array<string> | undefined>

	override readonly role = 'tree'

	@property({ reflect: true }) selectability?: Selectability
	@property({ type: Object, bindingDefault: true, event: 'change' }) value?: string | Array<string>

	protected readonly slotController = new SlotController(this, () => this.handleItemsChange())

	readonly controller = new TreeController<TreeItem, Tree>(this, host => ({
		get items() { return host.items },
		children: item => item.items,
		isDisabled: item => item.disabled,
		get selectability() { return host.selectability },
		get selection() { host.seed(); return host.itemsOf(host.value === undefined ? [] : [host.value].flat()) },
		handleSelectionChange: selection => {
			const values = selection.map(item => item.value!)
			host.value = host.selectability === Selectability.Multiple ? values : values[0]
			host.change.dispatch(host.value)
		},
		get expanded() { return host.openItems },
		handleExpandedChange: expanded => {
			const open = new Set(expanded)
			for (const item of host.allItems) {
				item.open = open.has(item)
			}
			host.openItemsCache = undefined
		},
		// Selectable items spend the click on the selection, leaving the indicator to open the row.
		get expandOnClick() { return !host.selectability },
	}))

	/** The root items. */
	get items() {
		return this.rootItems ??= [...this.children].filter((child): child is TreeItem => child instanceof TreeItem)
	}

	/** Opens the item's ancestors and puts the cursor on it. */
	reveal(item: string | TreeItem) {
		return this.controller.reveal(this.itemOf(item)!)
	}

	expandAll(...parameters: Parameters<typeof this.controller.expandability.expandAll>) {
		return this.controller.expandability.expandAll(...parameters)
	}

	collapseAll(...parameters: Parameters<typeof this.controller.expandability.collapseAll>) {
		return this.controller.expandability.collapseAll(...parameters)
	}

	selectAll(...parameters: Parameters<typeof this.controller.selectability.selectAll>) {
		return this.controller.selectability.selectAll(...parameters)
	}

	deselectAll(...parameters: Parameters<typeof this.controller.selectability.deselectAll>) {
		return this.controller.selectability.deselectAll(...parameters)
	}

	override focus(options?: FocusOptions) {
		const element = this.controller.focusableElement
		if (element) {
			element.focus(options)
		} else {
			super.focus(options)
		}
	}

	private rootItems?: Array<TreeItem>
	private nestedItems?: Array<TreeItem>
	private openItemsCache?: Array<TreeItem>
	private seeded = false

	/** Which rows are open, which is each item's own `open` and nobody else's. */
	private get openItems() {
		return this.openItemsCache ??= this.allItems.filter(item => item.open)
	}

	/** An item was opened or closed — by the tree, or by whoever else holds it. */
	@eventListener('openChange')
	protected handleItemOpenChange(event: Event) {
		if (event.target instanceof TreeItem && this.allItems.includes(event.target)) {
			// A row of this tree opening is the tree's business and nobody else's, the way the platform
			// keeps a `details` element's `toggle` to itself: an `openChange` allowed to travel on reaches
			// every ancestor which two-way binds an `open` of its own, and closes it.
			event.stopPropagation()
			this.openItemsCache = undefined
			this.requestUpdate()
		}
	}

	private get allItems(): Array<TreeItem> {
		const flatten = (items: Array<TreeItem>): Array<TreeItem> => items.flatMap(item => [item, ...flatten(item.items)])
		return this.nestedItems ??= flatten(this.items)
	}

	private itemOf(value: string | TreeItem) {
		return value instanceof TreeItem ? value : this.allItems.find(item => item.value === value)
	}

	private itemsOf(values: ReadonlyArray<string>) {
		return values.map(value => this.itemOf(value)).filter((item): item is TreeItem => !!item)
	}

	private handleItemsChange() {
		this.rootItems = undefined
		this.nestedItems = undefined
		this.openItemsCache = undefined
		this.controller.invalidate()
	}

	private seed() {
		if (this.seeded || !this.items.length) {
			return
		}
		this.seeded = true
		const selected = this.allItems.filter(item => item.selected).map(item => item.value!)
		if (this.value === undefined && selected.length) {
			this.value = this.selectability === Selectability.Multiple ? selected : selected[0]
		}
	}

	protected override willUpdate() {
		for (const item of this.allItems) {
			item.selected = this.controller.selectability.isSelected(item)
		}
	}

	static override get styles() {
		return css`
			:host {
				display: block;
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tree': Tree
	}
}