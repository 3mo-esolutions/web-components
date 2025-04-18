import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { NotificationComponent } from '@a11d/lit-application'
import { equals } from '@a11d/equals'
import { type DataGridColumn, type DataGridSorting, type DataGridPagination, type DataGridColumnSticky } from '@3mo/data-grid'
import { Localizer } from '@3mo/localization'
import { type ModdableDataGrid } from './ModdableDataGrid.js'
import type * as CSS from 'csstype'

Localizer.dictionaries.add({
	en: {
		'ModdableDataGridMode.Copy': 'Copy',
	},
	de: {
		'View "${name:string}" moved to archive': 'Ansicht "${name}" ins Archiv verschoben',
		'ModdableDataGridMode.Copy': 'Kopie',
	}
})

export class ModdableDataGridModeColumn<T> {
	static fromColumn<T>(column: DataGridColumn<T>) {
		return new ModdableDataGridModeColumn<T>({
			dataSelector: column.dataSelector,
			width: column.width,
			hidden: column.hidden,
			sticky: column.sticky,
		})
	}

	dataSelector!: KeyPath.Of<T>
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
}

export class ModdableDataGridMode<TData, TDataFetcherParameters extends FetchableDataGridParametersType> {
	/**
	 * Extracts the mode from the current point in time of the data grid
	 * @param dataGrid The data grid to extract the mode from
	 * @returns The extracted mode
	 */
	static fromDataGrid<TData, TParameters extends FetchableDataGridParametersType>(dataGrid: ModdableDataGrid<TData, TParameters, any>) {
		return new ModdableDataGridMode<TData, TParameters>({
			// Non situational properties
			id: dataGrid.mode?.id,
			name: dataGrid.mode?.name,
			archived: dataGrid.mode?.archived,
			// Situational properties
			columns: dataGrid.columns.map(c => ModdableDataGridModeColumn.fromColumn(c)),
			pagination: dataGrid.pagination,
			parameters: structuredClone(dataGrid.parameters) ?? {} as TParameters,
			sorting: structuredClone(dataGrid.sorting) ?? [],
		})
	}

	readonly id!: string
	readonly name!: string
	readonly parameters?: TDataFetcherParameters
	columns?: Array<ModdableDataGridModeColumn<TData>>
	sorting?: DataGridSorting<TData>
	pagination?: DataGridPagination
	archived = false

	constructor(init?: Partial<ModdableDataGridMode<TData, TDataFetcherParameters>>) {
		Object.assign(this, structuredClone(init))
		if (this.columns) {
			this.columns = init?.columns?.map(c => new ModdableDataGridModeColumn<TData>(c))
		}
		if (this.parameters) {
			for (const [key, value] of Object.entries(this.parameters)) {
				if (value && typeof value === 'string' && DateTime.isoRegularExpression.test(value)) {
					(this.parameters as any)[key] = new Date(value)
				}
				if (value && typeof value === 'object' && ('start' in value || 'end' in value)) {
					(this.parameters as any)[key] = new DateTimeRange((value as any).start, (value as any).end)
				}
				if (value instanceof DateTimeRange) {
					(this.parameters as any)[key] = new DateTimeRange(value.start, value.end)
				}
			}
		}
		this.id ??= crypto.randomUUID()
	}

	clone(): ModdableDataGridMode<TData, TDataFetcherParameters> {
		return new ModdableDataGridMode(this)
	}

	with(mode: Partial<ModdableDataGridMode<TData, TDataFetcherParameters>>): this {
		return new ModdableDataGridMode({ ...this, ...mode }) as this
	}

	copy(name?: string): ModdableDataGridMode<TData, TDataFetcherParameters> {
		name ??= `${this.name} - ${t('ModdableDataGridMode.Copy')}`
		return this.with({ id: undefined, name })
	}

	[equals](other: ModdableDataGridMode<TData, TDataFetcherParameters>) {
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
				.filter(([, value]) => value !== undefined && value !== null && value !== '' && (Array.isArray(value) ? value.length > 0 : true))
		)
	}

	save(dataGrid: ModdableDataGrid<TData, TDataFetcherParameters, any>) {
		return dataGrid.modesController.save(this)
	}

	select(dataGrid: ModdableDataGrid<TData, TDataFetcherParameters, any>) {
		return dataGrid.modesController.set(this)
	}

	async archive(dataGrid: ModdableDataGrid<TData, TDataFetcherParameters, any>) {
		this.archived = true
		await this.save(dataGrid)
		NotificationComponent.notifySuccess(t('View "${name:string}" moved to archive', { name: this.name }))
	}

	async unarchive(dataGrid: ModdableDataGrid<TData, TDataFetcherParameters, any>) {
		this.archived = false
		await this.save(dataGrid)
	}

	delete(dataGrid: ModdableDataGrid<TData, TDataFetcherParameters, any>) {
		return dataGrid.modesController.delete(this)
	}

	apply(dataGrid: ModdableDataGrid<TData, TDataFetcherParameters, any>) {
		const clone = this.clone()
		dataGrid.setColumns(dataGrid.extractedColumns.map(c1 => clone.columns?.find(c2 => c1.dataSelector === c2.dataSelector)?.apply(c1) ?? c1))
		dataGrid.sort(clone.sorting ?? [])
		dataGrid.setPagination(clone.pagination)
		dataGrid.setParameters(clone.parameters ?? {} as TDataFetcherParameters)
	}
}