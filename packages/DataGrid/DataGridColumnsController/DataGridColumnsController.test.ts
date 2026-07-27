import { DataGridColumnsController } from './DataGridColumnsController.js'

describe('DataGridColumnsController', () => {
	const createController = (host = {}) => new DataGridColumnsController({
		addController: () => { },
		reorderabilityController: { visible: false },
		hasSelection: true,
		hasDetails: true,
		...host,
	} as any)

	describe('getStickyColumnInsetInline', () => {
		it('excludes the details column width from the selection inset once the grid no longer renders a details column', () => {
			const controller = createController()
			controller.setColumnWidth('details', 32)

			// While grouped the expander/details column is present, so the sticky selection column sits behind it.
			expect(controller.getStickyColumnInsetInline('selection')).toBe('32px')

			// Ungrouping removes the details column. Its last measured width must not leak into the inset anymore.
			;(controller.host as any).hasDetails = false
			expect(controller.getStickyColumnInsetInline('selection')).toBe('0px')
		})

		it('keeps the reordering column width in the inset while it is visible but disabled (e.g. the grid is sorted)', () => {
			const controller = createController({ reorderabilityController: { visible: true }, hasDetails: false })
			controller.setColumnWidth('reordering', 40)

			// The reordering column still occupies space while sorted, so the selection column must sit behind it.
			expect(controller.getStickyColumnInsetInline('selection')).toBe('40px')
		})
	})
})