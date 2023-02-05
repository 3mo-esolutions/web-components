import { component, event, eventListener, property, queryAsync } from '@a11d/lit'
import { List } from './List.js'

export class SelectionListItemChangeEvent<T> extends CustomEvent<T> {
	static readonly type = 'change'
	readonly selected: boolean
	constructor(value: T, selected: boolean) {
		super(SelectionListItemChangeEvent.type, { bubbles: true, detail: value })
		this.selected = selected
	}
}

export const enum SelectableListSelectionMode {
	Single = 'single',
	Multiple = 'multiple',
}

/**
 * @element mo-selectable-list
 *
 * @attr selectionMode - The selection mode of the list
 * @attr value - The selected list items' indices
 *
 * @slot - Default slot for list items
 *
 * @fires change - Fired when the selected list items change
 */
@component('mo-selectable-list')
export class SelectableList extends List {
	@event() readonly change!: EventDispatcher<Array<number>>

	@property({ type: Array }) value = new Array<number>()
	@property() selectionMode = SelectableListSelectionMode.Single

	@queryAsync('slot') protected readonly slotElement!: Promise<HTMLSlotElement>

	@eventListener({ type: 'change', target(this: SelectableList) { return this.slotElement } })
	protected handleChange(event: CustomEvent) {
		if (event instanceof SelectionListItemChangeEvent) {
			event.stopImmediatePropagation()
			const index = this.items.indexOf(event.target as HTMLElement)

			if (index === -1) {
				return
			}

			const value = new Set(this.value)

			if (this.selectionMode === SelectableListSelectionMode.Single) {
				for (const [i, item] of this.items.entries()) {
					if (i !== index) {
						if ('selected' in item) {
							item.selected = false
						} else {
							item.removeAttribute('selected')
						}
					}
				}

				value.clear()
			}

			if (event.selected) {
				value.add(index)
			} else {
				value.delete(index)
			}

			this.value = [...value]
			this.change.dispatch(this.value)
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-list': List
	}
}