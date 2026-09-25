/** What an item that renders its own selection reports once it has selected or deselected itself. */
export class SelectionListItemChangeEvent<T> extends CustomEvent<T> {
	static readonly type = 'change'
	readonly selected: boolean
	constructor(value: T, selected: boolean) {
		super(SelectionListItemChangeEvent.type, { bubbles: true, detail: value })
		this.selected = selected
	}
}