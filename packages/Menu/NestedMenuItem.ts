import { component, css, eventListener, html, property } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { MenuItem } from './MenuItem.js'

// TODO: [Popover] Tests overall

/**
 * @element mo-nested-menu-item
 *
 * @slot submenu
 */
@component('mo-nested-menu-item')
export class NestedMenuItem extends MenuItem {
	@property({ type: Boolean }) open = false

	private setOpen(open: boolean) {
		if (!this.disabled && this.hasSubMenu && this.open !== open && this.focused) {
			this.open = open
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
			}

			mo-icon[icon=chevron_right] {
				margin-inline-end: -20px;
			}

			mo-menu {
				inset-inline-end: 0px;
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
		return !this.hasSubMenu ? html.nothing : html`
			<mo-icon icon='chevron_right'></mo-icon>
			<mo-menu .anchor=${this}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.open = e.detail}
				@listKeyDown=${(e: CustomEvent<KeyboardEvent>) => { e.stopImmediatePropagation(); !['Left', 'ArrowLeft'].includes(e.detail.key) ? void 0 : this.setOpen(false) }}
				placement='inline-end'
				alignment='start'
			>
				<slot name='submenu'></slot>
			</mo-menu>
		`
	}

	protected override handleClick() {
		if (this.hasSubMenu === false) {
			super.handleClick()
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-nested-menu-item': NestedMenuItem
	}
}