import { component, html, ifDefined, property } from '@a11d/lit'
import { Localizer, Currency, type CurrencyCode } from '@3mo/localization'
import { FieldCurrency } from '@3mo/number-fields'
import { DataGridColumnNumberBase } from './DataGridColumnNumberBase.js'

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

	override *generateCsvHeading() {
		yield* super.generateCsvHeading()
		yield t('Currency')
	}

	override *generateCsvValue(value: number | undefined, data: TData) {
		yield* super.generateCsvValue(value, data)
		yield this.getCurrency(data).code
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-currency': DataGridColumnCurrency<unknown>
	}
}