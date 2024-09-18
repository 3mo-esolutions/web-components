import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import type { DataGridColumn, DataGridSorting, DataGridPagination } from '@3mo/data-grid'
import { equals } from '@a11d/equals'
import { type ModdableDataGrid } from './ModdableDataGrid.js'
import { getPlainColumn } from './RepositoryController.js'
import cloneDeep from 'lodash.clonedeep'

export class Mode<T, P extends FetchableDataGridParametersType> {
	name!: string
	id?: string
	archived = false
	columns?: Array<DataGridColumn<T>>
	sorting?: DataGridSorting<T>
	pagination?: DataGridPagination
	parameters?: P

	constructor(origin?: Partial<Mode<T, P>>) {
		Object.assign(this, origin)

		if (!origin?.id) {
			this.id = crypto.randomUUID()
		}
	}

	clone() {
		return new Mode(cloneDeep(this))
	}

	get definedParameters() {
		return Object.fromEntries(
			Object.entries(this.parameters ?? {})
				.filter(([_key, value]) => value !== undefined
					&& value !== ''
					&& (!(value instanceof Array) || value.length > 0))
		)
	}

	[equals](otherMode: Mode<T, P>) {
		return otherMode.name === this.name
			&& otherMode.id === this.id
			&& otherMode.archived === this.archived
			&& Object[equals](otherMode.columns?.map(getPlainColumn), this.columns?.map(getPlainColumn))
			&& Object[equals](otherMode.sorting, this.sorting)
			&& Object[equals](otherMode.pagination, this.pagination)
			&& Object[equals](otherMode.definedParameters, this.definedParameters)
	}

	getColumns(dataGrid: ModdableDataGrid<T, P>) {
		return dataGrid.extractedColumns
			.map((extractedColumn) => extractedColumn.with(
				this.columns?.find(c => c.dataSelector === extractedColumn.dataSelector) ?? {}
			))
	}

	apply(dataGrid: ModdableDataGrid<T, P>) {
		dataGrid.setColumns(this.getColumns(dataGrid))
		dataGrid.sort(this.sorting!)
		dataGrid.setPagination(this.pagination)
		dataGrid.setParameters(this.parameters ?? {} as P)
	}

	toJSON() {
		return {
			name: this.name,
			id: this.id,
			archived: this.archived,
			columns: (this.columns ?? []).map(getPlainColumn),
			sorting: this.sorting ?? [],
			pagination: this.pagination,
			parameters: this.parameters,
		}
	}
}