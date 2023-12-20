import { component, css, html, property } from '@a11d/lit'
import { Currency, CurrencyCode } from '@3mo/localization'
import { FieldNumber } from './FieldNumber.js'

/**
 * @element mo-field-currency
 *
 * @attr currency - The currency of the field.
 */
@component('mo-field-currency')
export class FieldCurrency extends FieldNumber {
	static defaultCurrency?: Currency

	static currencyConverter = (value: unknown) => !value ? undefined : value instanceof Currency ? value : new Currency(value as CurrencyCode)

	@property({ type: Object, converter: FieldCurrency.currencyConverter }) currency = FieldCurrency.defaultCurrency

	protected override format = (value: number) => value.formatAsCurrency()

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
			<span slot='end' @click=${() => this.focus()}>${this.currency?.symbol}</span>
			${super.endSlotTemplate}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-currency': FieldCurrency
	}
}