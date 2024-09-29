import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { DataGridColumn, DataGridSorting, DataGridPagination, type DataGridColumnSticky } from '@3mo/data-grid'
import { equals } from '@a11d/equals'
import { type ModdableDataGrid } from './ModdableDataGrid.js'
import type * as CSS from 'csstype'

export class ModdableDataGridModeColumn<T> {
	static fromJSON(json: any) {
		return new ModdableDataGridModeColumn(json)
	}

	static fromColumn<T>(column: DataGridColumn<T>) {
		return new ModdableDataGridModeColumn<T>({
			dataSelector: column.dataSelector,
			width: column.width,
			hidden: column.hidden,
			sticky: column.sticky,
		})
	}

	dataSelector!: KeyPathOf<T>
	width?: CSS.DataType.TrackBreadth<(string & {}) | 0>
	hidden?: boolean
	sticky?: DataGridColumnSticky

	constructor(init?: Partial<ModdableDataGridModeColumn<T>>) {
		Object.assign(this, structuredClone(init))
	}

	[equals](other: ModdableDataGridModeColumn<T>) {
		return other.dataSelector === this.dataSelector
			&& other.width === this.width
			&& other.hidden === this.hidden
			&& other.sticky === this.sticky
	}

	apply(column: DataGridColumn<T>) {
		column.width = this.width ?? column.width
		column.hidden = this.hidden ?? column.hidden
		column.sticky = this.sticky ?? column.sticky
		return column
	}

	toJSON() {
		return {
			dataSelector: this.dataSelector,
			width: this.width,
			hidden: this.hidden,
			sticky: this.sticky,
		}
	}
}

export class ModdableDataGridMode<T, P extends FetchableDataGridParametersType> {
	/**
	 * Extracts the mode from the current point in time of the data grid
	 * @param dataGrid The data grid to extract the mode from
	 * @returns The extracted mode
	 */
	static from<T, P extends FetchableDataGridParametersType>(dataGrid: ModdableDataGrid<T, P>) {
		return new ModdableDataGridMode<T, P>({
			// Non situational properties
			id: dataGrid.mode?.id,
			name: dataGrid.mode?.name,
			archived: dataGrid.mode?.archived,
			// Situational properties
			columns: dataGrid.columns.map(c => ModdableDataGridModeColumn.fromColumn(c)),
			pagination: dataGrid.pagination,
			parameters: structuredClone(dataGrid.parameters) ?? {} as P,
			sorting: structuredClone(dataGrid.sorting) ?? [],
		})
	}

	readonly id!: string
	readonly name!: string
	readonly parameters?: P
	columns?: Array<ModdableDataGridModeColumn<T>>
	sorting?: DataGridSorting<T>
	pagination?: DataGridPagination
	archived = false

	constructor(init?: Partial<ModdableDataGridMode<T, P>>) {
		Object.assign(this, structuredClone(init))
		this.columns = init?.columns?.map(c => new ModdableDataGridModeColumn(c))
		this.id ??= crypto.randomUUID()
	}

	clone(): ModdableDataGridMode<T, P> {
		return new ModdableDataGridMode(this)
	}

	with(mode: Partial<ModdableDataGridMode<T, P>>): this {
		return new ModdableDataGridMode({ ...this, ...mode }) as this
	}

	copy(name?: string): ModdableDataGridMode<T, P> {
		name ??= `${this.name} - ${t('Copy')}`
		return this.with({ id: undefined, name })
	}

	[equals](other: ModdableDataGridMode<T, P>) {
		return other.name === this.name
			&& other.id === this.id
			&& other.archived === this.archived
			&& Object[equals](other.columns, this.columns)
			&& Object[equals](other.sorting, this.sorting)
			&& Object[equals](other.pagination, this.pagination)
			&& Object[equals](other.definedParameters, this.definedParameters)
	}

	private get definedParameters() {
		return Object.fromEntries(
			Object.entries(this.parameters ?? {})
				.filter(([_, value]) => value !== undefined && value !== null && value !== '' && (Array.isArray(value) ? value.length > 0 : true))
		)
	}

	apply(dataGrid: ModdableDataGrid<T, P>) {
		dataGrid.setColumns(dataGrid.extractedColumns.map(c1 => this.columns?.find(c2 => c1.dataSelector === c2.dataSelector)?.apply(c1) ?? c1))
		dataGrid.sort(this.sorting ?? [])
		dataGrid.setPagination(this.pagination)
		dataGrid.setParameters(this.parameters ?? {} as P)
	}

	toJSON() {
		return {
			name: this.name,
			id: this.id,
			archived: this.archived,
			columns: this.columns?.map(c => c.toJSON()) ?? [],
			sorting: this.sorting ?? [],
			pagination: this.pagination,
			parameters: this.parameters,
		}
	}
}