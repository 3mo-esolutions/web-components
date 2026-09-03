import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type DataGrid, DataGridColumn, DataGridSelectability } from '../index.js'
import { DataGridColumnsController } from './DataGridColumnsController.js'

type Data = { a: number, b: number }

describe('DataGridColumnsController', () => {
	const createController = (host = {}) => {
		const fakeHost = {
			addController: () => { },
			reorderabilityController: { visible: false },
			hasSelection: true,
			hasDetails: true,
			hasContextMenu: false,
			columnsChange: { dispatch: () => { } },
			requestUpdate: () => { },
			...host,
		} as any
		const controller = new DataGridColumnsController<Data>(fakeHost)
		fakeHost.columnsController = controller
		return controller
	}

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

		it('should stack a sticky data column\'s inset from the measured widths of the preceding sticky columns and the feature columns', () => {
			const controller = createController({ reorderabilityController: { visible: true }, hasContextMenu: true })
			controller.setColumnWidth('reordering', 20)
			controller.setColumnWidth('details', 20)
			controller.setColumnWidth('selection', 40)
			controller.setColumnWidth('actions', 28)
			controller.columns.definitions.programmatic = [
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
	})

	describe('column widths', () => {
		it('should keep measured widths across column re-derivation, keyed by data selector, as columns are immutable value-objects', () => {
			const controller = createController()
			const definition = new DataGridColumn<Data>({ dataSelector: 'a', heading: 'A' })
			controller.columns.definitions.programmatic = [definition]

			controller.columns.get('a')!.widthInPixels = 120

			controller.columns.modify('a', { width: '120px' })
			const rederived = controller.columns.get('a')!

			expect(rederived).not.toBe(definition)
			expect(controller.getWidthInPixels('a')).toBe(120)
			expect(rederived.widthInPixels).toBe(120)
		})
	})

	describe('CSS column tracks', () => {
		const fixture = new ComponentTestFixture<DataGrid<Data>>(html`
			<mo-data-grid .data=${[{ a: 1, b: 2 }]}>
				<mo-data-grid-column-number heading='A' dataSelector='a'></mo-data-grid-column-number>
				<mo-data-grid-column-number heading='B' dataSelector='b' width='50px'></mo-data-grid-column-number>
			</mo-data-grid>
		`)

		const tracks = async () => {
			await fixture.updateComplete
			await new Promise(r => setTimeout(r, 30))
			await fixture.updateComplete
			return fixture.component.style.getPropertyValue('--mo-data-grid-columns')
		}

		const dataTrackCount = (value: string) => value.match(/\[data\]/g)?.length ?? 0

		it('should provide a named track per visible column and none for hidden ones, as a zero track would still render a gap', async () => {
			const value = await tracks()

			expect(dataTrackCount(value)).toBe(2)
			expect(value).toContain('[data] max-content')
			expect(value).toContain('[data] 50px')
			expect(value).toContain('[padding] 1fr')
			expect(value).toContain('[actions]')

			fixture.component.columns.find(c => c.dataSelector === 'b')!.hide()
			const hidden = await tracks()

			expect(dataTrackCount(hidden)).toBe(1)
			expect(hidden).not.toContain('50px')
		})

		it('should include the selection, details and reorder tracks only while the corresponding feature is active', async () => {
			const initial = await tracks()
			expect(initial).not.toContain('[selection]')
			expect(initial).not.toContain('[details]')
			expect(initial).not.toContain('[order]')

			fixture.component.selectability = DataGridSelectability.Multiple
			expect(await tracks()).toContain('[selection]')

			fixture.component.getRowDetailsTemplate = () => html`<div>Details</div>`
			expect(await tracks()).toContain('[details]')

			fixture.component.getRowDetailsTemplate = undefined
			fixture.component.reorderability = true
			const reorderable = await tracks()

			expect(reorderable).toContain('[order]')
			expect(reorderable).not.toContain('[details]')
		})
	})
})