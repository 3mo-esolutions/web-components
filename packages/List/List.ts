import { Component, component, css, event, html, unsafeCSS } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { ListFocusController } from './ListFocusController.js'
import { listItems } from './extensions.js'

/**
 * @element mo-list
 *
 * @slot - Default slot for list items
 *
 * @fires itemsChange - Dispatched when the list items change
 */
@component('mo-list')
export class List extends Component {
	@event() readonly itemsChange!: EventDispatcher<Array<HTMLElement>>

	override readonly role = 'list'

	readonly focusController = new ListFocusController(this)
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
				display: grid;
				grid-template-columns: auto 1fr auto;
				column-gap: 16px;
			}

			:host(:focus) {
				outline: none;
			}

			::slotted(*) {
				grid-column: -1 / 1;
			}

			${unsafeCSS(List.itemRoles.map(role => `::slotted([role='${role}'])`).join(','))} {
				grid-template-columns: subgrid;
				display: grid;
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