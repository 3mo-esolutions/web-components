import { component, html, live } from '@a11d/lit'
import { InputFieldComponent } from '@3mo/field'

/** A field whose value is a list of keywords, typed comma-separated and tidied up when committed. */
@component('story-field-keywords')
export class FieldKeywords extends InputFieldComponent<Array<string>> {
	override value?: Array<string>

	protected override valueToInputValue(value?: Array<string>) {
		return value?.join(', ') ?? ''
	}

	protected override get inputTemplate() {
		return html`
			<input part='input'
				?readonly=${this.readonly}
				?required=${this.required}
				?disabled=${this.disabled}
				.value=${live(this.inputStringValue || '')}
				@input=${(e: Event) => this.handleInput(this.keywords, e)}
				@change=${(e: Event) => this.handleChange(this.keywords, e)}
			>
		`
	}

	private get keywords() {
		return this.inputElement.value.split(',').map(keyword => keyword.trim()).filter(Boolean)
	}
}
