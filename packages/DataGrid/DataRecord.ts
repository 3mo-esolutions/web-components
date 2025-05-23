import { type DataGrid } from './DataGrid.js'

export class DataRecord<TData> {
	constructor(readonly dataGrid: DataGrid<TData, any>, init: Partial<DataRecord<TData>>) {
		Object.assign(this, init)
		this.subDataRecords = !this.subDataRecords?.length ? undefined : this.subDataRecords
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

	readonly subDataRecords?: Array<DataRecord<TData>>

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