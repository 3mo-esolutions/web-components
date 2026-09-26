import { html, render } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { ContextMenu, type ContextMenuItem } from '@3mo/context-menu'
import { type DataGrid, DataGridPrimaryContextMenuItem, type DataGridRow, DataGridSelectability } from '../index.js'

type Person = { id: number, name: string, sub?: Array<Person> }

const testData: Array<Person> = [
	{ id: 1, name: 'Alice', sub: [{ id: 11, name: 'Alice Jr' }] },
	{ id: 2, name: 'Bob' },
	{ id: 3, name: 'Charlie' },
]

describe('DataGridRow', () => {
	const fixture = new ComponentTestFixture<DataGrid<Person>>(html`
		<mo-data-grid .data=${testData} selectability=${DataGridSelectability.Multiple} subDataGridDataSelector='sub'>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
		</mo-data-grid>
	`)

	const getRow = (index = 0) => fixture.component.rows[index]!
	const subRowsOf = (row: DataGridRow<Person>) => [...row.renderRoot.querySelectorAll<DataGridRow<Person>>('[mo-data-grid-row]')]

	const settle = async () => {
		await fixture.updateComplete
		await new Promise(r => setTimeout(r, 30))
		fixture.component.requestUpdate()
		await fixture.updateComplete
		for (const row of fixture.component.rows) {
			row.requestUpdate()
			await row.updateComplete
		}
	}

	describe('Click events', () => {
		it('should dispatch rowClick with the row when its content is clicked', () => {
			const row = getRow(0)
			const rowClick = vi.spyOn(fixture.component.rowClick, 'dispatch').mockReturnValue(undefined)

			row.content.dispatchEvent(new MouseEvent('click', { bubbles: true }))

			expect(rowClick).toHaveBeenCalledExactlyOnceWith(row)
		})

		it('should dispatch rowDoubleClick on double-click', async () => {
			const row = getRow(0)
			const rowDoubleClick = vi.spyOn(fixture.component.rowDoubleClick, 'dispatch').mockReturnValue(undefined)

			row.content.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
			await new Promise(r => setTimeout(r, 20))

			expect(rowDoubleClick).toHaveBeenCalledExactlyOnceWith(row)
		})

		it('should dispatch rowMiddleClick only for the middle auxclick button, as other aux buttons mean nothing here', async () => {
			const row = getRow(0)
			const rowMiddleClick = vi.spyOn(fixture.component.rowMiddleClick, 'dispatch').mockReturnValue(undefined)

			row.content.dispatchEvent(new MouseEvent('auxclick', { button: 1, bubbles: true }))
			await new Promise(r => setTimeout(r, 20))
			expect(rowMiddleClick).toHaveBeenCalledExactlyOnceWith(row)

			rowMiddleClick.mockClear()
			row.content.dispatchEvent(new MouseEvent('auxclick', { button: 2, bubbles: true }))
			await new Promise(r => setTimeout(r, 20))

			expect(rowMiddleClick).not.toHaveBeenCalled()
		})

		it('should not dispatch rowClick for clicks on the selection or details-expander areas, as they stop propagation', async () => {
			await settle()
			const row = getRow(0)
			const rowClick = vi.spyOn(fixture.component.rowClick, 'dispatch').mockReturnValue(undefined)

			row.renderRoot.querySelector('mo-checkbox')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
			expect(rowClick).not.toHaveBeenCalled()

			row.renderRoot.querySelector('#detailsExpanderIconButton')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
			expect(rowClick).not.toHaveBeenCalled()

			row.content.dispatchEvent(new MouseEvent('click', { bubbles: true }))
			expect(rowClick).toHaveBeenCalledTimes(1)
		})
	})

	describe('Context menu', () => {
		const contextMenuTemplate = () => html`<mo-context-menu-item>Action</mo-context-menu-item>`

		it('should select the not-yet-selected row when its context menu opens', async () => {
			fixture.component.getRowContextMenuTemplate = contextMenuTemplate
			await settle()

			await getRow(1).openContextMenu()
			await settle()

			expect(fixture.component.selectedData).toEqual([testData[1]!])
		})

		it('should keep a multi-selection when a selected row\'s context menu opens, as the menu acts on the whole selection', async () => {
			fixture.component.getRowContextMenuTemplate = contextMenuTemplate
			fixture.component.select([testData[0]!, testData[1]!])
			await settle()

			await getRow(0).openContextMenu()
			await settle()

			expect(fixture.component.selectedData).toEqual([testData[0]!, testData[1]!])
		})

		it('should not render the context-menu icon-button without a context menu template', async () => {
			fixture.component.getRowContextMenuTemplate = contextMenuTemplate
			await settle()
			expect(getRow(0).renderRoot.querySelector('#contextMenuIconButton')).not.toBeNull()

			fixture.component.getRowContextMenuTemplate = undefined
			await settle()

			expect(getRow(0).renderRoot.querySelector('#contextMenuIconButton')).toBeNull()
		})

		const expectPrimaryItemToBeClickedBy = async (activate: (row: DataGridRow<Person, undefined>) => void) => {
			fixture.component.getRowContextMenuTemplate = () => html`
				<mo-data-grid-primary-context-menu-item>Primary</mo-data-grid-primary-context-menu-item>
			`
			fixture.component.primaryContextMenuItemOnDoubleClick = true
			await settle()

			const items = document.createElement('div')
			render(html`
				<mo-context-menu-item>Plain</mo-context-menu-item>
				<mo-data-grid-primary-context-menu-item disabled>Disabled Primary</mo-data-grid-primary-context-menu-item>
				<mo-data-grid-primary-context-menu-item>Primary</mo-data-grid-primary-context-menu-item>
			`, items)
			document.body.appendChild(items)
			const [plain, disabled, primary] = [...items.children] as [ContextMenuItem, DataGridPrimaryContextMenuItem, DataGridPrimaryContextMenuItem]
			expect(primary).toBeInstanceOf(DataGridPrimaryContextMenuItem)
			expect(disabled.disabled).toBe(true)
			const clicks = {
				plain: vi.spyOn(plain, 'click').mockReturnValue(undefined),
				disabled: vi.spyOn(disabled, 'click').mockReturnValue(undefined),
				primary: vi.spyOn(primary, 'click').mockReturnValue(undefined),
			}
			const close = vi.fn()
			vi.spyOn(ContextMenu, 'openInstance', 'get').mockReturnValue({ items: [plain, disabled, primary], close } as any)

			activate(getRow(0))
			await new Promise(r => setTimeout(r, 30))

			expect(clicks.primary).toHaveBeenCalledTimes(1)
			expect(clicks.disabled).not.toHaveBeenCalled()
			expect(clicks.plain).not.toHaveBeenCalled()
			expect(close).toHaveBeenCalled()

			items.remove()
		}

		it('should click the enabled primary context menu item on double-click when primaryContextMenuItemOnDoubleClick', () =>
			expectPrimaryItemToBeClickedBy(row => row.content.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))))

		it('should click the primary context menu item on middle-click as well', () =>
			expectPrimaryItemToBeClickedBy(row => row.content.dispatchEvent(new MouseEvent('auxclick', { button: 1, bubbles: true }))))
	})

	describe('Virtualization', () => {
		const hide = (row: DataGridRow<Person>) => fixture.component.virtualizationController.hide(row)

		it('should render no cells while not intersecting the scroller\'s expanded viewport', async () => {
			const row = getRow(0)
			expect(row.renderRoot.querySelector('mo-data-grid-cell')).not.toBeNull()

			await hide(row)

			expect(row.renderRoot.querySelector('mo-data-grid-cell')).toBeNull()
		})

		it('should keep the strip and the details container while not intersecting, so that the row keeps its place', async () => {
			const row = getRow(0)
			const strip = row.content

			await hide(row)

			expect(row.content).toBe(strip)
			expect(row.renderRoot.querySelector('#detailsContainer')).not.toBeNull()
			expect(getComputedStyle(strip).minBlockSize).toBe(`${fixture.component.rowHeight + 1}px`)
		})

		it('should keep its sub rows while not intersecting, as they are rows of their own', async () => {
			const row = getRow(0)
			row.toggleDetails()
			await settle()
			expect(subRowsOf(row).length).toBe(1)

			await hide(row)

			expect(subRowsOf(row).length).toBe(1)
		})

		it('should keep its height while not intersecting, so that the rows below it do not move', async () => {
			const row = getRow(0)
			const height = row.getBoundingClientRect().height

			await hide(row)

			expect(row.getBoundingClientRect().height).toBe(height)
		})

		it('should stop subgridding the grid\'s columns while not intersecting, as every subgrid of them is measured again whenever any row changes', async () => {
			const row = getRow(0)
			expect(getComputedStyle(row.content).gridTemplateColumns).not.toBe('none')

			await hide(row)

			expect(getComputedStyle(row.content).gridTemplateColumns).toBe('none')
		})

		it('should not lay out the grid\'s columns at all while it has neither cells nor details', async () => {
			const row = getRow(1)
			expect(row.dataRecord.hasDetails).toBe(false)

			await hide(row)

			expect(getComputedStyle(row).gridTemplateColumns).toBe('none')
		})

		it('should render a row it has not decided about yet, as the observer only reports after the first paint', async () => {
			const row = getRow(0)
			expect(row.isRendered).toBe(true)

			await hide(row)
			expect(row.isRendered).toBe(false)
			expect(row.renderRoot.querySelector('mo-data-grid-cell')).toBeNull()

			await fixture.component.virtualizationController.reveal(row)

			expect(row.isRendered).toBe(true)
			expect(row.renderRoot.querySelector('mo-data-grid-cell')).not.toBeNull()
		})

		it('should register the part holding its cells rather than itself, and unregister it when dropped', () => {
			const row = getRow(0)
			const strip = row.content
			const registered = () => fixture.component.virtualizationController.indexability.items.map(item => item.element)
			expect(registered()).toContain(strip)
			expect(registered()).not.toContain(row)

			row.remove()

			expect(registered()).not.toContain(strip)
		})
	})

	describe('Details', () => {
		it('should render sub-rows for records with sub data', async () => {
			const row = getRow(0)
			expect(subRowsOf(row).length).toBe(0)

			row.toggleDetails()
			await settle()

			expect(row.detailsOpen).toBe(true)
			expect(subRowsOf(row).length).toBe(1)
			expect(subRowsOf(row)[0]?.data.name).toBe('Alice Jr')
			expect(subRowsOf(row)[0]?.level).toBe(1)
		})

		it('should disable the selection checkbox for unselectable data', async () => {
			fixture.component.isDataSelectable = data => data.id !== 2
			await settle()

			expect(getRow(0).renderRoot.querySelector('mo-checkbox')?.disabled).toBe(false)
			expect(getRow(1).renderRoot.querySelector('mo-checkbox')?.disabled).toBe(true)
		})
	})

	describe('getCell', () => {
		it('should find the cell by column equality, so a re-derived column instance of the same data selector still resolves', () => {
			const row = getRow(0)
			const column = fixture.component.columns[0]!

			expect(row.getCell(column)).toBe(row.cells[0])
			expect(row.getCell(column.with({ heading: 'Another Heading', width: '100px' }))).toBe(row.cells[0])
		})
	})

	describe('Registry', () => {
		it('should list the sub rows after their parent, and find them by their data', async () => {
			getRow(0).toggleDetails()
			await settle()
			const aliceJr = testData[0]!.sub![0]!

			expect(fixture.component.rows.map(row => row.data.name)).toEqual(['Alice', 'Alice Jr', 'Bob', 'Charlie'])
			expect(fixture.component.getRow(aliceJr)?.level).toBe(1)
		})
	})

	describe('ARIA', () => {
		it('should stamp every row with its role and its place in the hierarchy, sub rows included', async () => {
			getRow(0).toggleDetails()
			await settle()
			const rows = fixture.component.rows

			expect(fixture.component.role).toBe('treegrid')
			expect(rows.map(row => row.role)).toEqual(['row', 'row', 'row', 'row'])
			expect(rows.map(row => row.getAttribute('aria-level'))).toEqual(['1', '2', '1', '1'])
			expect(rows.map(row => row.getAttribute('aria-setsize'))).toEqual(['3', '1', '3', '3'])
			expect(rows.map(row => row.getAttribute('aria-posinset'))).toEqual(['1', '1', '2', '3'])
		})

		it('should announce the selection on every row, and the grid as multiselectable', async () => {
			await settle()
			getRow(1).renderRoot.querySelector('mo-checkbox')!.dispatchEvent(new CustomEvent('change', { detail: true }))
			await settle()

			expect(fixture.component.getAttribute('aria-multiselectable')).toBe('true')
			expect(fixture.component.rows.map(row => row.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])
		})

		it('should announce no selection while the grid is not selectable', async () => {
			fixture.component.selectability = undefined
			await settle()

			expect(fixture.component.hasAttribute('aria-multiselectable')).toBe(false)
			expect(fixture.component.rows.map(row => row.hasAttribute('aria-selected'))).toEqual([false, false, false])
		})

		it('should announce the expansion only on rows which have details', async () => {
			await settle()
			expect(fixture.component.rows.map(row => row.getAttribute('aria-expanded'))).toEqual(['false', null, null])

			getRow(0).toggleDetails()
			await settle()

			expect(getRow(0).getAttribute('aria-expanded')).toBe('true')
		})
	})

	describe('Re-rendering', () => {
		const rendered = async () => {
			await fixture.component.updateComplete
			await Promise.all(fixture.component.rows.map(row => row.updateComplete))
		}

		const spyOnUpdates = () => fixture.component.rows.map(row => [row, vi.spyOn(row as unknown as { update(...parameters: Array<unknown>): void }, 'update')] as const)
		const updatedRows = (spies: ReturnType<typeof spyOnUpdates>) => spies.filter(([, spy]) => spy.mock.calls.length > 0).map(([row]) => row.data.name)

		it('should re-render only the row whose selection changed', async () => {
			await settle()
			const spies = spyOnUpdates()

			getRow(1).renderRoot.querySelector('mo-checkbox')!.dispatchEvent(new CustomEvent('change', { detail: true }))
			await rendered()

			expect(updatedRows(spies)).toEqual(['Bob'])
		})

		it('should re-render only the two rows a single selection moved between', async () => {
			fixture.component.selectability = DataGridSelectability.Single
			fixture.component.selectedData = [testData[0]!]
			await settle()
			const spies = spyOnUpdates()

			fixture.component.select([testData[2]!])
			await rendered()

			expect(updatedRows(spies)).toEqual(['Alice', 'Charlie'])
		})

		it('should re-render only the row whose details toggled', async () => {
			await settle()
			const spies = spyOnUpdates()

			getRow(0).toggleDetails()
			await rendered()

			expect(updatedRows(spies)).toEqual(['Alice'])
		})
	})

	describe('Data changed in place', () => {
		const inPlaceFixture = new ComponentTestFixture<DataGrid<Person>>(html`
			<mo-data-grid selectability=${DataGridSelectability.Multiple}>
				<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			</mo-data-grid>
		`)

		const rendered = async () => {
			const grid = inPlaceFixture.component
			await grid.updateComplete
			await Promise.all(grid.rows.map(row => row.updateComplete))
			await Promise.all(grid.rows.flatMap(row => row.cells.map(cell => cell.updateComplete)))
		}

		const nameShownIn = (index: number) => inPlaceFixture.component.rows[index]!.cells[0]!.renderRoot.textContent?.trim()

		beforeEach(async () => {
			inPlaceFixture.component.data = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
			await rendered()
		})

		it('should show data changed in place once the grid is asked to update, as every row re-renders with it', async () => {
			inPlaceFixture.component.data[1]!.name = 'Robert'
			inPlaceFixture.component.requestUpdate()
			await rendered()

			expect(nameShownIn(1)).toBe('Robert')
		})

		it('should show data changed in place in reaction to a selection change, although a selection alone re-renders only its row', async () => {
			inPlaceFixture.component.selectionChange.subscribe(() => {
				inPlaceFixture.component.data[1]!.name = 'Robert'
				inPlaceFixture.component.requestUpdate()
			})

			inPlaceFixture.component.rows[0]!.renderRoot.querySelector('mo-checkbox')!.dispatchEvent(new CustomEvent('change', { detail: true }))
			await rendered()

			expect(nameShownIn(1)).toBe('Robert')
		})
	})
})