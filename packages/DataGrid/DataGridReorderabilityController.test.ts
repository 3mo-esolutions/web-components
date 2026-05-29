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
})