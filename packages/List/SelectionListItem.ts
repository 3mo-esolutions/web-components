import { HTMLElementEventDispatcher, property } from '@a11d/lit'
import { ListItem } from './ListItem.js'
import { SelectionListItemChangeEvent } from './SelectableList.js'

class SelectionListItemEventDispatcher<T> extends HTMLElementEventDispatcher<T> {
	constructor(protected override readonly element: SelectionListItem<T>) {
		super(element, SelectionListItemChangeEvent.type)
	}

	override dispatch(value: T) {
		super.dispatch(new SelectionListItemChangeEvent<T>(value, !!this.element?.selected))
	}
}

export abstract class SelectionListItem<T = boolean> extends ListItem {
	static {
		property({ type: Boolean, bindingDefault: true, event: 'change' })(SelectionListItem.prototype, 'selected')
	}

	readonly change = new SelectionListItemEventDispatcher(this)
	abstract selected: T
}