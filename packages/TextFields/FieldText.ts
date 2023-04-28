import { component, html, ifDefined, live, nothing, property, style } from '@a11d/lit'
import { InputFieldComponent } from '@3mo/field'

export type FieldTextAutoComplete =
	| 'on'
	| 'off'
	| 'name'
	| 'honorific-prefix'
	| 'given-name'
	| 'additional-name'
	| 'family-name'
	| 'honorific-suffix'
	| 'nickname'
	| 'username'
	| 'one-time-code'
	| 'organization-title'
	| 'organization'
	| 'street-address'
	| 'address-line1'
	| 'address-line2'
	| 'address-line3'
	| 'address-level4'
	| 'address-level3'
	| 'address-level2'
	| 'address-level1'
	| 'country'
	| 'country-name'
	| 'postal-code'
	| 'cc-name'
	| 'cc-given-name'
	| 'cc-additional-name'
	| 'cc-family-name'
	| 'cc-number'
	| 'cc-exp'
	| 'cc-exp-month'
	| 'cc-exp-year'
	| 'cc-csc'
	| 'cc-type'
	| 'transaction-currency'
	| 'transaction-amount'
	| 'language'
	| 'bday'
	| 'bday-day'
	| 'bday-month'
	| 'bday-year'
	| 'sex'
	| 'url'
	| 'photo'
	| 'tel'
	| 'tel-country-code'
	| 'tel-national'
	| 'tel-area-code'
	| 'tel-local'
	| 'tel-local-prefix'
	| 'tel-local-suffix'
	| 'tel-extension'
	| 'impp'
	| 'current-password'
	| 'new-password'

/**
 * @element mo-field-text
 *
 * @attr value
 * @attr minLength
 * @attr maxLength
 * @attr pattern
 * @attr autoComplete
 */
@component('mo-field-text')
export class FieldText extends InputFieldComponent<string> {
	protected readonly type: string = 'text'
	protected readonly inputType: string = 'text'

	@property() value?: string
	@property({ type: Number }) minLength?: number
	@property({ type: Number }) maxLength?: number
	@property() pattern?: string
	@property() autoComplete?: FieldTextAutoComplete

	protected valueToInputValue(value?: string) {
		return value ?? ''
	}

	protected override get inputTemplate() {
		return html`
			<input
				part='input'
				inputmode=${this.inputType}
				type=${this.type}
				?readonly=${this.readonly}
				?required=${this.required}
				?disabled=${this.disabled}
				.value=${live(this.inputStringValue || '')}
				minlength=${ifDefined(this.minLength)}
				maxlength=${ifDefined(this.maxLength)}
				pattern=${ifDefined(this.pattern)}
				autocomplete=${ifDefined(this.autoComplete)}
				@input=${(e: Event) => this.handleInput(this.inputElement.value, e)}
				@change=${(e: Event) => this.handleChange(this.inputElement.value, e)}
			>
		`
	}

	protected override get endSlotTemplate() {
		return html`
			${this.lengthTemplate}
			${super.endSlotTemplate}
		`
	}

	protected get lengthTemplate() {
		if (!this.maxLength) {
			return nothing
		}
		const remainingLength = this.maxLength - (this.inputValue?.length ?? 0)
		return html`
			<span slot='end' ${style({ color: 'var(--mo-color-gray-transparent)' })}>${remainingLength}</span>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-text': FieldText
	}
}