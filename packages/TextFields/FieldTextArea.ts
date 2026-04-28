import { component, css, literal } from '@a11d/lit'
import { FieldText } from './FieldText.js'

/** @element mo-field-text-area */
@component('mo-field-text-area')
export class FieldTextArea extends FieldText {
	protected override get elementTag() {
		return literal`textarea`
	}

	static override get styles() {
		return css`
			${super.styles}

			textarea {
				resize: none;
			}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-text-area': FieldTextArea
	}
}