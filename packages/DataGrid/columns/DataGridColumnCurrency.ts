import { component, html, ifDefined, property, style } from '@a11d/lit'
import { Currency } from '@3mo/localization'
import { DataGridColumnNumberBase } from './DataGridColumnNumberBase.js'

/** @element mo-data-grid-column-currency */
@component('mo-data-grid-column-currency')
export class DataGridColumnCurrency<TData> extends DataGridColumnNumberBase<TData> {
	@property({ type: Object }) currency = Currency.EUR

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getContentTemplate(value: number | undefined, _data: TData) {
		return html`${(value ?? 0).formatAsCurrency(this.currency.code)}`
	}

	getEditContentTemplate(value: number | undefined, data: TData) {
		return html`
			<mo-field-currency dense
				label=${this.heading}
				value=${ifDefined(value)}
				@change=${(e: CustomEvent<number>) => this.handleEdit(e.detail, data)}
			></mo-field-currency>
		`
	}

	getSumTemplate(sum: number) {
		return html`
			<span ${style({ fontWeight: '500', color: 'var(--mo-color-accent)' })}>${sum.formatAsCurrency()}</span>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-currency': DataGridColumnCurrency<unknown>
	}
}