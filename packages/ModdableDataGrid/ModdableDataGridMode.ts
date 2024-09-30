import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { NotificationComponent } from '@a11d/lit-application'
import { equals } from '@a11d/equals'
import { DataGridColumn, DataGridSorting, DataGridPagination, type DataGridColumnSticky } from '@3mo/data-grid'
import { Localizer } from '@3mo/localization'
import { type ModdableDataGrid } from './ModdableDataGrid.js'
import type * as CSS from 'csstype'

Localizer.dictionaries.add({
	de: {
		'View "${name:string}" moved to archive': 'Ansicht "${name}" ins Archiv verschoben',
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
}

export class ModdableDataGridMode<T, P extends FetchableDataGridParametersType> {
	/**
	 * Extracts the mode from the current point in time of the data grid
	 * @param dataGrid The data grid to extract the mode from
	 * @returns The extracted mode
	 */
	static fromDataGrid<T, P extends FetchableDataGridParametersType>(dataGrid: ModdableDataGrid<T, P>) {
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

	/**
	 * Creates a mode from a literal object. It also revives specific data-types in parameters such as DateTime, DateTimeRange, etc.
	 * @param object The literal object to create the mode from
	 * @returns The created mode
	 */
	static fromObject<T, P extends FetchableDataGridParametersType>(object: any) {
		const mode = new ModdableDataGridMode<T, P>(object)
		if (mode.parameters) {
			for (const [key, value] of Object.entries(mode.parameters)) {
				if (value && typeof value === 'string' && DateTime.isoRegularExpression.test(value)) {
					(mode.parameters as any)[key] = new Date(value)
				}
				if (value && typeof value === 'object' && ('start' in value || 'end' in value)) {
					(mode.parameters as any)[key] = new DateTimeRange((value as any).start, (value as any).end)
				}

			}
		}
		return mode
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

	save(dataGrid: ModdableDataGrid<T, P>) {
		return dataGrid.modesController.save(this)
	}

	select(dataGrid: ModdableDataGrid<T, P>) {
		return dataGrid.modesController.set(this)
	}

	async archive(dataGrid: ModdableDataGrid<T, P>) {
		this.archived = true
		await this.save(dataGrid)
		NotificationComponent.notifySuccess(t('View "${name:string}" moved to archive', { name: this.name }))
	}

	async unarchive(dataGrid: ModdableDataGrid<T, P>) {
		this.archived = false
		await this.save(dataGrid)
	}

	delete(dataGrid: ModdableDataGrid<T, P>) {
		return dataGrid.modesController.delete(this)
	}

	apply(dataGrid: ModdableDataGrid<T, P>) {
		dataGrid.setColumns(dataGrid.extractedColumns.map(c1 => this.columns?.find(c2 => c1.dataSelector === c2.dataSelector)?.apply(c1) ?? c1))
		dataGrid.sort(this.sorting ?? [])
		dataGrid.setPagination(this.pagination)
		dataGrid.setParameters(this.parameters ?? {} as P)
	}
}