import { KeyboardController } from '@3mo/keyboard-controller'
import { Controller } from '@a11d/lit'
import { DataGrid, DataGridSelectionMode } from './index.js'

export class DataGridSelectionController<TData> extends Controller {
	private lastActiveSelection?: { data: TData, selected: boolean }

	constructor(private readonly dataGrid: DataGrid<TData, any>) {
		super(dataGrid)
	}

	private get mode() { return this.dataGrid.selectionMode }

	private get data() { return this.dataGrid.data }
	private set data(data) { this.dataGrid.data = data }

	private get selectedData() { return this.dataGrid.selectedData }
	private set selectedData(data) { this.dataGrid.selectedData = data }

	get hasSelection() {
		return this.mode !== DataGridSelectionMode.None
	}

	isSelectable(data: TData) {
		return this.dataGrid.isDataSelectable?.(data) ?? true
	}

	selectAll() {
		if (this.mode === DataGridSelectionMode.Multiple) {
			this.select([...this.data])
		}
	}

	deselectAll() {
		this.select([])
	}

	select(data: Array<TData>) {
		if (this.hasSelection) {
			const selectableData = data.filter(d => this.dataGrid.isSelectable(d))
			this.selectedData = selectableData
			this.dataGrid.selectionChange.dispatch(selectableData)
		}
	}

	setSelection(data: TData, selected: boolean) {
		if (!this.hasSelection || !this.dataGrid.isSelectable(data)) {
			return
		}

		const lastActiveSelection = this.lastActiveSelection
		let dataToSelect = this.selectedData

		if (this.mode === DataGridSelectionMode.Multiple && KeyboardController.shift && lastActiveSelection) {
			dataToSelect = this.updateSelectionForMultipleModeWithShift(dataToSelect, data)
		} else {
			if (selected) {
				if (this.mode === DataGridSelectionMode.Multiple) {
					if (this.dataGrid.selectionCheckboxesHidden) {
						dataToSelect = [data]
					} else {
						dataToSelect = [...dataToSelect, data]
					}
				} else if (this.mode === DataGridSelectionMode.Single) {
					dataToSelect = [data]
				}
			} else {
				dataToSelect = dataToSelect.filter(d => d !== data)
			}
		}

		this.lastActiveSelection = { data, selected }
		const deduplicatedDataToSelect = [...new Set(dataToSelect)]
		this.select(deduplicatedDataToSelect)
	}

	private updateSelectionForMultipleModeWithShift(dataToSelect: TData[], data: TData) {
		const lastActiveSelection = this.lastActiveSelection!
		const indexes = [
			this.data.findIndex(data => data === lastActiveSelection.data),
			this.data.findIndex(d => d === data),
		].sort((a, b) => a - b)
		const range = this.data.slice(indexes[0]!, indexes[1]! + 1)
		return lastActiveSelection.selected
			? [...dataToSelect, ...range]
			: dataToSelect.filter(d => range.includes(d) === false)
	}
}