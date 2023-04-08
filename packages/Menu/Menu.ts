import { component, Component, css, html, property, query, unsafeCSS } from '@a11d/lit'
import { PopoverController, PopoverPlacement } from '@3mo/popover'
import { SlotController } from '@3mo/slot-controller'
import { List } from '@3mo/list'
import { MenuController } from './MenuController.js'

export function isMenu(element: EventTarget): element is HTMLElement {
	return element instanceof HTMLElement
		&& element.role === 'menu'
}

/**
 * @element mo-menu
 *
 * @slot - Default slot for list items
 */
@component('mo-menu')
export class Menu extends Component {
	override readonly role = 'menu'

	readonly menuKeyboardController = new MenuController(this)
	readonly slotController = new SlotController(this)
	readonly popoverController: PopoverController = new PopoverController(this, {})

	@property({ type: Object }) anchor!: HTMLElement
	@property({ type: String, reflect: true }) placement = PopoverPlacement.Bottom
	@property({
		type: Boolean,
		reflect: true,
		updated(this: Menu) {
			if (this.open === false) {
				this.list.listItemsKeyboardController.unfocus()
			}
			this.list.listItemsKeyboardController.forceFocused = this.open
		}
	}) open = false

	@query('mo-list') readonly list!: List

	static override get styles() {
		return css`
			:host {
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius, 4px));

				opacity: 0;
				transition-duration: 175ms;
				transition-property: opacity, transform;
				position: fixed;
				z-index: 99;
			}

			:host(:not([open])) {
				pointer-events: none;
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Top)}"]) {
				transform: scale(0.9);
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Bottom)}"]) {
				transform: scale(0.9);
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Left)}"]) {
				transform: scale(0.9);
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Right)}"]) {
				transform: scale(0.9);
			}

			:host([open]) {
				opacity: 1;
				transform: scale(1);
			}

			#surface {
				position: absolute;
				background: var(--mo-menu-surface-background, var(--mo-color-surface, #fff));
				border-radius: var(--mo-menu-surface-border-radius, var(--mo-border-radius, 4px));
				box-shadow: var(--mo-menu-surface-shadow, var(--mo-shadow, 0 2px 4px rgba(0, 0, 0, 0.2)));
				overflow: hidden;
			}
		`
	}

	protected override get template() {
		return html`
			<div id='surface'>
				<mo-list .anchor=${this.anchor}>
					<slot></slot>
				</mo-list>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu': Menu
	}
}