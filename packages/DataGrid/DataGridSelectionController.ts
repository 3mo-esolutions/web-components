import { KeyboardController } from '@3mo/keyboard-controller'
import type { DataRecord } from './DataRecord.js'

export enum DataGridSelectability {
	Single = 'single',
	Multiple = 'multiple',
}

export enum DataGridSelectionBehaviorOnDataChange {
	/** Resets the selection of all data */
	Reset = 'reset',
	/** Tries to find the previously selected data to maintain the selection */
	Maintain = 'maintain',
	/** Prevents the selection from changing */
	Prevent = 'prevent',
}

interface SelectableComponent<TData> {
	selectability?: DataGridSelectability
	readonly dataRecords: Array<DataRecord<TData>>
	selectedData: Array<TData>
	isDataSelectable?(data: TData): boolean
	readonly selectionChange?: EventDispatcher<Array<TData>>
	readonly selectionBehaviorOnDataChange?: DataGridSelectionBehaviorOnDataChange
	readonly hasContextMenu?: boolean
}

export class DataGridSelectionController<TData> {
	private lastActiveSelection?: {
		data: TData
		selected: boolean
	}

	constructor(readonly host: SelectableComponent<TData>) { }

	get selectability() {
		if (this.host.hasContextMenu === true && this.host.selectability === undefined) {
			this.host.selectability = DataGridSelectability.Single
		}
		return this.host.selectability
	}

	get hasSelection() {
		return !!this.selectability
	}

	private get data() { return this.host.dataRecords.map(d => d.data) }

	private get selectableData() { return this.data.filter(d => this.isSelectable(d)) }

	private get selectedData() { return this.host.selectedData }
	private set selectedData(data) { this.host.selectedData = data }

	private get previouslySelectedData() {
		const hasId = this.selectedData.every(d => typeof d === 'object' && d !== null && 'id' in d)
		if (hasId) {
			const selectedIds = this.selectedData.map((d: any) => d.id) as Array<number>
			return this.data.filter((d: any) => selectedIds.includes(d.id))
		} else {
			const selectedDataJson = this.selectedData.map(d => JSON.stringify(d))
			return this.data.filter(d => selectedDataJson.includes(JSON.stringify(d)))
		}
	}

	isSelectable(data: TData) {
		return this.host.isDataSelectable?.(data) ?? true
	}

	isSelected(data: TData) {
		return this.selectedData.includes(data)
	}

	handleDataChange(behavior: DataGridSelectionBehaviorOnDataChange) {
		switch (behavior) {
			case DataGridSelectionBehaviorOnDataChange.Reset:
				this.deselectAll()
				break
			case DataGridSelectionBehaviorOnDataChange.Maintain:
				this.selectPreviouslySelectedData()
				break
		}
	}

	selectPreviouslySelectedData() {
		this.select(this.previouslySelectedData)
	}

	setSelection(data: TData, selected: boolean, preservePreviousSelections = false) {
		if (!this.hasSelection || !this.isSelectable(data)) {
			return
		}

		const dataToSelect = [...new Set((() => {
			switch (true) {
				case this.selectability === DataGridSelectability.Multiple && KeyboardController.shift && !!this.lastActiveSelection:
					const lastActiveSelection = this.lastActiveSelection
					const indexes = [
						this.selectableData.findIndex(data => lastActiveSelection.data === data),
						this.selectableData.findIndex(d => d === data)
					].sort((a, b) => a - b)
					const range = this.selectableData.slice(indexes[0]!, indexes[1]! + 1)
					return lastActiveSelection.selected
						? [...this.selectedData, ...range]
						: this.selectedData.filter(d => range.includes(d) === false)
				case preservePreviousSelections && selected && this.selectability === DataGridSelectability.Multiple:
					return [...this.selectedData, data]
				case selected:
					return [data]
				default:
					return this.selectedData.filter(d => d !== data)
			}
		})())]

		this.lastActiveSelection = { data, selected }
		this.select(dataToSelect)
	}

	selectAll() {
		if (this.selectability === DataGridSelectability.Multiple) {
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
			this.host.selectionChange?.dispatch(selectableData)
		}
	}
}