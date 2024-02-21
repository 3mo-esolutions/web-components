import { component, html, live, property, style } from '@a11d/lit'
import { InputFieldComponent } from '@3mo/field'

/**
 * @element mo-field-email
 *
 * @attr value - The value of the field.
 */
@component('mo-field-email')
export class FieldEmail extends InputFieldComponent<string> {
	@property() override value?: string

	protected valueToInputValue(value?: string) {
		return value ?? ''
	}

	protected override get inputTemplate() {
		return html`
			<input ${style({ fontSize: 'smaller' })}
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