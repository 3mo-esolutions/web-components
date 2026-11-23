import { component, css, literal } from '@a11d/lit'
import { FieldText } from './FieldText.js'

/**
 * A multi-line text field, at least two lines high, which grows with its text.
 * A `min-height` on the element makes it start higher.
 *
 * @element mo-field-text-area
 *
 * @csspart input - The textarea. Its `max-height` limits how far the field grows; beyond it, the text scrolls.
 */
@component('mo-field-text-area')
export class FieldTextArea extends FieldText {
	protected override get elementTag() {
		return literal`textarea`
	}

	protected override get elementClosingTag() {
		return literal`</textarea>`
	}

	static override get styles() {
		return css`
			${super.styles}

			/* The field and its textarea stretch to a min-height set on the element. */
			:host {
				display: flex;
				flex-direction: column;
			}

			mo-field {
				flex: 1 1 auto;
				align-items: stretch;
				/* At rest, the label lies on the first line rather than in the middle of a high field. */
				--_mo-field-label-rest-top: calc(0.8125rem + 0.1em);
				/* Start and end content sit on the first line unless they align themselves otherwise. */
				--_mo-field-slot-align-items: start;
			}

			mo-field[dense] {
				--_mo-field-label-rest-top: 0.1em;
			}

			textarea {
				align-self: stretch;
				resize: none;
				field-sizing: content;
				min-height: 2lh;
				/* A margin rather than the field's padding, so text scrolled away does not show through the label. */
				padding-block: 0;
				margin-top: 0.8125rem;
			}

			mo-field:is(:not([label]), [label='']) textarea {
				margin-block: 0.40625rem;
			}

			mo-field[dense] textarea {
				margin-block: 0;
			}

		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-text-area': FieldTextArea
	}
}
