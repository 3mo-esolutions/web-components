import { html, component, property } from '@a11d/lit'
import { FieldText, FieldTextAutoComplete } from './FieldText.js'

/**
 * @element mo-field-password
 *
 * @attr autoComplete
 */
@component('mo-field-password')
export class FieldPassword extends FieldText {
	@property({
		type: Boolean,
		updated(this: FieldPassword) {
			this.type = this.preview ? 'text' : 'password'
			this.requestUpdate()
		},
	}) preview = false

	protected override type = this.preview ? 'text' : 'password'

	@property() override autoComplete: FieldTextAutoComplete = 'current-password'

	protected override get lengthTemplate() {
		return html.nothing
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-password': FieldText
	}
}