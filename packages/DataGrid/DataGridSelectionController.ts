import { KeyboardController } from '@3mo/keyboard-controller'
import { Controller } from '@a11d/lit'
import { type DataGrid, DataGridSelectionMode } from './index.js'

export class DataGridSelectionController<TData> extends Controller {
	private lastActiveSelection?: {
		data: TData
		selected: boolean
	}

	constructor(private readonly dataGrid: DataGrid<TData, any>) {
		super(dataGrid)
	}

	get hasSelection() {
		return this.mode !== DataGridSelectionMode.None
	}

	private get mode() { return this.dataGrid.selectionMode }

	private get data() { return this.dataGrid.flattenedData }
	private get selectableData() { return this.data.filter(d => this.isSelectable(d)) }

	private get selectedData() { return this.dataGrid.selectedData }
	private set selectedData(data) { this.dataGrid.selectedData = data }

	private get previouslySelectedData() {
		const hasId = this.selectedData.every(d => Object.keys(d as any).includes('id'))
		if (hasId) {
			const selectedIds = this.selectedData.map((d: any) => d.id) as Array<number>
			return this.data.filter((d: any) => selectedIds.includes(d.id))
		} else {
			const selectedDataJson = this.selectedData.map(d => JSON.stringify(d))
			return this.data.filter(d => selectedDataJson.includes(JSON.stringify(d)))
		}
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
			const selectableData = data.filter(d => this.isSelectable(d))
			this.selectedData = selectableData
			this.dataGrid.selectionChange.dispatch(selectableData)
		}
	}

	selectPreviouslySelectedData() {
		this.select(this.previouslySelectedData)
	}

	setSelection(data: TData, selected: boolean) {
		if (!this.hasSelection || !this.isSelectable(data)) {
			return
		}

		const lastActiveSelection = this.lastActiveSelection
		let dataToSelect = this.selectedData
		const selectableData = this.selectableData

		if (this.mode === DataGridSelectionMode.Multiple && KeyboardController.shift && lastActiveSelection) {
			const lastActiveSelection = this.lastActiveSelection!
			const indexes = [
				selectableData.findIndex(data => lastActiveSelection.data === data),
				selectableData.findIndex(d => d === data)
			].sort((a, b) => a - b)
			const range = selectableData.slice(indexes[0]!, indexes[1]! + 1)
			dataToSelect = lastActiveSelection.selected
				? [...dataToSelect, ...range]
				: dataToSelect.filter(d => range.includes(d) === false)
		} else {
			if (selected) {
				if (this.mode === DataGridSelectionMode.Multiple) {
					dataToSelect = this.dataGrid.selectionCheckboxesHidden
						? [data]
						: [...dataToSelect, data]
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
}