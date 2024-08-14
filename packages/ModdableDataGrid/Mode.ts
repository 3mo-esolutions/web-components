import { type DataGridColumn, type DataGridPagination, type DataGridSorting } from '@3mo/data-grid'
import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'

const generateId = () => {
	return Math.floor(Math.random() * Date.now())
}

export class Mode<TData, TDataFetcherParameters extends FetchableDataGridParametersType> {
	name!: string
	id? = generateId()
	isArchived = false
	columns?: Array<DataGridColumn<TData>>
	sorting?: DataGridSorting<TData>
	pagination?: DataGridPagination
	parameters?: TDataFetcherParameters

	constructor(origin?: Partial<Mode<TData, TDataFetcherParameters>>) {
		Object.assign(this, origin)
	}
}
