import { component, css, html, live } from '@a11d/lit'
import { Color } from '@3mo/color'
import { InputFieldComponent } from '@3mo/field'

/** @element mo-field-color */
@component('mo-field-color')
export class FieldColor extends InputFieldComponent<Color> {
	override value?: Color

	protected override valueToInputValue(value?: Color) {
		return value?.hex ?? ''
	}

	static override get styles() {
		return css`
			${super.styles}
			mo-color-picker { width: 25px; }
		`
	}

	protected override get inputTemplate() {
		return html`
			<input
				part='input'
				inputmode='text'
				type='text'
				?readonly=${this.readonly}
				?required=${this.required}
				?disabled=${this.disabled}
				.value=${live(this.inputStringValue || '')}
				@input=${(e: Event) => this.handleInput(!this.inputElement.value ? undefined : new Color(this.inputElement.value), e)}
				@change=${(e: Event) => this.handleChange(!this.inputElement.value ? undefined : new Color(this.inputElement.value), e)}
			>
		`
	}

	protected override get endSlotTemplate() {
		return html`
			<mo-color-picker slot='end'
				.value=${this.value}
				@change=${(e: CustomEvent<Color>) => this.handleInput(e.detail, e)}
				@input=${(e: CustomEvent<Color>) => this.handleChange(e.detail, e)}
			></mo-color-picker>
			${super.endSlotTemplate}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-color': FieldColor
	}
}