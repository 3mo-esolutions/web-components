import { component, Component, css, html, property } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import { type MaterialIcon } from '@3mo/icon'
import { MdIconButton } from '@material/web/iconbutton/icon-button.js'

/**
 * @element mo-icon-button
 *
 * @ssr true
 *
 * @attr icon - The icon to display.
 * @attr disabled - Disables the icon-button.
 * @attr dense - Reduces the size of the icon-button.
 *
 * @slot icon - Use The icon to be displayed inside the button.
 *
 * @csspart button - The native button element wrapping the icon-button.
 * @csspart ripple - The ripple effect of the icon-button.
 * @csspart focus-ring - The focus ring of the icon-button.
 */
@component('mo-icon-button')
export class IconButton extends Component {
	@property() icon!: MaterialIcon
	@disabledProperty() disabled = false
	@property({ type: Boolean, reflect: true }) dense = false

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				font-size: 20px;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			md-icon-button {
				--md-icon-button-icon-color: currentColor;
				--md-icon-button-hover-icon-color: currentColor;
				--md-icon-button-focus-icon-color: currentColor;
				--md-icon-button-pressed-icon-color: currentColor;

				--md-icon-button-state-layer-color: currentColor;
				--md-icon-button-hover-state-layer-color: currentColor;
				--md-icon-button-focus-state-layer-color: currentColor;
				--md-icon-button-pressed-state-layer-color: currentColor;
				--md-focus-ring-color: currentColor;
			}

			md-icon-button::part(button) {
				padding: 0.4em;
			}

			:host([dense]) md-icon-button::part(button) {
				padding: 0.2em;
			}

			mo-icon {
				font-size: inherit;
			}
		`
	}

	protected override get template() {
		return html`
			<md-icon-button exportparts='button,ripple,focus-ring' ?disabled=${this.disabled}>
				<slot name='icon'>
					<mo-icon icon=${this.icon}></mo-icon>
				</slot>
			</md-icon-button>
		`
	}
}

MdIconButton.elementStyles.push(css`
	:host {
		height: unset !important;
		width: unset !important;
	}

	button {
		width: unset !important;
		height: unset !important;
		font-size: inherit !important;
	}

	::slotted(*) {
		width: unset !important;
		height: unset !important;
		font-size: inherit !important;
	}

	.touch {
		/*
		There are 2 issues with the touch layer
		- It leads to containers scrolling as the touch layer is not fixed by default
		- Making it fixed lead to it staying on the screen relative to the window and losing its position relative to the button when scrolling
		Therefore we hide it for now.
		*/
		display: none;
		/* position: fixed; */
		/* height: 48px; */
		/* width: 48px; */
	}
`)

MdIconButton.addInitializer(instance => instance.addController({
	hostUpdated() {
		instance.renderRoot.querySelector('button')?.part.add('button')
		instance.renderRoot.querySelector('md-ripple')?.part.add('ripple')
		instance.renderRoot.querySelector('md-focus-ring')?.part.add('focus-ring')
	}
}))

declare global {
	interface HTMLElementTagNameMap {
		'mo-icon-button': IconButton
	}
}