import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { NotificationComponent } from '@a11d/lit-application'
import '@3mo/localization'
import { type DataGrid, DataGridColumn, DataGridEditability, DataGridSelectability } from './index.js'

type Person = { id: number, name: string, age: number }

const testData: Array<Person> = [
	{ id: 1, name: 'Alice', age: 30 },
	{ id: 2, name: 'Bob', age: 25 },
]

describe('DataGridCell', () => {
	const fixture = new ComponentTestFixture<DataGrid<Person>>(html`
		<mo-data-grid .data=${testData}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
		</mo-data-grid>
	`)

	const getCell = (rowIndex = 0, cellIndex = 0) => {
		return fixture.component.rows[rowIndex]!.cells[cellIndex]!
	}

	const settle = async () => {
		await fixture.updateComplete
		await new Promise(r => setTimeout(r, 30))
		fixture.component.requestUpdate()
		await fixture.updateComplete
		for (const row of fixture.component.rows) {
			row.requestUpdate()
			await row.updateComplete
			for (const cell of row.cells) {
				cell.requestUpdate()
				await cell.updateComplete
			}
		}
	}

	describe('Keyboard navigation', () => {
		it('should move focus with ArrowRight and ArrowLeft, wrapping around the row\'s cells', () => {
			const cell0 = getCell(0, 0)
			const cell1 = getCell(0, 1)

			spyOn(cell1, 'focus')
			cell0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
			expect(cell1.focus).toHaveBeenCalled()

			spyOn(cell0, 'focus')
			cell1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
			expect(cell0.focus).toHaveBeenCalledTimes(1)

			cell0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
			expect(cell1.focus).toHaveBeenCalledTimes(2)
		})

		it('should move focus with ArrowUp and ArrowDown, wrapping around the column\'s rows', () => {
			const row0Cell0 = getCell(0, 0)
			const row1Cell0 = getCell(1, 0)

			spyOn(row1Cell0, 'focus')
			row0Cell0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(row1Cell0.focus).toHaveBeenCalled()

			spyOn(row0Cell0, 'focus')
			row1Cell0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(row0Cell0.focus).toHaveBeenCalledTimes(1)

			row0Cell0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
			expect(row1Cell0.focus).toHaveBeenCalledTimes(2)
		})

		it('should not move focus while editing, as arrows then belong to the edit field', async () => {
			fixture.component.editability = DataGridEditability.Always
			await settle()

			const cell0 = getCell(0, 0)
			const cell1 = getCell(0, 1)
			expect(cell0.isEditing).toBeTrue()
			spyOn(cell1, 'focus')

			cell0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))

			expect(cell1.focus).not.toHaveBeenCalled()
		})

		it('should activate the cell\'s click on Enter when it is not editable, as only editable cells enter edit mode', () => {
			const cell = getCell(0, 0)
			expect(cell.isEditing).toBeFalse()
			spyOn(cell, 'click')

			cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

			expect(cell.click).toHaveBeenCalledTimes(1)
		})

		it('should copy the cell\'s text on Ctrl+C and notify', async () => {
			const writeText = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve())
			spyOn(NotificationComponent, 'notifySuccess')

			const cell = getCell(0, 0)
			cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true }))
			await new Promise(r => setTimeout(r, 20))

			expect(writeText).toHaveBeenCalledOnceWith('Alice')
			expect(NotificationComponent.notifySuccess).toHaveBeenCalled()
		})

		it('should not copy while editing, as Ctrl+C then belongs to the edit field', async () => {
			fixture.component.editability = DataGridEditability.Always
			await settle()
			const writeText = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve())

			const cell = getCell(0, 0)
			expect(cell.isEditing).toBeTrue()
			cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true }))
			await new Promise(r => setTimeout(r, 20))

			expect(writeText).not.toHaveBeenCalled()
		})

		it('should select the focused row while selectOnClick is set', async () => {
			fixture.component.selectability = DataGridSelectability.Single
			fixture.component.selectOnClick = true
			await settle()

			getCell(0, 0).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			await fixture.updateComplete

			expect(fixture.component.selectedData).toEqual([testData[1]!])
		})
	})

	describe('Rendering', () => {
		it('should render the column\'s content template with value and data', async () => {
			const columnElement = fixture.component.querySelector('mo-data-grid-column-text')!
			;(columnElement as any).getContentTemplate = (value: string | undefined, data: Person) => html`${value} (${data.age})`
			columnElement.requestUpdate()
			await settle()

			expect(getCell(0, 0).renderRoot.textContent?.trim()).toBe('Alice (30)')
			expect(getCell(1, 0).renderRoot.textContent?.trim()).toBe('Bob (25)')
		})

		it('should set its title to its text content, so truncated values surface as native tooltips', async () => {
			await settle()

			expect(getCell(0, 0).title).toBe('Alice')
			expect(getCell(0, 1).title).toBe((30).format())
		})

		it('should carry the column\'s alignment as an attribute', async () => {
			await settle()

			expect(getCell(0, 0).getAttribute('alignment')).toBe('start')
			expect(getCell(0, 1).getAttribute('alignment')).toBe('end')
		})

		describe('without a content template', () => {
			const plainFixture = new ComponentTestFixture<DataGrid<Person>>(html`
				<mo-data-grid .data=${testData}></mo-data-grid>
			`)

			it('should fall back to rendering the raw value without a content template', async () => {
				plainFixture.component.columns = [new DataGridColumn<Person>({ heading: 'Name', dataSelector: 'name' })]
				await plainFixture.updateComplete
				await new Promise(r => setTimeout(r, 30))

				const cell = plainFixture.component.rows[0]!.cells[0]!
				expect(cell.column.getContentTemplate).toBeUndefined()
				expect(cell.renderRoot.textContent?.trim()).toBe('Alice')
			})
		})
	})

	describe('Stickiness', () => {
		it('should reflect the column\'s stickiness, edge and inset as attributes, mirroring the header cells', async () => {
			const cell = getCell(0, 0)
			expect(cell.hasAttribute('data-sticky')).toBeFalse()
			expect(cell.hasAttribute('data-sticky-edge')).toBeFalse()

			fixture.component.querySelector('mo-data-grid-column-text')!.sticky = 'start'
			await settle()

			const stickyCell = getCell(0, 0)
			expect(stickyCell.column.sticky).toBe('start')
			expect(stickyCell.hasAttribute('data-sticky')).toBeTrue()
			expect(stickyCell.getAttribute('data-sticky-edge')).toBe('end')
			expect(stickyCell.style.insetInline).toBe('0px auto')
			expect(getCell(0, 1).hasAttribute('data-sticky')).toBeFalse()
		})
	})
})