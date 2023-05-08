import { component, css, eventListener, html, property, query } from '@a11d/lit'
import { List, ListItem } from '@3mo/list'
import { FocusController } from '@3mo/focus-controller'
import { Menu } from './Menu.js'

// TODO: [Popover] Keyboard Support missing
// TODO: [Popover] Tests overall

@component('mo-list-submenu')
export class Submenu extends ListItem {
	@property({
		updated(this: Submenu) {
			// TODO: [Popover] Refactor
			const parentList = this.parentElement as List
			parentList
			if (this.open) {
				this.menu.focus()
				this.menu.list.focus()
				this.menu.list.listItemsKeyboardController.unfocus()
			} else {
				this.menu.list.listItemsKeyboardController.unfocus()
				this.menu.list.blur()
				this.menu.blur()
				this.blur()
				//parentList.listItemsKeyboardController.unfocus()
				this.focus()
			}
		}
	}) open = false

	readonly focusController = new FocusController(this, {
		handleChange: (focused, bubbled) => {
			if (!bubbled && !(focused || this.hasCascadingFocus)) {
				this.open = false
			}
		}
	})

	@query('mo-menu') private readonly menu!: Menu

	get hasCascadingFocus(): boolean {
		return this.focusController.focused
			|| this.menu.list.listItemsKeyboardController?.hasFocus
			|| this.menu.list.items.some(x => (x as Submenu).hasCascadingFocus)
	}

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
			<mo-flex direction='horizontal' alignItems='center' style='flex: 1'>
				<slot></slot>
			</mo-flex>
			<mo-icon icon='chevron_right'></mo-icon>
			<mo-menu .anchor=${this} @openChange=${(e: CustomEvent<boolean>) => this.open = e.detail} ?open=${this.open} style='align-self: flex-start'>
				<slot name='detail'></slot>
			</mo-menu>
		`
	}

	@eventListener({ target: document, type: 'keydown' })
	protected handleKeyDown(event: KeyboardEvent) {
		if (!(this.focused || this.menu.list.listItemsKeyboardController.hasFocus) || this.disabled) {
			return
		}

		switch (event.key) {
			case 'Right':
			case 'ArrowRight':
				this.open = true
				break
			case 'Left':
			case 'ArrowLeft':
				if (this.menu.list.listItemsKeyboardController.hasFocus) {
					this.open = false
					break
				}
		}

		if (this.menu.list.listItemsKeyboardController.hasFocus) {
			return event.preventDefault()
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-submenu': Submenu
	}
}