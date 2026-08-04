import { DataGridReorderabilityController } from './DataGridReorderabilityController.js'

describe('DataGridReorderabilityController', () => {
	const createController = (host = {}) => new DataGridReorderabilityController({
		addController: () => { },
		reorderability: true,
		sortingController: { enabled: false },
		detailsController: { hasDetails: false },
		...host,
	} as any)

	describe('visible', () => {
		it('stays true while the grid is sorted, so the column is kept and only dragging is disabled', () => {
			expect(createController({ sortingController: { enabled: true } }).visible).toBe(true)
		})

		it('is false when the feature is off or the grid shows details', () => {
			expect(createController({ reorderability: false }).visible).toBe(false)
			expect(createController({ detailsController: { hasDetails: true } }).visible).toBe(false)
		})
	})

	describe('enabled', () => {
		it('is false while the grid is sorted, even though the column is still visible', () => {
			const controller = createController({ sortingController: { enabled: true } })
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
				addController: () => { },
				reorderability: true,
				sortingController: { enabled: false },
				detailsController: { hasDetails: false },
				data,
				get dataRecords() { return this.data.map((_: string, index: number) => ({ index })) },
				reorder: { dispatch: (changes: any) => dispatched.push(changes.map((c: any) => ({ type: c.type, oldIndex: c.oldIndex, index: c.record.index }))) },
			}
			return { host, controller: new DataGridReorderabilityController(host as any), dispatched }
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