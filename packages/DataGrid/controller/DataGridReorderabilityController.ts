import { ReorderabilityController } from '@3mo/reorderability'
import type { DataGridController } from './DataGridController.js'
import type { DataRecord } from './DataRecord.js'

export type DataGridReorderChange<T> = {
	readonly type: 'move' | 'shift'
	readonly record: DataRecord<T>
	readonly oldIndex: number
}

export class DataGridReorderabilityController<T> extends ReorderabilityController {
	constructor(private readonly grid: DataGridController<T>) {
		super(grid.host)
	}

	get visible() {
		return !!this.grid.options.reorderability && !this.grid.details.hasDetails
	}

	get enabled() {
		return this.visible && !this.grid.sorting.enabled
	}

	reorder(source: number, destination: number) {
		this.handleReorder(source, destination)
	}

	protected override handleReorder(source: number, destination: number) {
		if (source === destination) {
			return
		}

		const data = [...this.grid.options.data]
		const [movedItem] = data.splice(source, 1)
		data.splice(destination, 0, movedItem!)

		const records = this.grid.records.recordsOf(data)
		const isMovingDown = source < destination
		this.grid.options.handleReorder?.(data, [
			{
				record: records[destination]!,
				oldIndex: source,
				type: 'move',
			},
			...Array.from({ length: Math.abs(destination - source) })
				.map((_, i) => isMovingDown ? source + i : destination + i + 1)
				.map(i => ({
					record: records[i]!,
					oldIndex: isMovingDown ? i + 1 : i - 1,
					type: 'shift',
				} as const))
		])
	}
}