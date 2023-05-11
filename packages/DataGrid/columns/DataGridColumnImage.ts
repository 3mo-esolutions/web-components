import { component, html, nothing } from '@a11d/lit'
import { DataGridColumn } from './DataGridColumn.js'

/** @element mo-data-grid-column-image */
@component('mo-data-grid-column-image')
export class DataGridColumnImage<TData> extends DataGridColumn<TData, string> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getContentTemplate(value: string | undefined, _data: TData) {
		return !value ? nothing : html`
			<img style='vertical-align: middle' src=${value} onload='this.hidden = false' onerror='this.hidden = true'/>
		`
	}

	getEditContentTemplate(value: string | undefined, data: TData) {
		return this.getContentTemplate(value, data)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-image': DataGridColumnImage<unknown>
	}
}