import { component, html, property } from '@a11d/lit'
import { FieldSelect } from '@3mo/select-field'
import { type DataGrid, type DataGridPagination } from './DataGrid.js'

@component('mo-field-select-data-grid-page-size')
export class FieldSelectDataGridPageSize extends FieldSelect<DataGridPagination> {
	private static readonly data = new Array<DataGridPagination & number>(10, 25, 50, 100, 250, 500)

	@property({ type: Object }) dataGrid?: DataGrid<any>

	override get optionsTemplate() {
		return html`
			${!this.dataGrid || !this.dataGrid.supportsDynamicPageSize ? html.nothing : html`
				<mo-option value='auto'>Auto</mo-option>
			`}
			${FieldSelectDataGridPageSize.data.map(size => html`
				<mo-option value=${size}>${size.format()}</mo-option>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-select-data-grid-page-size': FieldSelectDataGridPageSize
	}
}