import { component, html, property } from '@a11d/lit'
import { DataGridColumn } from './DataGridColumn.js'

/**
 * @element mo-data-grid-column-date
 * @attr hideDatePicker - Hide the date picker
 */
@component('mo-data-grid-column-date')
export class DataGridColumnDate<TData> extends DataGridColumn<TData, Date> {
	@property({ type: Boolean }) hideDatePicker = false

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getContentTemplate(value: Date | undefined, _data: TData) {
		return html`${value ? value.formatAsDate() ?? '' : ''}`
	}

	getEditContentTemplate(value: Date | undefined, data: TData) {
		return html`
			<mo-field-date dense
				?hideDatePicker=${this.hideDatePicker}
				label=${this.heading}
				.value=${value}
				@change=${(e: CustomEvent<Date>) => this.handleEdit(e.detail, data)}
			></mo-field-date>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-date': DataGridColumnDate<unknown>
	}
}