import { Component, component, css, event, eventListener, html, isServer, property } from '@a11d/lit'
import { Selectability } from '@3mo/selectability'
import { SlotController } from '@3mo/slot-controller'
import { TreeController } from './TreeController.js'
import { TreeItem } from './TreeItem.js'

/**
 * A hierarchy to browse and select from, written as nested `mo-tree-item`s.
 *
 * @element mo-tree
 *
 * @attr selectability - `single` or `multiple`; unset, items are not selectable and a click opens instead.
 * @attr value - The selected item, or the selected items while `multiple`.
 *
 * @slot - The items.
 *
 * @fires change - The new value, whenever the selection changes through the tree.
 *
 * @accessibility
 * A `tree`, with `aria-multiselectable` while multiple. Items are `treeitem`s with `aria-level`, `aria-setsize` and `aria-posinset`, `aria-expanded` on parents, `aria-selected` while the tree has a `selectability`, and `aria-disabled`; children sit in a `group`. Focus roves over the visible items.
 *
 * | Key | Does |
 * | --- | --- |
 * | `ArrowDown` `ArrowUp` | The next or previous visible item. |
 * | `ArrowRight` | Opens a closed parent, or moves to the first child of an open one. |
 * | `ArrowLeft` | Closes an open parent, or moves to the parent. |
 * | `Home` `End`, `PageUp` `PageDown` | The first or last visible item, or a page further. |
 * | `*` | Opens every sibling of the item. |
 * | A letter | Typeahead. |
 * | `Enter` | Clicks the item: selects it, or opens and closes a parent while the tree has no `selectability`. |
 * | `Space` | With a `selectability`: selects the item, or toggles it while multiple. |
 * | `Shift` + an arrow, `Ctrl` `A` | Multiple: extends the selection, or selects all. |
 *
 * The arrows stop at the ends rather than wrapping. Name the tree with `aria-label` or `aria-labelledby`.
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
		return this.rootItems ??= isServer ? [] : [...this.children].filter((child): child is TreeItem => child instanceof TreeItem)
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
