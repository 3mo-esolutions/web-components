import { Component, component, css, event, html } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { listItems } from './extensions.js'

/**
 * A list of items, such as `mo-list-item`s and the ones with a checkbox, switch or radio button.
 *
 * @element mo-list
 *
 * @slot - The list items.
 *
 * @fires itemsChange - Dispatched when the list items change
 *
 * @accessibility
 * A `list` of `listitem`s: every item is a tab stop, and `Enter` and `Space` click it. For a choice among the items use `mo-selectable-list`, a [listbox](?path=/docs/behaviors-listbox--overview).
 * `ArrowRight` opens a `mo-collapsible-list-item` and `ArrowLeft` closes it. It does not announce whether it is open yet, and the two keys do not swap in a right-to-left language.
 */
@component('mo-list')
export class List extends Component {
	@event() readonly itemsChange!: EventDispatcher<Array<HTMLElement>>

	override readonly role = 'list'

	readonly slotController = new SlotController(this, () => this.items = this[listItems] as Array<HTMLElement> ?? [])

	private _items = new Array<HTMLElement>()
	get items() { return this._items }
	private set items(value) {
		this._items = value
		this.itemsChange.dispatch(this.items)
	}

	static override get styles() {
		return css`
			:host {
				display: block;
			}

			:host(:focus) {
				outline: none;
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list': List
	}
}
