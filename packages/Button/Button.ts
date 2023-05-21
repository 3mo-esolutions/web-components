import { component, property, css, Component, html, nothing, style } from '@a11d/lit'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
import { type MaterialIcon } from '@3mo/icon'
import { Button as MwcButton } from '@material/mwc-button'
import { disabledProperty } from '@3mo/disabled-property'
import '@3mo/theme'

export const enum ButtonType {
	Normal = 'normal',
	Outlined = 'outlined',
	Raised = 'raised',
	Unelevated = 'unelevated',
}

/**
 * @attr type
 * @attr disabled
 * @attr leadingIcon
 * @attr trailingIcon
 *
 * @slot - The content of the button.
 * @slot leading - The leading content of the button.
 * @slot trailing - The trailing content of the button.
 *
 * @cssprop --mo-button-accent-color
 * @cssprop --mo-button-horizontal-padding
 * @cssprop --mo-button-disabled-background-color
 * @cssprop --mo-button-disabled-color
 *
 * @csspart button - The composed native button element.
 * @csspart ripple - The ripple element.
 */
@component('mo-button')
export class Button extends Component {
	@property({ reflect: true }) type = ButtonType.Normal
	@disabledProperty() disabled = false

	@property() leadingIcon?: MaterialIcon
	@property() trailingIcon?: MaterialIcon

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				text-transform: uppercase;
				text-align: center;
				border-radius: var(--mo-border-radius);
				min-height: 36px;
			}

			:host([type=normal]) mwc-button {
				--mo-button-default-horizontal-padding: 12px;
			}

			:host(:not([type=normal])) mwc-button {
				--mo-button-default-horizontal-padding: 16px;
			}

			slot[name=leading] *, slot[name=leading]::slotted(*) {
				margin-inline-end: calc(var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding)) * 0.5);
				margin-inline-start: calc(var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding)) * -0.5);
			}

			slot[name=trailing] *, slot[name=trailing]::slotted(*) {
				margin-inline-start: calc(var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding)) * 0.5);
				margin-inline-end: calc(var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding)) * -0.5);
			}

			mwc-button {
				min-height: inherit;
				text-align: inherit;
				--mdc-button-horizontal-padding: var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding));
				--mdc-theme-primary: var(--mo-button-accent-color, var(--mo-color-accent));
				--mdc-button-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--mdc-button-disabled-fill-color: var(--mo-button-disabled-background-color);
				--mdc-button-disabled-ink-color: var(--mo-button-disabled-color, var(--mo-color-gray-transparent));
				--mdc-button-disabled-outline-color: var(--mo-button-disabled-color, var(--mo-color-gray-transparent));
				--mdc-shape-small: inherit;
			}
		`
	}

	protected readonly instanceofAttributeController = new InstanceofAttributeController(this)

	protected override get template() {
		return html`
			<mwc-button exportparts='button,ripple' expandContent
				?raised=${this.type === ButtonType.Raised}
				?outlined=${this.type === ButtonType.Outlined}
				?unelevated=${this.type === ButtonType.Unelevated}
				?disabled=${this.isDisabled}
			>
				${this.contentTemplate}
			</mwc-button>
		`
	}

	protected get isDisabled() {
		return this.disabled
	}

	protected get contentTemplate() {
		return html`
			${this.leadingSlotTemplate}
			${this.slotTemplate}
			${this.trailingSlotTemplate}
		`
	}

	protected get leadingSlotTemplate() {
		return html`
			<slot name='leading' slot='icon'>
				${this.leadingIconTemplate}
			</slot>
		`
	}

	protected get leadingIconTemplate() {
		return !this.leadingIcon ? nothing : html`<mo-icon icon=${this.leadingIcon}></mo-icon>`
	}

	protected get slotTemplate() {
		return html`<slot ${style({ width: '*' })}></slot>`
	}

	protected get trailingSlotTemplate() {
		return html`
			<slot name='trailing' slot='trailingIcon'>
				${this.trailingIconTemplate}
			</slot>
		`
	}

	protected get trailingIconTemplate() {
		return !this.trailingIcon ? nothing : html`<mo-icon icon=${this.trailingIcon}></mo-icon>`
	}
}

MwcButton.addInitializer(element => {
	element.addController({
		hostUpdated: () => {
			element.renderRoot.querySelector('button')?.setAttribute('part', 'button')
			element.renderRoot.querySelector('mwc-ripple')?.setAttribute('part', 'ripple')
		}
	})
})

MwcButton.elementStyles.push(css`
	:host {
		display: inline-grid !important;
		width: 100% !important;
		height: 100% !important;
		border-radius: inherit !important;
	}

	button {
		width: 100% !important;
		height: 100% !important;
		min-width: unset !important;
		line-height: unset !important;
		padding-top: 4px !important;
		padding-bottom: 4px !important;
		text-transform: unset !important;
		border-radius: inherit !important;
		text-align: inherit !important;
	}

	.mdc-button__label {
		display: none;
	}

	.trailing-icon, .leading-icon {
		display: inline-flex;
		align-items: center;
	}

	.trailing-icon ::slotted(*), .leading-icon ::slotted(*) {
		margin-inline-start: unset;
		margin-inline-end: unset;
		display: unset;
		position: unset;
		vertical-align: unset;
		font-size: unset;
		height: unset;
		width: unset;
	}
`)


declare global {
	interface HTMLElementTagNameMap {
		'mo-button': Button
	}
}