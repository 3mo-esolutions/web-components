import { component, html, literal } from '@a11d/lit'
import { DataGridColumnDateTimeBase } from './DataGridColumnDateTimeBase.js'

/** @element mo-data-grid-column-date-time */
@component('mo-data-grid-column-date-time')
export class DataGridColumnDateTime<TData> extends DataGridColumnDateTimeBase<TData, Date> {
	getContentTemplate(value: Date | undefined, data: TData) {
		data
		return html`${value ? value.format(this.formatOptions) ?? '' : ''}`
	}

	override readonly fieldTag = literal`mo-field-date-time`
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-date-time': DataGridColumnDateTime<unknown>
	}
}