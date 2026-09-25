import { component, event, eventListener, property } from '@a11d/lit'
import { Selectability } from '@3mo/selectability'
import { List } from './List.js'
import { ListboxController } from './ListboxController.js'

export { SelectionListItemChangeEvent } from './SelectionListItemChangeEvent.js'

export { Selectability as SelectableListSelectability } from '@3mo/selectability'

/**
 * @element mo-selectable-list
 *
 * @attr selectability - The selectability of the list
 * @attr value - The selected list items' indices
 *
 * @slot - Default slot for list items
 *
 * @fires change - Dispatched when the selected list items change
 */
@component('mo-selectable-list')
export class SelectableList extends List {
	@event() readonly change!: EventDispatcher<Array<number>>

	@property({ type: Array, bindingDefault: true, updated(this: SelectableList) { this.syncItems() } }) value = new Array<number>()
	@property() selectability = Selectability.Single

	protected readonly listbox = new ListboxController<HTMLElement>(this, host => {
		const list = host as SelectableList
		return {
			get items() { return list.items },
			get selectability() { return list.selectability },
			wrap: true,
			get selection() { return list.selectionFromValue },
			handleChange: selection => {
				list.value = selection.map(item => list.items.indexOf(item))
				list.syncItems()
				list.change.dispatch(list.value)
			},
		}
	})

	private get selectionFromValue() {
		return this.value
			.map(index => this.items[index])
			.filter((item): item is HTMLElement => !!item)
	}

	@eventListener('itemsChange')
	protected handleItemsChange() {
		this.listbox.indexability.setItems(this.items, (item, index) => ({ index, data: item, disabled: isDisabled(item) }))
		this.syncItems()
	}

	/** Items render their own state, so each is told the list's answer. */
	private syncItems() {
		const selection = this.selectionFromValue
		for (const item of this.items) {
			const selected = selection.includes(item)
			if ('selected' in item) {
				(item as HTMLElement & { selected: unknown }).selected = selected
			} else {
				item.toggleAttribute('selected', selected)
			}
		}
	}

}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-list': SelectableList
	}
}
/** The property where there is one, as its attribute reflects only once the item has updated. */
function isDisabled(item: HTMLElement) {
	return 'disabled' in item ? !!item.disabled : item.hasAttribute('disabled')
}