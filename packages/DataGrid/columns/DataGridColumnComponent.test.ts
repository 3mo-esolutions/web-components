import { html, render } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type DataGrid, DataGridColumnBoolean, DataGridColumnComponent } from '../index.js'

type Person = { id: number, name: string }

describe('DataGridColumnComponent', () => {
	const container = document.createElement('div')

	afterEach(() => render(html.nothing, container))

	describe('Slotting', () => {
		const fixture = new ComponentTestFixture<DataGrid<Person>>(html`
			<mo-data-grid>
				<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			</mo-data-grid>
		`)

		it('should assign itself to the "column" slot when directly parented by a data grid, so consumers need not slot it manually', async () => {
			await fixture.updateComplete
			const columnComponent = fixture.component.querySelector('mo-data-grid-column-text')!

			expect(columnComponent.slot).toBe('column')
			expect(columnComponent.assignedSlot?.name).toBe('column')
		})
	})

	describe('column derivation', () => {
		it('should derive the column value-object from its properties, inverting nonSortable into sortable', () => {
			const columnComponent = new DataGridColumnComponent<Person, string>()
			columnComponent.heading = 'Name'
			columnComponent.description = 'Full name'
			columnComponent.dataSelector = 'name'
			columnComponent.width = '120px'
			columnComponent.textAlign = 'end'
			columnComponent.sticky = 'start'
			columnComponent.hidden = true
			columnComponent.nonSortable = true

			const column = columnComponent.column

			expect(column.heading).toBe('Name')
			expect(column.description).toBe('Full name')
			expect(column.dataSelector).toBe('name')
			expect(column.width).toBe('120px')
			expect(column.alignment).toBe('end')
			expect(column.sticky).toBe('start')
			expect(column.hidden).toBeTrue()
			expect(column.sortable).toBeFalse()
		})

		it('should derive editable only where an edit template exists, inverting a nonEditable predicate per datum', () => {
			const withoutEditTemplate = new DataGridColumnComponent<Person, string>()

			expect(withoutEditTemplate.column.editable).toBeFalse()

			const withEditTemplate = new DataGridColumnComponent<Person, string>()
			withEditTemplate.getEditContentTemplate = () => html`<input>`
			withEditTemplate.nonEditable = (data: Person) => data.id === 1

			const editable = withEditTemplate.column.editable as Predicate<Person>

			expect(typeof editable).toBe('function')
			expect(editable({ id: 1, name: 'Alice' })).toBeFalse()
			expect(editable({ id: 2, name: 'Bob' })).toBeTrue()
		})

		it('should bind the template getters to the element, so later property changes reach rendered cells', () => {
			const columnComponent = new DataGridColumnBoolean<Person>()

			const getContentTemplate = columnComponent.column.getContentTemplate!
			columnComponent.trueIcon = 'star'

			render(getContentTemplate(true, { id: 1, name: 'Alice' }), container)

			expect(container.querySelector('mo-icon')!.getAttribute('icon')).toBe('star')
		})
	})

	describe('CSV', () => {
		it('should join heading and description into the CSV heading', () => {
			const columnComponent = new DataGridColumnComponent<Person, string>()
			columnComponent.heading = 'Name'

			expect([...columnComponent.generateCsvHeading()]).toEqual(['Name'])

			columnComponent.description = 'Full name'

			expect([...columnComponent.generateCsvHeading()]).toEqual(['Name - Full name'])
		})
	})
})