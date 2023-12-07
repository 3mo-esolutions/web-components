import { component, html, literal } from '@a11d/lit'
import { DataGridColumnDateTimeBase } from './DataGridColumnDateTimeBase.js'

/** @element mo-data-grid-column-date-range */
@component('mo-data-grid-column-date-range')
export class DataGridColumnDateRange<TData> extends DataGridColumnDateTimeBase<TData, DateTimeRange> {
	getContentTemplate(value: DateTimeRange | undefined, data: TData) {
		data
		return html`${value ? value.formatAsDateRange(this.formatOptionsValue) ?? '' : ''}`
	}

	override readonly fieldTag = literal`mo-field-date-range`
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-date-range': DataGridColumnDateRange<unknown>
	}
}