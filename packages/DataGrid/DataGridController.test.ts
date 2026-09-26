import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { userEvent } from 'vitest/browser'
import { DataGrid, DataGridColumn, DataGridController, DataGridEditability, DataGridSelectability, DataGridSortingStrategy } from './index.js'

type Person = { id: number, name: string, age: number, reports?: Array<Person> }

/** A tree grid on a plain table, which is all a host needs to render for the controller to run on it. */
@component('data-grid-controller-test-table')
class TestTable extends Component {
	data: Array<Person> = [
		{ id: 1, name: 'Octavia', age: 41, reports: [{ id: 11, name: 'Clarke', age: 32 }] },
		{ id: 2, name: 'Elliot', age: 35 },
		{ id: 3, name: 'Arya', age: 22 },
	]

	readonly grid = new DataGridController<Person, TestTable>(this, host => ({
		get data() { return host.data },
		columns: [
			new DataGridColumn<Person>({ heading: 'Name', dataSelector: 'name' }),
			new DataGridColumn<Person>({ heading: 'Age', dataSelector: 'age', editable: true, getEditContentTemplate: value => html`<input autofocus .value=${String(value)}>` }),
		],
		subDataGridDataSelector: 'reports',
		selectability: DataGridSelectability.Multiple,
		multipleDetails: true,
		editability: DataGridEditability.Cell,
	}))

	get table() { return this.renderRoot.querySelector('table')! }
	get header() { return this.renderRoot.querySelector('thead tr')! }
	get columnHeaders() { return [...this.renderRoot.querySelectorAll('th')] }
	get rows() { return [...this.renderRoot.querySelectorAll<HTMLElement>('tbody tr')] }
	get cells() { return this.rows.flatMap(row => [...row.querySelectorAll('td')]) }
	cell(row: number, column: number) { return this.rows[row]!.querySelectorAll('td')[column]! }

	protected override get template() {
		const { records, details, columns } = this.grid
		const visible = records.records.filter(record => record.node?.ancestors.every(ancestor => details.isOpen(records.recordOf(ancestor))) ?? true)
		return html`
			<table ${this.grid.root.ref()}>
				<thead>
					<tr ${this.grid.header.ref()}>
						${columns.columns.visible.map(column => html`
							<th ${this.grid.columnHeader(column)} style='position: relative; width: ${column.width}'>
								${column.heading}<span class='resizer' style='position: absolute; inset-block: 0; inset-inline-end: 0; width: 6px' ${this.grid.columns.resizer(column)}></span>
							</th>
						`)}
					</tr>
				</thead>
				<tbody>
					${visible.map(record => html`
						<tr ${this.grid.row(record)}>
							${columns.columns.visible.map(column => html`
								<td ${this.grid.cell(column)}>
									${this.grid.editability.isEditingAt(record, column)
										? column.getEditContentTemplate?.(KeyPath.get(record.data, column.dataSelector), record.data)
										: KeyPath.get(record.data, column.dataSelector)}
								</td>
							`)}
						</tr>
					`)}
				</tbody>
			</table>
		`
	}
}

describe('DataGridController', () => {
	const fixture = new ComponentTestFixture(() => new TestTable())

	const names = () => fixture.component.rows.map(row => row.querySelector('td')!.textContent!.trim())
	const focused = () => fixture.component.shadowRoot!.activeElement

	it('should run on a host that is no data grid', () => {
		expect(fixture.component).not.toBeInstanceOf(DataGrid)
		expect(names()).toEqual(['Octavia', 'Elliot', 'Arya'])
	})

	it('should make the table a tree grid of rows and grid cells, and its host nothing', () => {
		const { table, rows, cells } = fixture.component

		expect(table.role).toBe('treegrid')
		expect(fixture.component.role).toBeNull()
		expect(rows.map(row => row.role)).toEqual(['row', 'row', 'row'])
		expect(rows.map(row => row.getAttribute('aria-level'))).toEqual(['1', '1', '1'])
		expect(cells.every(cell => cell.role === 'gridcell')).toBe(true)
	})

	it('should keep exactly one cell in the tab order', () => {
		expect(fixture.component.cells.filter(cell => cell.tabIndex === 0)).toEqual([fixture.component.cell(0, 0)])
	})

	it('should move between the cells with the arrow keys, and take the tab stop along', async () => {
		fixture.component.cell(0, 0).focus()

		await userEvent.keyboard('{ArrowDown}')
		expect(focused()).toBe(fixture.component.cell(1, 0))

		await userEvent.keyboard('{ArrowRight}')
		expect(focused()).toBe(fixture.component.cell(1, 1))
		expect(fixture.component.cells.filter(cell => cell.tabIndex === 0)).toEqual([fixture.component.cell(1, 1)])
	})

	it('should announce the selection on the rows and the table', async () => {
		fixture.component.grid.selection.select(fixture.component.data[1]!)
		await fixture.updateComplete

		expect(fixture.component.table.getAttribute('aria-multiselectable')).toBe('true')
		expect(fixture.component.rows.map(row => row.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])
	})

	it('should open a record into its sub records and announce it', async () => {
		const [octavia] = fixture.component.grid.records.records
		expect(fixture.component.rows[0]!.getAttribute('aria-expanded')).toBe('false')

		await fixture.component.grid.details.toggle(octavia!)
		await fixture.updateComplete

		expect(names()).toEqual(['Octavia', 'Clarke', 'Elliot', 'Arya'])
		expect(fixture.component.rows[0]!.getAttribute('aria-expanded')).toBe('true')
		expect(fixture.component.rows[1]!.getAttribute('aria-level')).toBe('2')
	})

	it('should tell a table which cell to render its editor in, and end the edit on Escape', async () => {
		const age = fixture.component.cell(1, 1)
		age.focus()

		await userEvent.keyboard('{Enter}')
		await fixture.updateComplete
		expect(focused()).toBe(age.querySelector('input'))
		expect(age.hasAttribute('tabindex')).toBe(false)

		await userEvent.keyboard('{Escape}')
		await fixture.updateComplete
		expect(age.querySelector('input')).toBeNull()
		expect(focused()).toBe(age)
		expect(age.tabIndex).toBe(0)
	})

	it('should make the header a row of column headers, and announce the sorting on the column sorted first', async () => {
		const { header, columnHeaders } = fixture.component
		const [name, age] = fixture.component.grid.columns.columns.visible

		expect(header.role).toBe('row')
		expect(columnHeaders.map(th => th.role)).toEqual(['columnheader', 'columnheader'])
		expect(columnHeaders.map(th => th.getAttribute('aria-sort'))).toEqual(['none', 'none'])

		age!.toggleSort(DataGridSortingStrategy.Descending)
		await fixture.updateComplete
		name!.toggleSort(DataGridSortingStrategy.Ascending, new MouseEvent('click', { shiftKey: true }))
		await fixture.updateComplete

		expect(columnHeaders.map(th => th.getAttribute('aria-sort'))).toEqual(['none', 'descending'])
	})

	it('should end the edit on Enter within its editor, which commits the value first', async () => {
		const age = fixture.component.cell(1, 1)
		age.focus()
		await userEvent.keyboard('{Enter}')
		await fixture.updateComplete
		const input = age.querySelector('input')!
		const committed = vi.fn()
		input.addEventListener('change', committed)

		await userEvent.keyboard('{Control>}a{/Control}36{Enter}')
		await fixture.updateComplete

		expect(committed).toHaveBeenCalledOnce()
		expect(age.querySelector('input')).toBeNull()
		expect(focused()).toBe(age)
	})

	const press = (type: string, target: EventTarget, x: number, y: number) => target.dispatchEvent(new PointerEvent(type, {
		clientX: x, clientY: y, isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1, pointerId: 1, pointerType: 'mouse', bubbles: true, composed: true,
	}))

	it('should move a column whose header is dragged past another', async () => {
		const [name, age] = fixture.component.columnHeaders
		const from = name!.getBoundingClientRect()
		const to = age!.getBoundingClientRect()
		const y = from.top + from.height / 2

		// Pressed on the header itself rather than its heading, and dropped past the middle of the one before it.
		press('pointerdown', age!, to.right - 10, y)
		for (let step = 1; step <= 5; step++) {
			press('pointermove', window, to.right - 10 + (from.left + 5 - to.right + 10) * step / 5, y)
			await new Promise(requestAnimationFrame)
		}
		press('pointerup', window, from.left + 5, y)
		await fixture.updateComplete

		expect(fixture.component.columnHeaders.map(th => th.textContent!.trim())).toEqual(['Age', 'Name'])
	})

	it('should resize a column by the handle in its header, and fit it to its content on a double click', async () => {
		const handle = fixture.component.renderRoot.querySelector<HTMLElement>('.resizer')!
		const { left, top } = handle.getBoundingClientRect()
		const width = fixture.component.columnHeaders[0]!.getBoundingClientRect().width

		press('pointerdown', handle, left + 2, top + 2)
		press('pointermove', window, left + 52, top + 2)
		expect(handle.hasAttribute('data-resizing')).toBe(true)
		press('pointerup', window, left + 52, top + 2)
		await fixture.updateComplete

		expect(fixture.component.grid.columns.columns.visible[0]!.width).toBe(`${width + 50}px`)
		expect(handle.hasAttribute('data-resizing')).toBe(false)

		await userEvent.dblClick(handle)
		await fixture.updateComplete
		expect(fixture.component.grid.columns.columns.visible[0]!.width).toBe('max-content')
	})

	it('should keep the sorting itself when the host does not, and sort the records by it', async () => {
		const [name] = fixture.component.grid.columns.columns.visible

		name!.toggleSort(DataGridSortingStrategy.Ascending)
		await fixture.updateComplete

		expect(names()).toEqual(['Arya', 'Elliot', 'Octavia'])
	})
})