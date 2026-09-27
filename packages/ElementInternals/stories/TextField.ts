import { Component, component, css, eventListener, html, property, query, state } from '@a11d/lit'
import { FormAssociationController, formAssociated } from '@3mo/element-internals'

/** A text field that submits, validates, resets and follows fieldsets the way a native input does. */
@component('story-form-text-field')
@formAssociated
export class TextField extends Component {
	@property() label = ''
	@property() value = ''
	@property({ type: Boolean }) required = false
	// `:user-invalid` never matches a form-associated custom element, so the field keeps this flag itself.
	@property({ type: Boolean, reflect: true }) reported = false

	@state() private disabledByForm = false

	@query('input') readonly inputElement?: HTMLInputElement

	readonly formAssociation = new FormAssociationController(this, host => ({
		get value() { return host.value },
		get validity() { return host.inputElement ?? undefined },
		// A native input resets to its attribute, not to what was last typed into it.
		handleReset: () => {
			host.value = host.getAttribute('value') ?? ''
			host.reported = false
		},
		handleDisabledChange: disabled => host.disabledByForm = disabled,
	}))

	@eventListener('invalid')
	protected handleInvalid() {
		this.reported = true
	}

	static override get styles() {
		return css`
			:host { display: block; }
			label { display: flex; flex-direction: column; gap: 0.35rem; font-size: small; }
			b { color: var(--mo-color-red); }
			input {
				padding: 0.5rem 0.65rem;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
				background: transparent;
				color: var(--mo-color-foreground);
				font: inherit;
			}
			input:disabled { opacity: 0.4; }
			:host([reported]) input { border-color: var(--mo-color-red); }
		`
	}

	protected override get template() {
		return html`
			<label>
				<span>${this.label}${!this.required ? html.nothing : html`<b>*</b>`}</span>
				<input
					.value=${this.value}
					?required=${this.required}
					?disabled=${this.disabledByForm}
					@input=${(event: Event) => this.value = (event.target as HTMLInputElement).value}
				>
			</label>
		`
	}
}