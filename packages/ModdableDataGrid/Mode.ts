import { type DataGridColumn, type DataGridPagination, type DataGridSorting } from '@3mo/data-grid'
import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'

export class Mode<TData, TDataFetcherParameters extends FetchableDataGridParametersType> {
	name!: string
	id? = generateId()
	isArchived = false
	columns?: Array<DataGridColumn<TData>>
	sorting?: DataGridSorting<TData>
	pagination?: DataGridPagination
	parameters?: TDataFetcherParameters

	constructor(mode?: Partial<Mode<TData, TDataFetcherParameters>>) {
		if (mode) {
			Object.assign(this, mode)
		}
	}
}

function generateId() {
	return Math.floor(Math.random() * Date.now())
}