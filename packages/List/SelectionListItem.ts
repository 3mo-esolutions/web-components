import { HTMLElementEventDispatcher, property, type PropertyValues } from '@a11d/lit'
import { ListItem } from './ListItem.js'
import { SelectionListItemChangeEvent } from './SelectionListItemChangeEvent.js'

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

	/** In a menu, the item is a `menuitemcheckbox` or `menuitemradio` and says whether it is checked. */
	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		const role = this.getAttribute('role')
		if (role === 'menuitemcheckbox' || role === 'menuitemradio') {
			const selected = this.selected as unknown
			this.setAttribute('aria-checked', selected === 'indeterminate' ? 'mixed' : String(!!selected))
		}
	}
}