import { component, html, ifDefined, live, property } from '@a11d/lit'
import { InputFieldComponent } from './InputFieldComponent.js'
import '@3mo/localization'

/**
 * @element mo-field-number
 *
 * @attr value - The value of the field.
 * @attr min - The minimum value of the field.
 * @attr max - The maximum value of the field.
 * @attr step - The step value of the field.
 */
@component('mo-field-number')
export class FieldNumber extends InputFieldComponent<number> {
	override readonly selectOnFocus = true

	@property({ type: Number, reflect: true }) value?: number
	@property({ type: Number, reflect: true }) min?: number
	@property({ type: Number, reflect: true }) max?: number
	@property({ type: Number, reflect: true }) step?: number

	protected readonly format = (value: number) => value.format()

	protected valueToInputValue(value?: number) {
		return value === undefined ? '' : this.format(value)
	}

	protected override get inputTemplate() {
		return html`
			<input
				part='input'
				type='text'
				autocomplete='off'
				inputmode='decimal'
				?readonly=${this.readonly}
				?required=${this.required}
				?disabled=${this.disabled}
				min=${ifDefined(this.min)}
				max=${ifDefined(this.max)}
				step=${ifDefined(this.step)}
				.value=${live(this.inputStringValue || '')}
				@input=${(e: Event) => this.handleInput(this.getValue(false), e)}
				@change=${(e: Event) => this.handleChange(this.getValue(true), e)}
			>
		`
	}

	private getValue(inRange = false) {
		const value = this.inputElement.value.toNumber()
		return value === undefined ? undefined : inRange ? this.inRange(value) : value
	}

	private inRange(value: number) {
		return Math.max(
			Math.min(
				value,
				this.max ?? Number.POSITIVE_INFINITY
			),
			this.min ?? Number.NEGATIVE_INFINITY
		)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-number': FieldNumber
	}
}