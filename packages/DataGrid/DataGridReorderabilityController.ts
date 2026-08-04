import { ReorderabilityController } from '@3mo/reorderability'
import type { DataGrid } from './DataGrid.js'
import type { DataRecord } from './DataRecord.js'

export type DataGridReorderChange<T> = {
	readonly type: 'move' | 'shift'
	readonly record: DataRecord<T>
	readonly oldIndex: number
}

export class DataGridReorderabilityController<T> extends ReorderabilityController {
	constructor(override readonly host: DataGrid<T, any>) {
		super(host)
	}

	get visible() {
		return this.host.reorderability && !this.host.detailsController.hasDetails
	}

	get enabled() {
		return this.visible && !this.host.sortingController.enabled
	}

	reorder(source: number, destination: number) {
		this.handleReorder(source, destination)
	}

	protected override handleReorder(source: number, destination: number) {
		if (source === destination) {
			return
		}

		const d = [...this.host.data]
		const [movedItem] = d.splice(source, 1)
		d.splice(destination, 0, movedItem!)

		this.host.data = d

		const isMovingDown = source < destination
		this.host.reorder.dispatch([
			{
				record: this.host.dataRecords[destination]!,
				oldIndex: source,
				type: 'move',
			},
			...Array.from({ length: Math.abs(destination - source) })
				.map((_, i) => isMovingDown ? source + i : destination + i + 1)
				.map(i => ({
					record: this.host.dataRecords[i]!,
					oldIndex: isMovingDown ? i + 1 : i - 1,
					type: 'shift',
				} as const))
		])
	}
}