import { component, html, literal } from '@a11d/lit'
import { DataGridColumnDateTimeBase } from './DataGridColumnDateTimeBase.js'

/** @element mo-data-grid-column-date-time-range */
@component('mo-data-grid-column-date-time-range')
export class DataGridColumnDateTimeRange<TData> extends DataGridColumnDateTimeBase<TData, DateTimeRange> {
	getContentTemplate(value: DateTimeRange | undefined, data: TData) {
		data
		return html`${value ? value.format(this.formatOptionsValue) ?? '' : ''}`
	}

	override readonly fieldTag = literal`mo-field-date-time-range`
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-date-time-range': DataGridColumnDateTimeRange<unknown>
	}
}