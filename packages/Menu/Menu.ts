import { component, Component, css, event, html, property, query, unsafeCSS } from '@a11d/lit'
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
 * @attr placement - The placement of the menu relative to the anchor.
 * @attr open - Whether the menu is open.
 * @attr anchor - The anchor element for the menu.
 * @attr opener - The element id that opens the menu.
 *
 * @slot - Default slot for list items
 *
 * @fires openChange - Fired when the menu is opened or closed.
 */
@component('mo-menu')
export class Menu extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>

	override readonly role = 'menu'

	readonly slotController = new SlotController(this)
	readonly popoverController = new PopoverController(this, {})
	readonly menuKeyboardController = new MenuController(this)

	@property({ type: Object }) anchor!: HTMLElement
	@property() opener?: string

	@property({ type: String, reflect: true }) placement = PopoverPlacement.Bottom
	@property({
		type: Boolean,
		reflect: true,
		updated(this: Menu) {
			if (this.open === false) {
				this.list.listItemsKeyboardController.unfocus()
			}
			this.list.listItemsKeyboardController.forceFocused = this.open
			this.openChange.dispatch(this.open)
		}
	}) open = false

	@query('mo-list') readonly list!: List

	static override get styles() {
		return css`
			:host {
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius, 4px));

				position: absolute;
				background: var(--mo-color-surface, #fff);
				border-radius: var(--mo-border-radius, 4px);
				box-shadow: var(--mo-shadow, 0 2px 4px rgba(0, 0, 0, 0.2));
				overflow: hidden;
				width: max-content;

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
		`
	}

	protected override get template() {
		return html`
			<mo-list>
				<slot></slot>
			</mo-list>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu': Menu
	}
}