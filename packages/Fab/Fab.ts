import { Component, component, css, html, ifDefined, property } from '@a11d/lit'
import { MutationController } from '@3mo/mutation-observer'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
import { disabledProperty } from '@3mo/disabled-property'
import { MaterialIcon } from '@3mo/icon'
import { Fab as MwcFab } from '@material/mwc-fab'
import '@3mo/theme'

/**
 * @element mo-fab
 *
 * @attr icon
 * @attr label
 * @attr dense
 * @attr disabled
 * @attr iconAtEnd
 *
 * @slot - The default slot is used to provide the label for the button.
 * @slot icon - The icon slot is used to provide the icon for the button.
 *
 * @cssprop --mo-fab-color
 */
@component('mo-fab')
export class Fab extends Component {
	@property() icon?: MaterialIcon
	@property({ type: Boolean }) iconAtEnd = false
	@property({ type: Boolean }) dense = false
	@disabledProperty() disabled = false

	protected readonly instanceofAttributeController = new InstanceofAttributeController(this)
	protected readonly mutationController = new MutationController(this, {
		config: {
			subtree: true,
			characterData: true,
			childList: true,
		}
	})

	static override get styles() {
		return css`
			:host {
				display: inline-block;
			}

			mwc-fab {
				--mdc-theme-secondary: var(--mo-fab-color, var(--mo-color-accent));
			}
		`
	}

	protected get label() { return this.textContent?.trim() || undefined }

	override get template() {
		return html`
			<mwc-fab
				label=${ifDefined(this.label)}
				?showIconAtEnd=${this.iconAtEnd}
				?mini=${this.dense}
				?disabled=${this.disabled}
				?extended=${!!this.label}
			>
				<slot name='icon' slot='icon'>
					<mo-icon icon=${ifDefined(this.icon)}></mo-icon>
				</slot>
			</mwc-fab>
		`
	}
}

MwcFab.elementStyles.push(css`
	.mdc-fab {
		margin: 0px !important;
	}

	.mdc-fab__touch {
		display: none !important;
	}

	.mdc-fab--mini {
		height: 40px !important;
	}
`)


declare global {
	interface HTMLElementTagNameMap {
		'mo-fab': Fab
	}
}