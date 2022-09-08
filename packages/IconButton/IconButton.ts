import { component, Component, css, html, property } from '@a11d/lit'
import { IconButton as MwcIconButton } from '@material/mwc-icon-button'
import { MaterialIcon } from '@3mo/icon'

/**
 * @attr icon - The icon to display.
 * @attr disabled - Disables the icon-button.
 * @attr dense - Reduces the size of the icon-button.
 *
 * @slot icon - Use The icon to be displayed inside the button.
 *
 * @csspart button - The native button element wrapping the icon-button.
 */
@component('mo-icon-button')
export class IconButton extends Component {
	@property() icon!: MaterialIcon
	@property({ type: Boolean }) disabled = false
	@property({ type: Boolean, reflect: true }) dense = false

	static override get styles() {
		return css`
			:host {
				font-size: 20px;
			}

			:host, mwc-icon-button {
				display: inline-block;
			}

			:host::part(button) {
				padding: 0.4em;
			}

			:host([dense])::part(button) {
				padding: 0.2em;
			}

			mo-icon {
				font-size: inherit;
			}
		`
	}

	protected override get template() {
		return html`
			<mwc-icon-button exportparts='button' ?disabled=${this.disabled}>
				<slot name='icon'>
					<mo-icon icon=${this.icon}></mo-icon>
				</slot>
			</mwc-icon-button>
		`
	}
}

MwcIconButton.elementStyles.push(css`
	span { display: inline-grid !important; }

	i { display: none !important; }

	button {
		width: unset !important;
		height: unset !important;
		font-size: inherit !important;
	}

	::slotted(*) {
		width: unset !important;
		height: unset !important;
	}
`)

MwcIconButton.addInitializer(instance => {
	instance.updateComplete.then(() => (instance as MwcIconButton).buttonElement.part.add('button'))
})

declare global {
	interface HTMLElementTagNameMap {
		'mo-icon-button': IconButton
	}
}