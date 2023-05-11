import { component, html, ifDefined } from '@a11d/lit'
import { DataGridColumn } from './DataGridColumn.js'

/** @element mo-data-grid-column-text */
@component('mo-data-grid-column-text')
export class DataGridColumnText<TData> extends DataGridColumn<TData, string> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getContentTemplate(value: string | undefined, _data: TData) {
		return html`${value ?? ''}`
	}

	getEditContentTemplate(value: string | undefined, data: TData) {
		return html`
			<mo-field-text dense label=${this.heading}
				value=${ifDefined(value)}
				@change=${(e: CustomEvent<string>) => this.handleEdit(e.detail, data)}
			></mo-field-text>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-text': DataGridColumnText<unknown>
	}
}