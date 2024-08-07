import { LocalStorage } from '@a11d/local-storage'
import { type DataGridColumn } from '@3mo/data-grid'
import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { type ModdableDataGrid } from './ModdableDataGrid.js'
import { Mode } from './Mode.js'
import { objectEquals } from './ObjectExtensions.js'

export class ModeRepository<TData, TDataFetcherParameters extends FetchableDataGridParametersType> extends LocalStorage<Array<Mode<TData, TDataFetcherParameters>>> {
	private _defaultMode?: Required<Mode<TData, TDataFetcherParameters>>
	get defaultMode() { return this._defaultMode! }

	constructor(private readonly dataGrid: ModdableDataGrid<TData, TDataFetcherParameters>) {
		super(`ModdableDataGrid.${dataGrid.tagName.toLowerCase()}.Modes`, [], (_key: string, value: any) => {
			return (DateTime.isoRegularExpression.test(value))
				? new Date(value)
				: value
		})
	}

	updateDefaultIfNeeded() {
		if (!this._defaultMode) {
			this._defaultMode = this.currentMode
		}
	}

	override get value() { return super.value.map(mode => new Mode<TData, TDataFetcherParameters>(mode)) }
	override set value(value) {
		super.value = value
		this.dataGrid.requestUpdate()
	}

	get(id: number) {
		return this.value.find(mode => mode.id === id)
	}

	getAll() {
		return super.value
	}

	getUnarchived() {
		return this.getAll().filter(mode => mode.isArchived === false)
	}

	getArchived() {
		return this.getAll().filter(mode => mode.isArchived === true)
	}

	isSelected(mode: Mode<TData, TDataFetcherParameters>) {
		return this.dataGrid.mode?.id === mode.id
	}

	get isSelectedModeSaved() {
		return !this.dataGrid.mode
			|| this.dataGrid.modes.includes(this.dataGrid.mode)
			|| objectEquals(this.dataGrid.mode, this.currentMode)
	}

	get currentMode() {
		return {
			...(this.dataGrid.mode ?? {}),
			sorting: this.dataGrid.sorting,
			parameters: this.dataGrid.parameters ?? undefined,
			columns: this.dataGrid.columns,
			pagination: this.dataGrid.pagination,
		} as Required<Mode<TData, TDataFetcherParameters>>
	}

	save(mode: Mode<TData, TDataFetcherParameters> = this.currentMode) {
		const existingMode = !mode.id ? undefined : this.get(mode.id)

		mode.columns = mode.columns?.map(c => ({
			dataSelector: c.dataSelector,
			heading: c.heading,
			description: c.description,
			width: c.width,
			alignment: c.alignment,
			hidden: c.hidden,
			sortable: c.sortable,
			sticky: c.sticky,
			sortDataSelector: c.sortDataSelector,
			sumHeading: c.sumHeading,
			editable: c.editable,
		})) as Array<DataGridColumn<TData>>

		if (existingMode) {
			this.value = this.value.map(m => m.id !== mode.id ? m : mode)
		} else {
			this.value = [...this.value, mode]
		}

		if (this.dataGrid.mode?.id === mode.id || !existingMode) {
			this.dataGrid.mode = mode
		}
	}

	remove(mode: Mode<TData, TDataFetcherParameters>) {
		this.value = this.value.filter(m => m.id !== mode.id)
		if (this.dataGrid.mode?.id === mode.id) {
			this.dataGrid.mode = undefined
		}
	}

	archive(mode: Mode<TData, TDataFetcherParameters>) {
		mode.isArchived = true
		this.save(mode)
	}

	unarchive(mode: Mode<TData, TDataFetcherParameters>) {
		mode.isArchived = false
		this.save(mode)
	}
}