import { Component, component, css, html, ifDefined, isServer, property } from '@a11d/lit'
import { MutationController } from '@3mo/mutation-observer'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
import { type MaterialIcon } from '@3mo/icon'
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
 * @cssprop --mo-fab-accent-color - The container color of the FAB. Defaults to var(--mo-color-accent-container).
 * @cssprop --mo-fab-on-accent-color - The color of the FAB's contents. Defaults to var(--mo-color-on-accent-container).
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
				user-select: none;
			}

			md-fab {
				--md-fab-label-text-size: medium;

				/* Material Design 3 fills FABs with the "primary container" role rather than the solid accent. @see --mo-color-accent-container in @3mo/theme */
				--md-fab-background-color: var(--mo-fab-accent-color, var(--mo-color-accent-container));
				--md-fab-foreground-color: var(--mo-fab-on-accent-color, var(--mo-color-on-accent-container));
				--md-focus-ring-color: var(--mo-color-accent);

				--md-fab-primary-state-layer-color: var(--mo-fab-on-accent-color, var(--mo-color-on-accent-container));
				--md-fab-primary-hover-state-layer-color: var(--mo-fab-on-accent-color, var(--mo-color-on-accent-container));
				--md-fab-primary-focus-state-layer-color: var(--mo-fab-on-accent-color, var(--mo-color-on-accent-container));
				--md-fab-primary-pressed-state-layer-color: var(--mo-fab-on-accent-color, var(--mo-color-on-accent-container));
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