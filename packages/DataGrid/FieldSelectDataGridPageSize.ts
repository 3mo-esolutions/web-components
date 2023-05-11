import { component, html, property, nothing } from '@a11d/lit'
import { FieldFetchableSelect } from '@3mo/fetchable-select-field'
import { DataGrid, DataGridPagination } from './DataGrid.js'

@component('mo-field-select-data-grid-page-size')
export class FieldSelectDataGridPageSize extends FieldFetchableSelect<DataGridPagination> {
	private static readonly data = new Array<DataGridPagination>('auto', 10, 25, 50, 100, 250, 500)

	@property({ type: Object }) dataGrid?: DataGrid<any>

	override readonly fetch = () => Promise.resolve(FieldSelectDataGridPageSize.data)

	override readonly optionTemplate = (size: DataGridPagination) => {
		return size === 'auto' && (!this.dataGrid || this.dataGrid.supportsDynamicPageSize === false) ? nothing : html`
			<mo-option value=${size}>${size === 'auto' ? 'Auto' : size.format()}</mo-option>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-select-data-grid-page-size': FieldSelectDataGridPageSize
	}
}