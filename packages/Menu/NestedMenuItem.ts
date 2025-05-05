import { bind, component, css, eventListener, html, property, query } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { MenuItem } from './MenuItem.js'
import { Menu } from './Menu.js'

/**
 * @element mo-nested-menu-item
 *
 * @slot submenu
 */
@component('mo-nested-menu-item')
export class NestedMenuItem extends MenuItem {
	@property({ type: Boolean }) open = false

	@query('mo-menu') readonly subMenu!: Menu

	private setOpen(open: boolean) {
		if (!this.disabled && !!this.hasSubMenu && this.open !== open && this.focused) {
			this.open = open
			if (open) {
				const focus = this.subMenu.list.focusController
				focus.focusIn()
				focus.focusedItemIndex = 0
				focus.keyboardFocus = true
			}
		}
	}

	readonly slotController = new SlotController(this)

	@eventListener('listKeyDown')
	protected handleKeyDown(event: CustomEvent<KeyboardEvent>) {
		if (['Right', 'ArrowRight'].includes(event.detail.key)) {
			this.setOpen(true)
		}
	}

	protected override disconnected() {
		super.disconnected()
		this.open = false
	}

	static override get styles() {
		return css`
			${super.styles}

			:host {
				position: relative;
				anchor-name: --mo-nested-menu-item;
			}

			mo-icon[icon=chevron_right] {
				margin-inline-start: auto;
				margin-inline-end: -8px;
			}

			mo-menu {
				position-anchor: --mo-nested-menu-item;
				inset-inline-end: 0px;
				height: 100%;
			}
		`
	}

	protected override get rippleActive() {
		return super.rippleActive && !this.open
	}

	protected override get focusRingActive() {
		return super.focusRingActive && !this.open
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
		return !this.hasSubMenu ? html.nothing : html`
			<mo-icon icon='chevron_right'></mo-icon>
			<mo-menu .anchor=${this} placement='inline-end' alignment='start'
				?open=${bind(this, 'open')}
				@listKeyDown=${(e: CustomEvent<KeyboardEvent>) => { e.stopImmediatePropagation(); !['Left', 'ArrowLeft'].includes(e.detail.key) ? void 0 : this.setOpen(false) }}
			>
				<slot name='submenu'></slot>
			</mo-menu>
		`
	}

	@eventListener('click')
	protected handleClick(e: PointerEvent & { [Menu.preventClose]?: boolean }) {
		if (e.target === this && this.hasSubMenu === true) {
			e[Menu.preventClose] = true
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-nested-menu-item': NestedMenuItem
	}
}