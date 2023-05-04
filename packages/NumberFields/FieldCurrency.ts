import { component, css, html, property } from '@a11d/lit'
import { Currency } from '@3mo/localization'
import { FieldNumber } from './FieldNumber.js'

/**
 * @element mo-field-currency
 *
 * @attr currency - The currency of the field.
 * @attr currencySymbol - The currency symbol of the field.
 */
@component('mo-field-currency')
export class FieldCurrency extends FieldNumber {
	@property({ type: Object }) currency = Currency.EUR
	@property() currencySymbol?: string

	protected override format = (value: number) => value.formatAsCurrency()

	protected get currencySymbolText() {
		return this.currencySymbol ?? this.currency.symbol
	}

	static override get styles() {
		return css`
			${super.styles}

			span[slot=end] {
				font-size: x-large;
				color: var(--mo-color-gray);
				user-select: none;
			}
		`
	}

	protected override get endSlotTemplate() {
		return html`
			<span slot='end' @click=${() => this.focus()}>${this.currencySymbolText}</span>
			${super.endSlotTemplate}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-currency': FieldCurrency
	}
}