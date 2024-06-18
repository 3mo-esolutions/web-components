import { KeyboardController } from '@3mo/keyboard-controller'

export enum DataGridSelectionMode {
	None = 'none',
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
	selectionMode: DataGridSelectionMode
	readonly flattenedData: Array<TData>
	selectedData: Array<TData>
	isDataSelectable?(data: TData): boolean
	selectionCheckboxesHidden?: boolean
	readonly selectionChange?: EventDispatcher<Array<TData>>
	readonly selectionBehaviorOnDataChange?: DataGridSelectionBehaviorOnDataChange
}

export class DataGridSelectionController<TData> {
	private lastActiveSelection?: {
		data: TData
		selected: boolean
	}

	constructor(readonly host: SelectableComponent<TData>) { }

	get hasSelection() {
		return this.mode !== DataGridSelectionMode.None
	}

	private get mode() { return this.host.selectionMode }

	private get data() { return this.host.flattenedData }
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
			this.host.selectionChange?.dispatch(selectableData)
		}
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
					dataToSelect = this.host.selectionCheckboxesHidden
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