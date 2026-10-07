import { DataGridReorderabilityController } from './DataGridReorderabilityController.js'

describe('DataGridReorderabilityController', () => {
	/** Stands in for the grid's controller: the reordering only ever asks it for these. */
	const createController = (options = {}, grid = {}) => new DataGridReorderabilityController({
		host: { addController: () => { } },
		options: { reorderability: true, ...options },
		sorting: { enabled: false },
		details: { hasDetails: false },
		...grid,
	} as any)

	describe('visible', () => {
		it('stays true while the grid is sorted, so the column is kept and only dragging is disabled', () => {
			expect(createController({}, { sorting: { enabled: true } }).visible).toBe(true)
		})

		it('is false when the feature is off or the grid shows details', () => {
			expect(createController({ reorderability: false }).visible).toBe(false)
			expect(createController({}, { details: { hasDetails: true } }).visible).toBe(false)
		})
	})

	describe('enabled', () => {
		it('is false while the grid is sorted, even though the column is still visible', () => {
			const controller = createController({}, { sorting: { enabled: true } })
			expect(controller.visible).toBe(true)
			expect(controller.enabled).toBe(false)
		})

		it('is true when the feature is on and the grid is neither sorted nor showing details', () => {
			expect(createController().enabled).toBe(true)
		})
	})

	describe('handleReorder', () => {
		const createGrid = (data: Array<string>) => {
			const dispatched = new Array<Array<{ type: string, oldIndex: number, index: number }>>()
			const host = {
				reorderability: true,
				data,
				handleReorder: (reordered: Array<string>, changes: any) => {
					host.data = reordered
					dispatched.push(changes.map((c: any) => ({ type: c.type, oldIndex: c.oldIndex, index: c.record.index })))
				},
			}
			const grid = {
				host: { addController: () => { } },
				options: host,
				sorting: { enabled: false },
				details: { hasDetails: false },
				records: { recordsOf: (records: Array<string>) => records.map((_, index) => ({ index })) },
			}
			return { host, controller: new DataGridReorderabilityController(grid as any), dispatched }
		}

		it('moves the datum and reports the move plus every record it shifted', () => {
			const { host, controller, dispatched } = createGrid(['a', 'b', 'c', 'd'])
			controller.reorder(0, 2)
			expect(host.data).toEqual(['b', 'c', 'a', 'd'])
			expect(dispatched[0]).toEqual([
				{ type: 'move', oldIndex: 0, index: 2 },
				{ type: 'shift', oldIndex: 1, index: 0 },
				{ type: 'shift', oldIndex: 2, index: 1 },
			])
		})

		it('moves backwards too', () => {
			const { host, controller } = createGrid(['a', 'b', 'c', 'd'])
			controller.reorder(3, 1)
			expect(host.data).toEqual(['a', 'd', 'b', 'c'])
		})

		it('is a no-op when the destination is the source', () => {
			const { host, controller, dispatched } = createGrid(['a', 'b'])
			controller.reorder(1, 1)
			expect(host.data).toEqual(['a', 'b'])
			expect(dispatched).toEqual([])
		})
	})
})
