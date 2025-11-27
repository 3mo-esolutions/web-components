import { type DataGrid } from './DataGrid.js'

export class DataRecord<TData> {
	constructor(readonly dataGrid: DataGrid<TData, any>, init: Partial<DataRecord<TData>>) {
		Object.assign(this, init)
	}

	readonly data!: TData
	readonly index!: number
	readonly level!: number

	get isSelected(): boolean {
		return this.dataGrid.selectionController.isSelected(this.data)
	}

	get isSelectable(): boolean {
		return this.dataGrid.selectionController.isSelectable(this.data)
	}

	get detailsOpen(): boolean {
		return this.dataGrid.detailsController.isOpen(this)
	}

	private _subDataRecords?: Array<DataRecord<TData>>
	get subDataRecords() {
		if (!this.dataGrid.subDataGridDataSelector) {
			return undefined
		}

		if (this._subDataRecords !== undefined) {
			return this._subDataRecords
		}

		const subData = KeyPath.get(this.data, this.dataGrid.subDataGridDataSelector)
		if (!Array.isArray(subData) || !subData.length) {
			return undefined
		}

		return this._subDataRecords = this.dataGrid.sortingController
			.toSortedBy<TData>(subData, d => d)
			.map(data => new DataRecord(this.dataGrid, { data, level: this.level + 1 }))
	}

	get flattenedRecords(): Array<DataRecord<TData>> {
		return [
			this,
			...(this.subDataRecords?.flatMap(r => r.flattenedRecords) ?? [])
		]
	}

	getSubDataByLevel(level: number) {
		return this.subDataRecords?.filter(r => r.level === level)
	}

	get hasSubData(): boolean {
		return (this.subDataRecords?.length ?? 0) > 0
	}

	get hasDetails(): boolean {
		return this.dataGrid.detailsController.hasDetail(this)
	}
}