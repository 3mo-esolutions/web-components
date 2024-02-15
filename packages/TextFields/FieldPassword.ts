import { html, component, property } from '@a11d/lit'
import { FieldText, FieldTextAutoComplete } from './FieldText.js'

/**
 * @element mo-field-password
 *
 * @attr reveal
 * @attr autoComplete
 */
@component('mo-field-password')
export class FieldPassword extends FieldText {
	@property({ type: Boolean }) reveal = false

	protected override get type() {
		return this.reveal ? 'text' : 'password'
	}

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