import { component, html, ifDefined, property } from '@a11d/lit'
import { Currency, type CurrencyCode } from '@3mo/localization'
import { FieldCurrency } from '@3mo/number-fields'
import { DataGridColumnNumberBase } from './DataGridColumnNumberBase.js'
import { Localizer } from '@3mo/localization'

Localizer.dictionaries.add('de', {
	'Currency': 'Währung',
})

/**
 * @element mo-data-grid-column-currency
 *
 * @attr currency - The currency of the values.
 * @attr currencyDataSelector - The key path to the currency of the values.
*/
@component('mo-data-grid-column-currency')
export class DataGridColumnCurrency<TData> extends DataGridColumnNumberBase<TData> {
	static defaultCurrency?: Currency

	@property({ type: Object, converter: FieldCurrency.currencyConverter }) currency?: Currency
	@property() currencyDataSelector?: KeyPathOf<TData>

	@property() exchangeRateDataSelector?: KeyPathOf<TData>

	private getCurrency(data: TData) {
		return (this.currencyDataSelector ? Currency[getValueByKeyPath(data, this.currencyDataSelector) as CurrencyCode] : undefined)
			?? this.currency
			?? DataGridColumnCurrency.defaultCurrency!
	}

	getContentTemplate(value: number | undefined, data: TData) {
		return html`${this.getNumber(value)?.formatAsCurrency(this.getCurrency(data)) ?? html.nothing}`
	}

	getEditContentTemplate(value: number | undefined, data: TData) {
		return html`
			<mo-field-currency dense autofocus selectOnFocus
				.currency=${this.getCurrency(data)}
				value=${ifDefined(value)}
				@change=${(e: CustomEvent<number>) => this.handleEdit(e.detail, data)}
			></mo-field-currency>
		`
	}

	getSumTemplate(sum: number) {
		return html`
			<span style='font-weight: 500'>${sum.formatAsCurrency(this.currency ?? DataGridColumnCurrency.defaultCurrency!)}</span>
		`
	}

	override formatHeaderForCsv() {
		return [this.heading.length < 3 && this.description ? this.description : this.heading, '' + t('Currency')]
	}

	override formatValueForCsv(value: unknown, data: TData) {
		if (value === undefined || value === null) {
			return ['', '']
		}

		return [value as any, this.getCurrency(data).code]
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-currency': DataGridColumnCurrency<unknown>
	}
}