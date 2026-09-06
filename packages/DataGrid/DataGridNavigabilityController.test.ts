import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type DataGrid } from './index.js'

type Person = { id: number, name: string, age: number }

const people: Array<Person> = [
	{ id: 1, name: 'Alice', age: 30 },
	{ id: 2, name: 'Bob', age: 25 },
	{ id: 3, name: 'Charlie', age: 41 },
]

describe('DataGridNavigabilityController', () => {
	const fixture = new ComponentTestFixture<DataGrid<Person>>(html`
		<mo-data-grid .data=${people}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
		</mo-data-grid>
	`)

	const controller = () => fixture.component.navigabilityController
	const cell = (rowIndex: number, cellIndex: number) => fixture.component.rows[rowIndex]!.cells[cellIndex]!
	const press = (origin: { dispatchEvent(event: Event): boolean }, key: string, init?: KeyboardEventInit) => {
		const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init })
		origin.dispatchEvent(event)
		return event
	}

	const settle = async () => {
		await fixture.updateComplete
		for (const row of fixture.component.rows) {
			row.requestUpdate()
			await row.updateComplete
		}
	}

	it('should move to the first and last cell of the row with Home and End', () => {
		const first = cell(0, 0)
		const last = cell(0, 1)
		spyOn(last, 'focus')
		spyOn(first, 'focus')

		press(first, 'End')
		expect(last.focus).toHaveBeenCalledTimes(1)

		press(last, 'Home')
		expect(first.focus).toHaveBeenCalledTimes(1)
	})

	it('should move to the first and last cell of the grid with Ctrl+Home and Ctrl+End', () => {
		const first = cell(0, 0)
		const last = cell(2, 1)
		spyOn(last, 'focus')
		spyOn(first, 'focus')

		press(first, 'End', { ctrlKey: true })
		expect(last.focus).toHaveBeenCalledTimes(1)

		press(last, 'Home', { ctrlKey: true })
		expect(first.focus).toHaveBeenCalledTimes(1)
	})

	it('should leave the grid on Tab instead of moving within it, the grid being a single tab stop', () => {
		const first = cell(0, 0)
		spyOn(cell(0, 1), 'focus')
		spyOn(cell(1, 0), 'focus')

		expect(press(first, 'Tab').defaultPrevented).toBe(false)
		expect(press(first, 'Tab', { shiftKey: true }).defaultPrevented).toBe(false)

		expect(cell(0, 1).focus).not.toHaveBeenCalled()
		expect(cell(1, 0).focus).not.toHaveBeenCalled()
	})

	it('should put the cursor on a cell that takes focus by other means, so a click decides where Tab returns', async () => {
		await settle()

		cell(1, 1).dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))
		await settle()

		expect(controller().currentCell).toBe(cell(1, 1))
		expect(cell(1, 1).getAttribute('tabindex')).toBe('0')
		expect(cell(0, 0).getAttribute('tabindex')).toBe('-1')
	})

	it('should keep exactly one cell in the tab order, and move it along with the cursor', async () => {
		await settle()
		const tabbable = () => fixture.component.rows
			.flatMap(row => row.cells)
			.filter(cell => cell.getAttribute('tabindex') === '0')

		expect(tabbable()).toEqual([cell(0, 0)])

		press(cell(0, 0), 'ArrowDown')
		press(cell(1, 0), 'ArrowRight')
		await settle()

		expect(tabbable()).toEqual([cell(1, 1)])
	})

	it('should leave a modified arrow to the application', () => {
		const origin = cell(0, 0)
		spyOn(cell(1, 0), 'focus')

		const event = press(origin, 'ArrowDown', { ctrlKey: true })

		expect(event.defaultPrevented).toBe(false)
		expect(cell(1, 0).focus).not.toHaveBeenCalled()
	})

	it('should report the row and column the cursor is on', () => {
		press(cell(0, 0), 'ArrowDown')

		expect(controller().row.current?.data).toBe(people[1]!)
		expect(controller().column.current?.dataSelector).toBe('name')
		expect(controller().currentCell).toBe(cell(1, 0))
	})

	it('should keep its position when the data is replaced, as the cell address is what the user is looking at', async () => {
		press(cell(0, 0), 'ArrowDown')
		expect(controller().row.index).toBe(1)

		fixture.component.setData([{ id: 9, name: 'Dana', age: 22 }, ...people])
		await settle()

		expect(controller().row.index).toBe(1)
		expect(controller().row.current).toBe(fixture.component.rows[1]!)
	})

	it('should move relative to the cell the key came from, even where the grid holds one datum many times', async () => {
		const person = people[0]!
		fixture.component.setData([person, person, person])
		await settle()
		spyOn(cell(1, 0), 'focus')

		press(cell(2, 0), 'ArrowUp')

		expect(controller().row.index).toBe(1)
		expect(cell(1, 0).focus).toHaveBeenCalledTimes(1)
	})

	it('should render a row that has scrolled out of view before moving focus into it', async () => {
		await settle()
		const row = fixture.component.rows[1]!
		row.isIntersecting = false
		await row.updateComplete
		expect(row.cells.length).toBe(0)

		press(cell(0, 0), 'ArrowDown')
		await row.updateComplete

		expect(row.cells.length).toBe(2)
		expect(row.shadowRoot!.activeElement).toBe(row.cells[0]!)
	})
})