import { DataGridColumn } from '../index.js'
import { DataGridColumnsController } from './DataGridColumnsController.js'

type Data = { a: number, b: number }

describe('DataGridColumnsController', () => {
	/** Stands in for the grid's controller: the columns only ever ask it for these. */
	const createController = (setup: Partial<typeof defaults> = {}) => {
		const state = { ...defaults, ...setup }
		const grid = {
			host: { addController: () => { }, requestUpdate: () => { }, style: document.createElement('div').style },
			options: { data: [], columns: [] },
			selection: { get hasSelection() { return state.hasSelection } },
			details: { get hasDetails() { return state.hasDetails } },
			contextMenu: { get hasContextMenu() { return state.hasContextMenu } },
			reorderability: { get visible() { return state.reorderabilityVisible }, enabled: false },
			restampSticky: () => { },
		} as any
		const controller = new DataGridColumnsController<Data>(grid)
		grid.columns = controller
		return Object.assign(controller, { state })
	}
	const defaults = { hasSelection: true, hasDetails: true, hasContextMenu: false, reorderabilityVisible: false }

	describe('getStickyColumnInsetInline', () => {
		it('excludes the details column width from the selection inset once the grid no longer renders a details column', () => {
			const controller = createController()
			controller.setColumnWidth('details', 32)

			// While grouped the expander/details column is present, so the sticky selection column sits behind it.
			expect(controller.getStickyColumnInsetInline('selection')).toBe('32px')

			// Ungrouping removes the details column. Its last measured width must not leak into the inset anymore.
			controller.state.hasDetails = false
			expect(controller.getStickyColumnInsetInline('selection')).toBe('0px')
		})

		it('keeps the reordering column width in the inset while it is visible but disabled (e.g. the grid is sorted)', () => {
			const controller = createController({ reorderabilityVisible: true, hasDetails: false })
			controller.setColumnWidth('reordering', 40)

			// The reordering column still occupies space while sorted, so the selection column must sit behind it.
			expect(controller.getStickyColumnInsetInline('selection')).toBe('40px')
		})

		it('should stack a sticky data column\'s inset from the measured widths of the preceding sticky columns and the feature columns', () => {
			const controller = createController({ reorderabilityVisible: true, hasContextMenu: true })
			controller.setColumnWidth('reordering', 20)
			controller.setColumnWidth('details', 20)
			controller.setColumnWidth('selection', 40)
			controller.setColumnWidth('actions', 28)
			controller.columns.definitions = [
				new DataGridColumn<Data>({ dataSelector: 'a', heading: 'A', sticky: 'start' }),
				new DataGridColumn<Data>({ dataSelector: 'b', heading: 'B', sticky: 'start' }),
				new DataGridColumn<Data>({ dataSelector: 'c' as any, heading: 'C', sticky: 'end' }),
				new DataGridColumn<Data>({ dataSelector: 'd' as any, heading: 'D', sticky: 'both' }),
			]
			controller.setWidthInPixels('a', 100)
			controller.setWidthInPixels('b', 50)
			controller.setWidthInPixels('c' as any, 70)

			const [a, b, c, d] = [...controller.columns]

			expect(controller.getStickyColumnInsetInline(a!)).toBe('80px auto')
			expect(controller.getStickyColumnInsetInline(b!)).toBe('180px auto')
			expect(controller.getStickyColumnInsetInline(c!)).toBe('auto 28px')
			expect(controller.getStickyColumnInsetInline(d!)).toBe('230px 28px')
		})

		it('should stack two sticky columns showing the same data one behind the other', () => {
			const controller = createController({ hasDetails: false })
			controller.setColumnWidth('selection', 40)
			controller.columns.definitions = [
				new DataGridColumn<Data>({ dataSelector: 'a', heading: 'A', sticky: 'start' }),
				new DataGridColumn<Data>({ dataSelector: 'b', heading: 'B' }),
				new DataGridColumn<Data>({ dataSelector: 'a', heading: 'A again', sticky: 'start' }),
			]
			controller.setWidthInPixels('a', 100)

			const [first, , second] = [...controller.columns]

			expect(controller.getStickyColumnInsetInline(first!)).toBe('40px auto')
			expect(controller.getStickyColumnInsetInline(second!)).toBe('140px auto')
		})
	})

	describe('column widths', () => {
		it('should keep measured widths across column re-derivation, keyed by data selector, as columns are immutable value-objects', () => {
			const controller = createController()
			const definition = new DataGridColumn<Data>({ dataSelector: 'a', heading: 'A' })
			controller.columns.definitions = [definition]

			controller.columns.get('a')!.widthInPixels = 120

			controller.columns.modify('a', { width: '120px' })
			const rederived = controller.columns.get('a')!

			expect(rederived).not.toBe(definition)
			expect(controller.getWidthInPixels('a')).toBe(120)
			expect(rederived.widthInPixels).toBe(120)
		})
	})
})