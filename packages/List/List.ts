import { Component, component, css, html } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { ListItemsKeyboardController } from './ListItemsKeyboardController.js'

/**
 * @element mo-list
 *
 * @slot - Default slot for list items
 */
@component('mo-list')
export class List extends Component {
	static readonly itemRoles = ['listitem', 'menuitem', 'menuitemcheckbox', 'menuitemradio']

	protected readonly listItemsKeyboardController = new ListItemsKeyboardController(this)
	protected readonly slotController = new SlotController(this)

	override role = 'list'

	get items() {
		return this.slotController.getAssignedElements('')
			.filter((element): element is HTMLElement => element instanceof HTMLElement
				&& !!element.role
				&& List.itemRoles.includes(element.role)
				&& !element.hasAttribute('disabled')
			)
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