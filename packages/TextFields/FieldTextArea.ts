import { component, css, literal, property } from '@a11d/lit'
import { FieldText } from './FieldText.js'

/**
 * @element mo-field-text-area
 *
 * @attr rows
 */
@component('mo-field-text-area')
export class FieldTextArea extends FieldText {
	@property({ type: Number }) rows?: number

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