import { type DataGrid } from './DataGrid.js'

export class DataRecord<TData> {
	constructor(readonly dataGrid: DataGrid<TData, any>, init: Partial<DataRecord<TData>>) {
		Object.assign(this, init)
		if (!this.subData?.length) {
			// @ts-expect-error This is the constructor!
			delete this.subData
		}
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

	readonly subData?: Array<DataRecord<TData>>

	getSubDataByLevel(level: number) {
		return this.subData?.filter(r => r.level === level)
	}

	get hasSubData(): boolean {
		return (this.subData?.length ?? 0) > 0
	}

	get hasDetails(): boolean {
		return this.dataGrid.detailsController.hasDetail(this)
	}
}