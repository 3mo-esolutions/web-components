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
			const rowClick = spyOn(fixture.component.rowClick, 'dispatch')

			row.content.dispatchEvent(new MouseEvent('click', { bubbles: true }))

			expect(rowClick).toHaveBeenCalledOnceWith(row)
		})

		it('should dispatch rowDoubleClick on double-click', async () => {
			const row = getRow(0)
			const rowDoubleClick = spyOn(fixture.component.rowDoubleClick, 'dispatch')

			row.content.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
			await new Promise(r => setTimeout(r, 20))

			expect(rowDoubleClick).toHaveBeenCalledOnceWith(row)
		})

		it('should dispatch rowMiddleClick only for the middle auxclick button, as other aux buttons mean nothing here', async () => {
			const row = getRow(0)
			const rowMiddleClick = spyOn(fixture.component.rowMiddleClick, 'dispatch')

			row.content.dispatchEvent(new MouseEvent('auxclick', { button: 1, bubbles: true }))
			await new Promise(r => setTimeout(r, 20))
			expect(rowMiddleClick).toHaveBeenCalledOnceWith(row)

			rowMiddleClick.calls.reset()
			row.content.dispatchEvent(new MouseEvent('auxclick', { button: 2, bubbles: true }))
			await new Promise(r => setTimeout(r, 20))

			expect(rowMiddleClick).not.toHaveBeenCalled()
		})

		it('should not dispatch rowClick for clicks on the selection or details-expander areas, as they stop propagation', async () => {
			await settle()
			const row = getRow(0)
			const rowClick = spyOn(fixture.component.rowClick, 'dispatch')

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
			expect(disabled.disabled).toBeTrue()
			const clicks = {
				plain: spyOn(plain, 'click'),
				disabled: spyOn(disabled, 'click'),
				primary: spyOn(primary, 'click'),
			}
			const close = jasmine.createSpy('close')
			spyOnProperty(ContextMenu, 'openInstance', 'get').and.returnValue({ items: [plain, disabled, primary], close } as any)

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
		it('should render nothing while not intersecting the scroller\'s expanded viewport', async () => {
			const row = getRow(0)
			expect(row.renderRoot.querySelector('#contentContainer')).not.toBeNull()

			row.isIntersecting = false
			await row.updateComplete

			expect(row.renderRoot.querySelector('#contentContainer')).toBeNull()
			expect(row.renderRoot.querySelector('mo-data-grid-cell')).toBeNull()
		})

		it('should render the first 25 rows eagerly on connect, as the observer has not reported yet', async () => {
			const row = getRow(0)
			row.isIntersecting = false
			await row.updateComplete
			expect(row.renderRoot.querySelector('#contentContainer')).toBeNull()

			const parent = row.parentElement!
			row.remove()
			parent.appendChild(row)
			await row.updateComplete

			expect(row.index).toBeLessThan(25)
			expect(row.isIntersecting).toBeTrue()
			expect(row.renderRoot.querySelector('#contentContainer')).not.toBeNull()
		})

		it('should unobserve itself on disconnect', () => {
			const row = getRow(0)
			const unobserve = spyOn(fixture.component.rowIntersectionObserver!, 'unobserve')

			row.remove()

			expect(unobserve).toHaveBeenCalledOnceWith(row)
		})
	})

	describe('Details', () => {
		it('should render sub-rows for records with sub data', async () => {
			const row = getRow(0)
			expect(row.subRows.length).toBe(0)

			row.toggleDetails()
			await settle()

			expect(row.detailsOpen).toBeTrue()
			expect(row.subRows.length).toBe(1)
			expect(row.subRows[0]?.data.name).toBe('Alice Jr')
			expect(row.subRows[0]?.level).toBe(1)
		})

		it('should disable the selection checkbox for unselectable data', async () => {
			fixture.component.isDataSelectable = data => data.id !== 2
			await settle()

			expect(getRow(0).renderRoot.querySelector('mo-checkbox')?.disabled).toBeFalse()
			expect(getRow(1).renderRoot.querySelector('mo-checkbox')?.disabled).toBeTrue()
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
})