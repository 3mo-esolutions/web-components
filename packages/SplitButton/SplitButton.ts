import { component, css, Component, html, event, property } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'

/**
 * @element mo-split-button
 *
 * @attr open - Whether the menu is open.
 * @attr disabled - Whether the "more" button is disabled.
 *
 * @slot - The content of the button.
 * @slot more - The content of the more menu.
 *
 * @fires openChange - Dispatched when the menu is opened or closed.
 */
@component('mo-split-button')
export class SplitButton extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>

	@property({ type: Boolean, reflect: true }) open = false
	@disabledProperty() disabled = false

	static override get styles() {
		return css`
			:host { display: inline-flex; }
			:host([disabled]) { pointer-events: none; }
			mo-button { --mo-button-horizontal-padding: 6px; }
		`
	}

	protected override get template() {
		return html`
			${this.buttonGroupTemplate}
			${this.menuTemplate}
		`
	}

	protected get buttonGroupTemplate() {
		return html`
			<mo-button-group type='filled'>
				<slot></slot>
				${this.moreButtonTemplate}
			</mo-button-group>
		`
	}

	protected get moreButtonTemplate() {
		return html`
			<mo-button ?disabled=${this.disabled} @click=${this.handleMoreClick}>
				<mo-icon icon='keyboard_arrow_down'></mo-icon>
			</mo-button>
		`
	}

	private readonly handleMoreClick = (e: PointerEvent) => {
		e.stopPropagation()
		this.open = !this.open
	}

	protected get menuTemplate() {
		return html`
			<mo-menu .anchor=${this} target='more'
				preventOpenOnAnchorEnter
				?open=${this.open}
				@openChange=${this.handleOpenChange}
			>
				<slot id='more' name='more' @click=${(e: PointerEvent) => e.stopPropagation()}></slot>
			</mo-menu>
		`
	}

	private handleOpenChange = (event: CustomEvent<boolean>) => {
		this.open = event.detail
		this.openChange.dispatch(this.open)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-split-button': SplitButton
	}
}