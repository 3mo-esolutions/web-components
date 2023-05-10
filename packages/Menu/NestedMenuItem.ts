import { component, css, eventListener, html, nothing, property, query } from '@a11d/lit'
import { FocusController } from '@3mo/focus-controller'
import { SlotController } from '@3mo/slot-controller'
import { Menu } from './Menu.js'
import { MenuItem } from './MenuItem.js'

// TODO: [Popover] Keyboard Support missing
// TODO: [Popover] Tests overall

/**
 * @element mo-nested-menu-item
 *
 * @slot submenu
 */
@component('mo-nested-menu-item')
export class NestedMenuItem extends MenuItem {
	@property({ type: Boolean }) open = false

	@query('mo-menu') private readonly subMenu?: Menu

	readonly focusController = new FocusController(this, {
		handleChange: (focused, bubbled) => {
			if (!bubbled && !(focused || this.hasCascadingFocus)) {
				this.open = false
			}
		}
	})

	readonly slotController = new SlotController(this)

	private get hasCascadingFocus(): boolean {
		return this.focusController.focused
			|| (this.subMenu?.list.listItemsKeyboardController?.hasFocus ?? false)
			|| (this.subMenu?.list.items.some(x => (x as NestedMenuItem).hasCascadingFocus) ?? false)
	}

	@eventListener({ target: document, type: 'keydown' })
	protected handleKeyDown(event: KeyboardEvent) {
		if (!(this.focused || this.subMenu?.list.listItemsKeyboardController.hasFocus) || this.disabled) {
			return
		}

		switch (event.key) {
			case 'Right':
			case 'ArrowRight':
				this.open = true
				break
			case 'Left':
			case 'ArrowLeft':
				if (this.subMenu?.list.listItemsKeyboardController.hasFocus) {
					this.open = false
					break
				}
		}

		if (this.subMenu?.list.listItemsKeyboardController.hasFocus) {
			return event.preventDefault()
		}
	}

	static override get styles() {
		return css`
			${super.styles}

			:host {
				position: relative;
			}

			mo-icon[icon=chevron_right] {
				margin-inline-end: -4px;
			}

			mo-menu {
				inset-inline-end: 0px;
				position: absolute;
				height: 100%;
			}
		`
	}

	protected override get template() {
		return html`
			${super.template}
			${this.subMenuTemplate}
		`
	}

	protected get hasSubMenu() {
		return this.slotController.hasAssignedContent('submenu')
	}

	protected get subMenuTemplate() {
		return !this.hasSubMenu ? nothing : html`
			<mo-icon icon='chevron_right'></mo-icon>
			<mo-menu .anchor=${this}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.handleOpenChange(e.detail)}
			>
				<slot name='submenu'></slot>
			</mo-menu>
		`
	}

	protected handleOpenChange(open: boolean) {
		this.open = open

		// TODO: [Popover] Refactor
		if (!this.subMenu?.list?.listItemsKeyboardController) {
			return
		}

		if (this.open) {
			this.subMenu.focus()
			this.subMenu.list.focus()
			this.subMenu.list.listItemsKeyboardController.unfocus()
		} else {
			this.subMenu.list.listItemsKeyboardController.unfocus()
			this.subMenu.list.blur()
			this.subMenu.blur()
			this.blur()
			//parentList.listItemsKeyboardController.unfocus()
			this.focus()
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-nested-menu-item': NestedMenuItem
	}
}