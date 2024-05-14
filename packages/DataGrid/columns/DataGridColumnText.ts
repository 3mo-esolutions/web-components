import { component, html, ifDefined } from '@a11d/lit'
import { DataGridColumnComponent } from './DataGridColumnComponent.js'

/** @element mo-data-grid-column-text */
@component('mo-data-grid-column-text')
export class DataGridColumnText<TData> extends DataGridColumnComponent<TData, string> {
	getContentTemplate(value: string | undefined, data: TData) {
		data
		return html`${value ?? ''}`
	}

	getEditContentTemplate(value: string | undefined, data: TData) {
		return html`
			<mo-field-text dense label=${this.heading} autofocus
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