import { Component, component, css, html, ifDefined, isServer, property } from '@a11d/lit'
import { MutationController } from '@3mo/mutation-observer'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
import { MaterialIcon } from '@3mo/icon'
import { MdFab } from '@material/web/fab/fab.js'
import '@3mo/theme'

/**
 * @element mo-fab
 *
 * @ssr true
 *
 * @attr icon
 * @attr label
 * @attr dense
 * @attr iconAtEnd
 *
 * @slot - The default slot is used to provide the label for the button.
 * @slot icon - The icon slot is used to provide the icon for the button.
 *
 * @csspart button - The button element
 * @csspart ripple - The ripple element
 * @csspart focus-ring - The focus-ring element
 */
@component('mo-fab')
export class Fab extends Component {
	@property() icon?: MaterialIcon
	@property({ type: Boolean }) iconAtEnd = false
	@property({ type: Boolean }) dense = false

	protected readonly instanceofAttributeController = new InstanceofAttributeController(this)
	protected readonly mutationController = isServer ? undefined : new MutationController(this, {
		config: {
			subtree: true,
			characterData: true,
			childList: true,
		}
	})

	protected override initialized() {
		this.requestUpdate()
	}

	static override get styles() {
		return css`
			:host {
				display: inline-block;
			}

			md-fab {
				--md-fab-label-text-size: medium;

				--md-fab-background-color: var(--mo-color-accent);
				--md-fab-foreground-color: var(--mo-color-on-accent);
				--md-focus-ring-color: var(--mo-color-accent);

				--md-fab-primary-state-layer-color: var(--mo-color-on-accent);
				--md-fab-primary-hover-state-layer-color: var(--mo-color-on-accent);
				--md-fab-primary-focus-state-layer-color: var(--mo-color-on-accent);
				--md-fab-primary-pressed-state-layer-color: var(--mo-color-on-accent);
			}

			md-fab::part(button) {
				gap: 8px;
			}

			:host([iconAtEnd]) md-fab::part(button) {
				flex-direction: row-reverse;
				padding-inline: 20px 16px;
			}
		`
	}

	protected get label() { return this.textContent?.trim() || undefined }

	protected override get template() {
		return html`
			<md-fab exportparts='button,ripple,focus-ring' variant='primary'
				label=${ifDefined(this.label)}
				size=${this.dense ? 'small' : 'medium'}
			>
				<slot name='icon' slot='icon'>
					<mo-icon icon=${ifDefined(this.icon)}></mo-icon>
				</slot>
			</md-fab>
		`
	}
}

MdFab.addInitializer(fab => fab.addController({
	hostUpdated: () => {
		fab.renderRoot.querySelector('button')?.part.add('button')
		fab.renderRoot.querySelector('md-ripple')?.part.add('ripple')
		fab.renderRoot.querySelector('md-focus-ring')?.part.add('focus-ring')
	}
}))

MdFab.elementStyles.push(css`
	button { background: var(--md-fab-background-color) !important; }
	.icon, .label { color: var(--md-fab-foreground-color) !important; }
`)


declare global {
	interface HTMLElementTagNameMap {
		'mo-fab': Fab
	}
}