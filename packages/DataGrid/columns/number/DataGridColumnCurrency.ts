import { component, html, ifDefined, property } from '@a11d/lit'
import { Currency } from '@3mo/localization'
import { FieldCurrency } from '@3mo/number-fields'
import { DataGridColumnNumberBase } from './DataGridColumnNumberBase.js'

/**
 * @element mo-data-grid-column-currency
 *
 * @attr currency - The currency of the values.
*/
@component('mo-data-grid-column-currency')
export class DataGridColumnCurrency<TData> extends DataGridColumnNumberBase<TData> {
	static defaultCurrency?: Currency

	@property({ type: Object, converter: FieldCurrency.currencyConverter }) currency = DataGridColumnCurrency.defaultCurrency

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getContentTemplate(value: number | undefined, _data: TData) {
		return html`${this.getNumber(value)?.formatAsCurrency(this.currency!) ?? html.nothing}`
	}

	getEditContentTemplate(value: number | undefined, data: TData) {
		return html`
			<mo-field-currency dense data-focus
				.currency=${this.currency}
				label=${this.heading}
				value=${ifDefined(value)}
				@change=${(e: CustomEvent<number>) => this.handleEdit(e.detail, data)}
			></mo-field-currency>
		`
	}

	getSumTemplate(sum: number) {
		return html`
			<span style='font-weight: 500'>${sum.formatAsCurrency(this.currency!)}</span>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-currency': DataGridColumnCurrency<unknown>
	}
}