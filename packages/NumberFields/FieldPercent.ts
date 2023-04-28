import { component, css, html, property } from '@a11d/lit'
import { FieldNumber } from './FieldNumber.js'

/**
 * @element mo-field-percent
 * @attr percentSign - The percent sign of the field.
 */
@component('mo-field-percent')
export class FieldPercent extends FieldNumber {
	@property() percentSign = '%'
	override min = 0
	override max = 100

	protected override readonly format = (value: number) => value.format({
		useGrouping: false,
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	})

	static override get styles() {
		return css`
			span[slot=end] {
				font-size: 20px;
				font-weight: 600;
				color: var(--mo-color-gray);
				user-select: none;
			}
		`
	}

	protected override get endSlotTemplate() {
		return html`
			<span slot='end' @click=${() => this.focus()}>${this.percentSign}</span>
			${super.endSlotTemplate}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-percent': FieldPercent
	}
}