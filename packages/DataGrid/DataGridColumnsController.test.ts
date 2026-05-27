import { DataGridColumnsController } from './DataGridColumnsController.js'

describe('DataGridColumnsController', () => {
	const createController = (host = {}) => new DataGridColumnsController({
		addController: () => { },
		reorderabilityController: { enabled: false },
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
	})
})