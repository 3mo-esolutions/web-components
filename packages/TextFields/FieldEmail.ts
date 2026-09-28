import { component, html, live, property } from '@a11d/lit'
import '@3mo/localization'
import { InputFieldComponent } from '@3mo/field'

/**
 * A text field for an email address, which offers the email keyboard on touch devices.
 *
 * @element mo-field-email
 *
 * @ssr true
 *
 * @attr value - The value of the field.
 *
 * @i18n "Email"
 */
@component('mo-field-email')
export class FieldEmail extends InputFieldComponent<string> {
	@property() override label = t('Email')
	@property() override value?: string

	protected valueToInputValue(value?: string) {
		return value ?? ''
	}

	protected override get inputTemplate() {
		return html`
			<input
				part='input'
				type='email'
				inputmode='email'
				?readonly=${this.readonly}
				?required=${this.required}
				?disabled=${this.disabled}
				.value=${live(this.inputStringValue || '')}
				@input=${(e: Event) => this.handleInput(this.inputElement.value, e)}
				@change=${(e: Event) => this.handleChange(this.inputElement.value, e)}
			>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-email': FieldEmail
	}
}