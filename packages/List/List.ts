import { Component, component, css, event, html } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { ListFocusController } from './ListFocusController.js'

export function isListItem(element: Element): element is HTMLElement {
	return element instanceof HTMLElement
		&& !!element.role
		&& List.itemRoles.includes(element.role)
}

export function isList(element: EventTarget): element is HTMLElement {
	return element instanceof HTMLElement
		&& element.role === 'list'
}

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

	static readonly itemRoles = ['listitem', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option']

	override readonly role = 'list'

	readonly focusController = new ListFocusController(this)
	readonly slotController = new SlotController(this)

	get items() {
		return this.slotController.getAssignedElements('').filter(isListItem)
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
		return html`<slot @slotchange=${this.handleSlotChange.bind(this)}></slot>`
	}

	protected handleSlotChange() {
		this.itemsChange.dispatch(this.items)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list': List
	}
}