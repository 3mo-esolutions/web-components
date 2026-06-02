import { type HierarchyNode } from '@3mo/hierarchy'
import { type DataGridController } from './DataGridController.js'

export class DataRecord<TData> {
	constructor(readonly controller: DataGridController<TData, any>, init: Partial<Pick<DataRecord<TData>, 'data' | 'index' | 'level' | 'node' | 'parentRecord'>>) {
		const { node, ...rest } = init
		Object.assign(this, rest)
		Object.defineProperty(this, 'node', { value: node, enumerable: false, writable: true, configurable: true })
	}

	readonly node?: HierarchyNode<TData>
	readonly data!: TData
	readonly index!: number
	readonly level!: number
	readonly parentRecord?: DataRecord<TData>

	get isLastChild(): boolean {
		if (!this.parentRecord) {
			return true
		}
		const siblings = this.parentRecord.subDataRecords
		return siblings ? siblings[siblings.length - 1] === this : true
	}

	get isSelected(): boolean {
		return this.controller.selection.isSelected(this.data)
	}

	get isSelectable(): boolean {
		return this.controller.selection.isSelectable(this.data)
	}

	get detailsOpen(): boolean {
		return this.controller.details.isOpen(this)
	}

	private _subDataRecords?: Array<DataRecord<TData>>
	get subDataRecords() {
		return this._subDataRecords ??= this.controller.records.subRecordsOf(this)
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
		return this.controller.details.hasDetail(this)
	}
}