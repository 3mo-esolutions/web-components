import { component, html, literal } from '@a11d/lit'
import { FieldDateTimePrecision } from '@3mo/date-time-fields'
import { DataGridColumnDateTimeBase } from './DataGridColumnDateTimeBase.js'

/** @element mo-data-grid-column-date-range */
@component('mo-data-grid-column-date-range')
export class DataGridColumnDateRange<TData> extends DataGridColumnDateTimeBase<TData, DateTimeRange> {
	override precision = FieldDateTimePrecision.Day

	override getContentTemplate(value: DateTimeRange | undefined, data: TData) {
		data
		return html`${value?.formatAsDateRange(this.getFormatOptions(FieldDateTimePrecision.Day)) || ''}`
	}

	override readonly fieldTag = literal`mo-field-date-range`
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-date-range': DataGridColumnDateRange<unknown>
	}
}