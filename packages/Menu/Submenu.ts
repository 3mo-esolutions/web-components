import { component, css, eventListener, html, property, query } from '@a11d/lit'
import { ListItem } from '@3mo/list'
import { Menu } from './Menu.js'

@component('mo-list-submenu')
export class Submenu extends ListItem {
	@property() open = false

	@query('mo-menu') private readonly menu!: Menu

	static override get styles() {
		return css`
			${super.styles}

			:host {
				position: relative;
				padding-inline-end: 0;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-list-item-ripple ?focused=${this.focused} ?disabled=${this.disabled}></mo-list-item-ripple>
			<mo-flex style='flex-flow: row; flex: 1; align-items: center'>
				<slot></slot>
			</mo-flex>
			<mo-icon icon='chevron_right'></mo-icon>
			<mo-menu .anchor=${this} ?open=${this.open} style='align-self: flex-start' managed>
				<slot name='detail'></slot>
			</mo-menu>
		`
	}

	// FIX: The concept is there, but such much bugs!!.
	private openedListItemIndex?: number

	@eventListener({ target: document, type: 'keydown' })
	protected handleKeyDown(event: KeyboardEvent) {
		if ((!this.focused && !this.menu.list.listItemsKeyboardController.hasFocus) || this.disabled) {
			return
		}

		switch (event.key) {
			case 'Right':
			case 'ArrowRight':
				this.open = true
				if (this.parentElement instanceof Menu) {
					this.openedListItemIndex = this.parentElement.list.listItemsKeyboardController.focusedItemIndex
					this.parentElement.list.listItemsKeyboardController.unfocus()
					this.parentElement.list.listItemsKeyboardController.forceFocused = false
				}
				this.menu.list.listItemsKeyboardController.forceFocused = true
				this.menu.list.listItemsKeyboardController.focusFirstItem()
				break
			case 'Left':
			case 'ArrowLeft':
				this.open = false
				if (this.parentElement instanceof Menu) {
					this.parentElement.list.listItemsKeyboardController.forceFocused = true
					this.parentElement.list.listItemsKeyboardController.focusedItemIndex = this.openedListItemIndex ?? 0
				}
				this.menu.list.listItemsKeyboardController.forceFocused = false
				this.menu.list.listItemsKeyboardController.unfocus()
				break
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-submenu': Submenu
	}
}