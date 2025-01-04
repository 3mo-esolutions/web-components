import { component, property, css, Component, html, literal, staticHtml, unsafeCSS } from '@a11d/lit'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
import { type MaterialIcon } from '@3mo/icon'
import { MdTextButton } from '@material/web/button/text-button.js'
import { MdOutlinedButton } from '@material/web/button/outlined-button.js'
import { MdFilledButton } from '@material/web/button/filled-button.js'
import { MdElevatedButton } from '@material/web/button/elevated-button.js'
import { disabledProperty } from '@3mo/disabled-property'
import '@3mo/theme'
import '@3mo/flex'

export enum ButtonType {
	Text = 'text',
	Outlined = 'outlined',
	Elevated = 'elevated',
	Filled = 'filled',
}

/**
 * @element mo-button
 *
 * @ssr true
 *
 * @attr type
 * @attr disabled
 * @attr startIcon
 * @attr endIcon
 *
 * @slot - The content of the button.
 * @slot start - The starting content of the button.
 * @slot end - The end content of the button.
 *
 * @cssprop --mo-button-accent-color
 * @cssprop --mo-button-on-accent-color
 * @cssprop --mo-button-horizontal-padding
 * @cssprop --mo-button-disabled-background-color
 * @cssprop --mo-button-disabled-color
 *
 * @csspart button - The composed native button element.
 * @csspart ripple - The ripple element.
 * @csspart focus-ring - The focus ring element.
 */
@component('mo-button')
export class Button extends Component {
	static override shadowRootOptions: ShadowRootInit = { ...Component.shadowRootOptions, delegatesFocus: true }

	private static readonly tagByType = new Map([
		[ButtonType.Text, literal`md-text-button`],
		[ButtonType.Outlined, literal`md-outlined-button`],
		[ButtonType.Elevated, literal`md-elevated-button`],
		[ButtonType.Filled, literal`md-filled-button`],
	])

	@property({ reflect: true }) type = ButtonType.Text
	@disabledProperty() disabled = false

	@property() startIcon?: MaterialIcon
	@property() endIcon?: MaterialIcon

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				text-align: center;
				border-radius: var(--mo-border-radius);
				min-height: 36px;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			:host([type=${unsafeCSS(ButtonType.Text)}]) [md-button] {
				--mo-button-default-horizontal-padding: 12px;
			}

			:host(:not([type=${unsafeCSS(ButtonType.Text)}])) [md-button] {
				--mo-button-default-horizontal-padding: 16px;
			}

			slot:not([name]) {
				display: inline-block;
				flex: 1;
				place-self: center;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			slot[name=start] {
				place-self: center start;
			}

			slot[name=start] *, slot[name=start]::slotted(*) {
				margin-inline-end: calc(var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding)) * 0.5);
				margin-inline-start: calc(var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding)) * -0.5);
			}

			slot[name=end] {
				place-self: center end;
			}

			slot[name=end] *, slot[name=end]::slotted(*) {
				margin-inline-start: calc(var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding)) * 0.5);
				margin-inline-end: calc(var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding)) * -0.5);
			}

			[md-button] {
				min-height: inherit;
				text-align: inherit;
				font-size: 0.95rem;
				--md-focus-ring-color: var(--mo-button-accent-color, var(--mo-color-accent));
			}

			md-text-button {
				--md-text-button-disabled-label-text-opacity: 0.5;
				--md-text-button-disabled-label-text-color: var(--mo-button-disabled-color, var(--mo-color-gray));
				--md-text-button-label-text-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-text-button-hover-label-text-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-text-button-focus-label-text-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-text-button-pressed-label-text-color: var(--mo-button-accent-color, var(--mo-color-accent));

				--md-text-button-disabled-state-layer-color: var(--mo-button-disabled-color, var(--mo-color-gray));
				--md-text-button-state-layer-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-text-button-hover-state-layer-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-text-button-focus-state-layer-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-text-button-pressed-state-layer-color: var(--mo-button-accent-color, var(--mo-color-accent));
			}

			md-outlined-button {
				--md-outlined-button-disabled-label-text-opacity: 0.5;
				--md-outlined-button-disabled-label-text-color: var(--mo-button-disabled-color, var(--mo-color-gray));
				--md-outlined-button-label-text-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-outlined-button-hover-label-text-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-outlined-button-focus-label-text-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-outlined-button-pressed-label-text-color: var(--mo-button-accent-color, var(--mo-color-accent));

				--md-outlined-button-disabled-state-layer-color: var(--mo-button-disabled-color, var(--mo-color-gray));
				--md-outlined-button-state-layer-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-outlined-button-hover-state-layer-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-outlined-button-focus-state-layer-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-outlined-button-pressed-state-layer-color: var(--mo-button-accent-color, var(--mo-color-accent));

				--md-outlined-button-disabled-outline-opacity: 0.5;
				--md-outlined-button-disabled-outline-color: var(--mo-button-disabled-color, var(--mo-color-gray));
				--md-outlined-button-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-outlined-button-hover-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-outlined-button-focus-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-outlined-button-pressed-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));
			}

			md-filled-button {
				--md-filled-button-disabled-label-text-opacity: 0.5;
				--md-filled-button-disabled-label-text-color: var(--mo-button-disabled-color, var(--mo-color-gray));
				--md-filled-button-label-text-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-filled-button-hover-label-text-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-filled-button-focus-label-text-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-filled-button-pressed-label-text-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));

				--md-outlined-button-disabled-state-layer-color: var(--mo-button-disabled-color, var(--mo-color-gray));
				--md-filled-button-state-layer-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-filled-button-hover-state-layer-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-filled-button-hover-state-layer-opacity: 0.15;
				--md-filled-button-focus-state-layer-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-filled-button-focus-state-layer-opacity: 0.15;
				--md-filled-button-pressed-state-layer-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-filled-button-pressed-state-layer-opacity: 0.3;

				--md-filled-button-disabled-outline-opacity: 0.5;
				--md-filled-button-disabled-outline-color: var(--mo-button-disabled-color, var(--mo-color-gray));
				--md-filled-button-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-filled-button-hover-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-filled-button-focus-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-filled-button-pressed-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));

				--md-filled-button-disabled-container-opacity: 0.25;
				--md-filled-button-disabled-container-color: var(--mo-button-disabled-background-color, var(--mo-color-gray));
				--md-filled-button-container-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-filled-button-hover-container-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-filled-button-focus-container-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-filled-button-pressed-container-color: var(--mo-button-accent-color, var(--mo-color-accent));
			}

			md-elevated-button {
				--md-elevated-button-disabled-label-text-opacity: 0.5;
				--md-elevated-button-disabled-label-text-color: var(--mo-button-disabled-color, var(--mo-color-gray));
				--md-elevated-button-label-text-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-elevated-button-hover-label-text-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-elevated-button-focus-label-text-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-elevated-button-pressed-label-text-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));

				--md-outlined-button-disabled-state-layer-color: var(--mo-button-disabled-color, var(--mo-color-gray));
				--md-elevated-button-state-layer-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-elevated-button-hover-state-layer-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-elevated-button-hover-state-layer-opacity: 0.15;
				--md-elevated-button-focus-state-layer-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-elevated-button-focus-state-layer-opacity: 0.15;
				--md-elevated-button-pressed-state-layer-color: var(--mo-button-on-accent-color, var(--mo-color-on-accent));
				--md-elevated-button-pressed-state-layer-opacity: 0.3;

				--md-elevated-button-disabled-outline-opacity: 0.5;
				--md-elevated-button-disabled-outline-color: var(--mo-button-disabled-color, var(--mo-color-gray));
				--md-elevated-button-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-elevated-button-hover-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-elevated-button-focus-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-elevated-button-pressed-outline-color: var(--mo-button-accent-color, var(--mo-color-accent));

				--md-elevated-button-disabled-container-opacity: 0.25;
				--md-elevated-button-disabled-container-color: var(--mo-button-disabled-background-color, var(--mo-color-gray));
				--md-elevated-button-container-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-elevated-button-hover-container-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-elevated-button-focus-container-color: var(--mo-button-accent-color, var(--mo-color-accent));
				--md-elevated-button-pressed-container-color: var(--mo-button-accent-color, var(--mo-color-accent));
			}
		`
	}

	protected readonly instanceofAttributeController = new InstanceofAttributeController(this)

	protected override get template() {
		const buttonTag = Button.tagByType.get(this.type) ?? literal`md-text-button`
		return html`
			${staticHtml`
				<${buttonTag} exportparts='button,ripple,focus-ring' ?disabled=${this.isDisabled}>
					${this.contentTemplate}
				</${buttonTag}>
			`}
		`
	}

	protected get isDisabled() {
		return this.disabled
	}

	protected get contentTemplate() {
		return html`
			<mo-flex direction='horizontal' alignItems='center'>
				${this.startSlotTemplate}
				${this.slotTemplate}
				${this.endSlotTemplate}
			</mo-flex>
		`
	}

	protected get startSlotTemplate() {
		return html`
			<slot name='start'>
				${this.startIconTemplate}
			</slot>
		`
	}

	protected get startIconTemplate() {
		return !this.startIcon ? html.nothing : html`<mo-icon icon=${this.startIcon}></mo-icon>`
	}

	protected get slotTemplate() {
		return html`<slot></slot>`
	}

	protected get endSlotTemplate() {
		return html`
			<slot name='end'>
				${this.endIconTemplate}
			</slot>
		`
	}

	protected get endIconTemplate() {
		return !this.endIcon ? html.nothing : html`<mo-icon icon=${this.endIcon}></mo-icon>`
	}
}

const Buttons = [MdTextButton, MdOutlinedButton, MdFilledButton, MdElevatedButton]

Buttons.forEach(Button => Button.addInitializer(element => {
	element.addController({
		hostUpdated: () => {
			element.toggleAttribute('md-button', true)
			element.renderRoot.querySelector('button')?.setAttribute('part', 'button')
			element.renderRoot.querySelector('md-ripple')?.setAttribute('part', 'ripple')
		}
	})
}))

Buttons.forEach(Button => Button.elementStyles.push(css`
	:host {
		--_container-height: inherit;
		--_line-height: inherit;
		--_leading-space: var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding));
		--_trailing-space: var(--mo-button-horizontal-padding, var(--mo-button-default-horizontal-padding));
		width: 100% !important;
		height: 100% !important;
	}

	button {
		width: 100% !important;
		height: 100% !important;
		min-width: unset !important;
		line-height: unset !important;
		padding-block: 4px !important;
		text-transform: unset !important;
		text-align: inherit !important;
	}

	.label {
		width: 100%;
		line-height: normal;
		overflow: unset;
	}

	:host, .outline, md-ripple, md-focus-ring {
		border-radius: inherit !important;
	}
`))

declare global {
	interface HTMLElementTagNameMap {
		'mo-button': Button
	}
}