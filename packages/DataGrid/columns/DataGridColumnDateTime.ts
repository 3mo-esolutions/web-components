import { component, html } from '@a11d/lit'
import { DataGridColumn } from './DataGridColumn.js'

/**
 * @element mo-data-grid-column-date-time
 */
@component('mo-data-grid-column-date-time')
export class DataGridColumnDateTime<TData> extends DataGridColumn<TData, Date> {

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getContentTemplate(value: Date | undefined, _data: TData) {
		return html`${value ? value.format() ?? '' : ''}`
	}

	getEditContentTemplate = undefined
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-date-time': DataGridColumnDateTime<unknown>
	}
}