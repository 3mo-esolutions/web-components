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

	/** Whether the submenu acted on it, which is what tells a menu bar around this menu to leave the key alone. */
	private setOpen(open: boolean) {
		if (this.disabled || !this.hasSubMenu || this.open === open) {
			return false
		}
		this.open = open
		return true
	}

	readonly slotController = new SlotController(this)

	@eventListener('keydown')
	protected handleSubmenuKeyDown(event: KeyboardEvent) {
		if (event.target === this && ['Right', 'ArrowRight'].includes(event.key) && this.setOpen(true)) {
			event.preventDefault()
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
				margin-inline-start: auto;
				margin-inline-end: -8px;
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
			<mo-menu .anchor=${this} placement='inline-end' alignment='start'
				?open=${bind(this, 'open')}
				@keydown=${(e: KeyboardEvent) => {
					if (!e.defaultPrevented && ['Left', 'ArrowLeft'].includes(e.key) && this.setOpen(false)) {
						e.preventDefault()
						this.focus()
					}
				}}
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