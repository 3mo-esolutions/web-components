import { component, html, literal } from '@a11d/lit'
import { DataGridColumnDateTimeBase } from './DataGridColumnDateTimeBase.js'

/** @element mo-data-grid-column-date */
@component('mo-data-grid-column-date')
export class DataGridColumnDate<TData> extends DataGridColumnDateTimeBase<TData, Date> {
	override getContentTemplate(value: Date | undefined, data: TData) {
		data
		return html`${value?.formatAsDate(this.formatOptionsValue) ?? ''}`
	}

	override readonly fieldTag = literal`mo-field-date`

	override *generateCsvValue(value: Date | undefined) {
		yield value?.toISOString().split('T')[0] ?? ''
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-date': DataGridColumnDate<unknown>
	}
}