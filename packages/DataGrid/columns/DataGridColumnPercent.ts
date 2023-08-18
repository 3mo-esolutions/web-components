import { component, html, ifDefined, nothing } from '@a11d/lit'
import { DataGridColumnNumberBase } from './DataGridColumnNumberBase.js'

/** @element mo-data-grid-column-percent */
@component('mo-data-grid-column-percent')
export class DataGridColumnPercent<TData> extends DataGridColumnNumberBase<TData> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getContentTemplate(value: number | undefined, _data: TData) {
		return html`${this.getNumber(value)?.formatAsPercent() ?? nothing}`
	}

	getEditContentTemplate(value: number | undefined, data: TData) {
		return html`
			<mo-field-percent dense data-focus
				label=${this.heading}
				value=${ifDefined(value)}
				@change=${(e: CustomEvent<number>) => this.handleEdit(e.detail, data)}
			></mo-field-percent>
		`
	}

	getSumTemplate(sum: number) {
		return html`${sum.formatAsPercent()}`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-percent': DataGridColumnPercent<unknown>
	}
}