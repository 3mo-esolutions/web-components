import { component, css, html, ifDefined, live, nothing, property, style } from '@a11d/lit'
import { InputFieldComponent } from '@3mo/field'

/**
 * @element mo-field-text-area
 *
 * @attr value
 * @attr minLength
 * @attr maxLength
 * @attr pattern
 * @attr autoComplete
 */
@component('mo-field-text-area')
export class FieldTextArea extends InputFieldComponent<string> {
	@property() value?: string
	@property({ type: Number }) minLength?: number
	@property({ type: Number }) maxLength?: number

	protected valueToInputValue(value?: string) {
		return value ?? ''
	}

	static override get styles() {
		return css`
			mo-field {
				height: auto;
				transition: none;
				--mo-field-input-padding-inline-end: 0px;
				align-items: baseline;
			}

			textarea {
				margin-top: 1.15rem;
				line-height: 1.5rem;
				font-size: 0.875rem;
				width: 100% !important;
				padding: 0;
			}
		`
	}

	protected override get inputTemplate() {
		return html`
			<textarea
				part='input'
				inputmode='text'
				type='text'
				?readonly=${this.readonly}
				?required=${this.required}
				?disabled=${this.disabled}
				.value=${live(this.inputStringValue || '')}
				minlength=${ifDefined(this.minLength)}
				maxlength=${ifDefined(this.maxLength)}
				@input=${(e: Event) => this.handleInput(this.inputElement.value, e)}
				@change=${(e: Event) => this.handleChange(this.inputElement.value, e)}
			></textarea>
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
		'mo-field-text-area': FieldTextArea
	}
}