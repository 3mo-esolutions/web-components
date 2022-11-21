import { component, property, css, Component, html, nothing, style } from '@a11d/lit'
import { ExtendsAttributeController } from '@3mo/extends-attribute-controller'
import { MaterialIcon } from '@3mo/icon'
import { Button as MwcButton } from '@material/mwc-button'

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
 */
@component('mo-button')
export class Button extends Component {
	@property({ reflect: true }) type = ButtonType.Normal
	@property({ reflect: true, type: Boolean }) disabled = false

	@property() leadingIcon?: MaterialIcon
	@property() trailingIcon?: MaterialIcon

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				text-transform: uppercase;
				border-radius: var(--mo-border-radius, 4px);
			}

			:host([disabled]) {
				pointer-events: none;
			}

			:host([type=normal]) mwc-button {
				--mo-button-default-horizontal-padding: 8px;
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
				min-height: 36px;
				--mdc-button-horizontal-padding: var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding));
				--mdc-theme-primary: var(--mo-button-accent-color, var(--mo-color-accent, #0077c8));
				--mdc-button-outline-color: var(--mo-button-accent-color, var(--mo-color-accent, #0077c8));
				--mdc-button-disabled-fill-color: var(--mo-button-disabled-background-color);
				--mdc-button-disabled-ink-color: var(--mo-button-disabled-color, var(--mo-color-gray-transparent));
				--mdc-button-disabled-outline-color: var(--mo-button-disabled-color, var(--mo-color-gray-transparent));
				--mdc-shape-small: inherit;
			}
		`
	}

	protected readonly extendsAttributeController = new ExtendsAttributeController(this)

	protected override get template() {
		return html`
			<mwc-button exportparts='button' expandContent
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

MwcButton.addInitializer(async element => {
	const button = element as MwcButton
	await button.updateComplete
	button.renderRoot.querySelector('button')?.setAttribute('part', 'button')
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
	}

	.mdc-button__label {
		display: none;
	}

	.trailing-icon, .leading-icon {
		display: inline-flex;
		align-items: center;
	}

	.trailing-icon ::slotted(*), .leading-icon ::slotted(*) {
		margin-left: unset;
		margin-right: unset;
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