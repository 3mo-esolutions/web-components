import { component, html, literal } from '@a11d/lit'
import { DataGridColumnDateTimeBase } from './DataGridColumnDateTimeBase.js'

/** @element mo-data-grid-column-date-time */
@component('mo-data-grid-column-date-time')
export class DataGridColumnDateTime<TData> extends DataGridColumnDateTimeBase<TData, Date> {
	getContentTemplate(value: Date | undefined, data: TData) {
		data
		return html`${value ? value.format(this.formatOptionsValue) ?? '' : ''}`
	}

	override readonly fieldTag = literal`mo-field-date-time`

	override format = (value: Date) => {
		return !value ? '' : [
			value.formatAsDate(),
			value.formatAsTime({
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hourCycle: 'h23',
			}),
		].filter(Boolean).join(' ') ?? ''
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-date-time': DataGridColumnDateTime<unknown>
	}
}