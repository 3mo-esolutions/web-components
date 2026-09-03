import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import '@3mo/select-field'
import { type DataGrid, DataGridSelectability, type DataGridHeader } from './index.js'

type Person = { id: number, name: string, age: number }

const testData: Array<Person> = [
	{ id: 1, name: 'Alice', age: 30 },
	{ id: 2, name: 'Bob', age: 25 },
]

describe('DataGridHeader', () => {
	const fixture = new ComponentTestFixture<DataGrid<Person>>(html`
		<mo-data-grid .data=${testData} selectability=${DataGridSelectability.Multiple}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
		</mo-data-grid>
	`)

	const getHeader = () => fixture.component.renderRoot.querySelector('mo-data-grid-header') as DataGridHeader<Person>

	const settle = async () => {
		await fixture.updateComplete
		await new Promise(r => setTimeout(r, 30))
		const header = getHeader()
		header.requestUpdate()
		await header.updateComplete
		return header
	}

	describe('Selection checkbox', () => {
		const checkboxOf = (header: DataGridHeader<Person>) => header.renderRoot.querySelector('.selection mo-checkbox')

		it('should render only for multiple selectability', async () => {
			expect(checkboxOf(await settle())).not.toBeNull()

			fixture.component.selectability = DataGridSelectability.Single
			expect(checkboxOf(await settle())).toBeNull()
			expect((await settle()).renderRoot.querySelector('.selection')).not.toBeNull()

			fixture.component.selectability = DataGridSelectability.Multiple
			expect(checkboxOf(await settle())).not.toBeNull()
		})

		it('should be indeterminate while only part of the data is selected', async () => {
			expect(checkboxOf(await settle())?.selected).toBeFalse()

			fixture.component.select([testData[0]!])
			expect(checkboxOf(await settle())?.selected).toBe('indeterminate')

			fixture.component.selectAll()
			expect(checkboxOf(await settle())?.selected).toBeTrue()
		})

		it('should select all data when checked and deselect all from the indeterminate state', async () => {
			checkboxOf(await settle())!.change.dispatch(true)
			await settle()
			expect(fixture.component.selectedData).toEqual(testData)

			checkboxOf(await settle())!.change.dispatch(false)
			await settle()
			expect(fixture.component.selectedData).toEqual([])

			fixture.component.select([testData[0]!])
			await settle()
			checkboxOf(await settle())!.change.dispatch(true)
			await settle()

			expect(fixture.component.selectedData).toEqual([])
		})
	})

	describe('Details expander', () => {
		const expanderOf = (header: DataGridHeader<Person>) => header.renderRoot.querySelector('.details mo-icon-button')

		it('should render the toggle-all button only with multipleDetails', async () => {
			fixture.component.getRowDetailsTemplate = () => html`<div>Details</div>`
			const header = await settle()

			expect(fixture.component.hasDetails).toBeTrue()
			expect(header.renderRoot.querySelector('.details')).not.toBeNull()
			expect(expanderOf(header)).toBeNull()

			fixture.component.multipleDetails = true

			expect(expanderOf(await settle())).not.toBeNull()
		})

		it('should toggle all details and switch its icon between unfold_more and unfold_less', async () => {
			fixture.component.getRowDetailsTemplate = () => html`<div>Details</div>`
			fixture.component.multipleDetails = true
			let header = await settle()
			expect(expanderOf(header)?.getAttribute('icon')).toBe('unfold_more')

			expanderOf(header)!.click()
			header = await settle()

			expect(fixture.component.allRowDetailsOpen).toBeTrue()
			expect(fixture.component.rows.every(row => row.detailsOpen)).toBeTrue()
			expect(expanderOf(header)?.getAttribute('icon')).toBe('unfold_less')

			expanderOf(header)!.click()
			header = await settle()

			expect(fixture.component.rows.some(row => row.detailsOpen)).toBeFalse()
			expect(expanderOf(header)?.getAttribute('icon')).toBe('unfold_more')
		})
	})

	describe('Actions', () => {
		it('should show the column-settings button by default', async () => {
			const header = await settle()

			expect(header.renderRoot.querySelector('.actions mo-icon-button')).not.toBeNull()
			expect(header.renderRoot.querySelector('.actions mo-icon[icon=view_column]')).not.toBeNull()
			expect(header.renderRoot.querySelector('.context-menu')).toBeNull()
		})

		it('should replace it with the selection context menu while more than one row is selected and the grid has a context menu', async () => {
			fixture.component.getRowContextMenuTemplate = () => html`<mo-context-menu-item>Action</mo-context-menu-item>`
			fixture.component.select([testData[0]!])
			expect((await settle()).renderRoot.querySelector('.context-menu')).toBeNull()

			fixture.component.selectAll()
			const header = await settle()

			expect(header.renderRoot.querySelector('.context-menu mo-icon-button')).not.toBeNull()
			expect(header.renderRoot.querySelector('.actions')).toBeNull()
		})
	})

	describe('Column settings menu', () => {
		const columnCheckboxesOf = (header: DataGridHeader<Person>) => [...header.renderRoot.querySelectorAll('mo-popover mo-checkbox')]

		it('should list every column with the visible ones checked', async () => {
			const header = await settle()

			expect(columnCheckboxesOf(header).map(c => c.label)).toEqual(['Name', 'Age'])
			expect(columnCheckboxesOf(header).map(c => c.selected)).toEqual([true, true])

			fixture.component.columns.find(c => c.dataSelector === 'age')!.hide()

			expect(columnCheckboxesOf(await settle()).map(c => c.selected)).toEqual([true, false])
		})

		it('should record hiding and re-showing a column as a modification', async () => {
			const header = await settle()
			const ageCheckbox = columnCheckboxesOf(header)[1]!

			ageCheckbox.change.dispatch(false)
			await settle()

			expect(fixture.component.columns.find(c => c.dataSelector === 'age')?.hidden).toBeTrue()
			expect(fixture.component.columnsController.columns.modifications.get('age')?.hidden).toBeTrue()
			expect(fixture.component.visibleColumns.map(c => c.dataSelector)).toEqual(['name'])

			columnCheckboxesOf(await settle())[1]!.change.dispatch(true)
			await settle()

			expect(fixture.component.columns.find(c => c.dataSelector === 'age')?.hidden).toBeFalse()
			expect(fixture.component.columnsController.columns.modifications.get('age')?.hidden).toBeFalse()
		})

		it('should bind font size and row height to the grid', async () => {
			const header = await settle()
			const [fontSizeField, rowHeightField] = [...header.renderRoot.querySelectorAll('mo-field-select')]

			fontSizeField!.dispatchEvent(new CustomEvent('change', { detail: 1.1 }))
			rowHeightField!.dispatchEvent(new CustomEvent('change', { detail: 45 }))
			await settle()

			expect(fixture.component.cellFontSize).toBe(1.1)
			expect(fixture.component.rowHeight).toBe(45)
			expect(fixture.component.style.getPropertyValue('--mo-data-grid-cell-font-size')).toBe('1.1rem')
			expect(fixture.component.style.getPropertyValue('--mo-data-grid-row-height')).toBe('45px')
		})
	})

	describe('Column reordering', () => {
		it('should move the dragged column to the drop position as a column modification', async () => {
			const header = await settle()
			expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['name', 'age'])

			header.reorderabilityController.options.handleReorder!(0, 1)
			await settle()

			expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['age', 'name'])
			expect(fixture.component.columnsController.columns.modifications.map(m => m.dataSelector)).toEqual(['age', 'name'])
		})

		it('should not offer dragging for sticky columns', async () => {
			fixture.component.querySelector('mo-data-grid-column-text')!.sticky = 'start'
			const header = await settle()

			const items = header.reorderabilityController.indexability.items

			expect(items.length).toBe(2)
			expect(items[0]?.options.disabled).toBeTrue()
			expect(items[1]?.options.disabled).toBeFalse()
			expect(items[0]?.options.handle).toBe('#reorderable-area')
		})
	})

	describe('Lifecycle', () => {
		it('should re-render on the grid\'s dataChange and unsubscribe when disconnected, as a leaked subscription would update a dead header', async () => {
			const header = await settle()
			const requestUpdate = spyOn(header, 'requestUpdate')

			fixture.component.dataChange.dispatch(testData)
			expect(requestUpdate).toHaveBeenCalled()

			requestUpdate.calls.reset()
			header.remove()
			fixture.component.dataChange.dispatch(testData)

			expect(requestUpdate).not.toHaveBeenCalled()
		})
	})
})