import { component, nothing, property } from '@a11d/lit'
import { FieldText, FieldTextAutoComplete } from './FieldText.js'

/**
 * @element mo-field-password
 *
 * @attr autoComplete
 */
@component('mo-field-password')
export class FieldPassword extends FieldText {
	protected override readonly type = 'password'

	@property() override autoComplete: FieldTextAutoComplete = 'current-password'

	protected override get lengthTemplate() {
		return nothing
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-password': FieldText
	}
}