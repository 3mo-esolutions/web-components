import { component, html, literal } from '@a11d/lit'
import { FieldDateTimePrecision } from '@3mo/date-time-fields'
import { DataGridColumnDateTimeBase } from './DataGridColumnDateTimeBase.js'

/** @element mo-data-grid-column-date-time */
@component('mo-data-grid-column-date-time')
export class DataGridColumnDateTime<TData> extends DataGridColumnDateTimeBase<TData, Date> {
	override getContentTemplate(value: Date | undefined, data: TData) {
		data
		return html`${value?.format(this.getFormatOptions(FieldDateTimePrecision.Minute)) || ''}`
	}

	override readonly fieldTag = literal`mo-field-date-time`

	override *generateCsvValue(value: Date | undefined) {
		yield value?.toISOString() ?? ''
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-date-time': DataGridColumnDateTime<unknown>
	}
}