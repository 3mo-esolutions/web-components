import { ComponentTestFixture } from '@a11d/lit-testing'
import { DataGrid, type DataGridRow, DataGridSelectionMode, DataGridColumn } from './index.js'
import { html } from '@a11d/lit'

type Person = { id: number, name: string, birthDate: DateTime }

const people: Array<Person> = [
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0) },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0) },
]

class TestDataGrid extends DataGrid<Person> {
	override data = people

	get headerSelectionCheckbox() { return this['header']?.renderRoot.querySelector('mo-checkbox') ?? undefined }
	get rowsSelectionCheckboxes() { return this.rows.map(row => row.renderRoot.querySelector('mo-checkbox') ?? undefined).filter(Boolean) }

	isRowSelected(row: DataGridRow<Person>, skipCheckboxCheck = false) {
		const checkboxSelected = row.renderRoot.querySelector('mo-checkbox')?.selected ?? false
		return row.selected && (skipCheckboxCheck || checkboxSelected)
	}
}

const getRowContextMenuTemplate = () => html`
	<mo-menu-item>Item1</mo-menu-item>
	<mo-menu-item>Item2</mo-menu-item>
`

customElements.define('test-data-grid', TestDataGrid)

describe('DataGrid', () => {
	describe('Columns', () => {
		const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)

		it('should auto-generate columns', () => {
			const [firstColumn, secondColumn, thirdColumn] = fixture.component.columns
			// TODO: dataSelector's type (KeyPath) leads to compiler exhaustion

			// expect(firstColumn?.dataSelector as any).toEqual('id')
			expect(firstColumn).toBeInstanceOf(DataGridColumn)
			expect(firstColumn?.heading).toEqual('Id')
			expect(firstColumn?.width).toEqual('max-content')
			expect(firstColumn?.hidden).toEqual(false)

			// expect(secondColumn?.dataSelector as any).toEqual('name')
			expect(secondColumn).toBeInstanceOf(DataGridColumn)
			expect(secondColumn?.heading).toEqual('Name')
			expect(secondColumn?.width).toEqual('max-content')
			expect(secondColumn?.hidden).toEqual(false)

			// expect(thirdColumn?.dataSelector as any).toEqual('birthDate')
			expect(thirdColumn).toBeInstanceOf(DataGridColumn)
			expect(thirdColumn?.heading).toEqual('Birth Date')
			expect(thirdColumn?.width).toEqual('max-content')
			expect(thirdColumn?.hidden).toEqual(false)
		})

		it('should convert object literals to an instance of DataGridColumnDefinition', async () => {
			fixture.component.columns = [
				{ heading: 'Id', dataSelector: 'id' },
				{ heading: 'Name', dataSelector: 'name' },
			]

			await fixture.updateComplete

			const [firstColumn, secondColumn] = fixture.component.columns
			expect(firstColumn).toEqual(new DataGridColumn({ heading: 'Id', dataSelector: 'id' }))
			expect(secondColumn).toEqual(new DataGridColumn({ heading: 'Name', dataSelector: 'name' }))
		})
	})

	describe('Selection', () => {
		const shouldAutoSelectTheRightClickedRow = async (fixture: ComponentTestFixture<TestDataGrid>) => {
			const row = fixture.component.rows[0] as DataGridRow<Person>
			await row.openContextMenu()
			expect(fixture.component.isRowSelected(row)).toBe(true)
		}

		const shouldNotRenderCheckboxesWhenSelectionCheckboxesHidden = async (fixture: ComponentTestFixture<TestDataGrid>) => {
			fixture.component.selectionCheckboxesHidden = true
			await fixture.updateComplete
			expect(fixture.component.headerSelectionCheckbox).not.toBeDefined()
			expect(fixture.component.rowsSelectionCheckboxes.length).toBe(0)
		}

		const expectClickingTheRowLeadsToSelection = async (fixture: ComponentTestFixture<TestDataGrid>, selection = true, skipCheckboxCheck = false) => {
			const row = fixture.component.rows[0] as DataGridRow<Person>
			row.renderRoot.querySelector('#contentContainer')?.dispatchEvent(new MouseEvent('click'))
			await fixture.updateComplete
			expect(fixture.component.isRowSelected(row, skipCheckboxCheck)).toBe(selection)
		}

		const shouldSelectTheRowWhenSelectOnClick = async (fixture: ComponentTestFixture<TestDataGrid>) => {
			fixture.component.selectOnClick = true
			await fixture.updateComplete
			await expectClickingTheRowLeadsToSelection(fixture)
		}

		const shouldSelectTheRowWhenSelectionCheckboxesHidden = async (fixture: ComponentTestFixture<TestDataGrid>) => {
			fixture.component.selectionCheckboxesHidden = true
			await fixture.updateComplete
			await expectClickingTheRowLeadsToSelection(fixture, true, true)
		}

		const shouldNotSelectTheRowWhenIsDataSelectableReturnsFalse = async (fixture: ComponentTestFixture<TestDataGrid>) => {
			fixture.component.selectOnClick = true
			fixture.component.isDataSelectable = () => false
			await fixture.updateComplete
			await expectClickingTheRowLeadsToSelection(fixture, false)
		}

		const shouldDispatchSelectionChange = async (
			fixture: ComponentTestFixture<TestDataGrid>,
			peopleToClick: Array<Person>,
			shouldDispatch: boolean,
		) => {
			fixture.component.selectOnClick = true
			spyOn(fixture.component.selectionChange, 'dispatch')

			for (const person of peopleToClick) {
				const row = fixture.component.rows.find(row => row.data === person) as DataGridRow<Person>
				row.renderRoot.querySelector('#contentContainer')?.dispatchEvent(new MouseEvent('click'))
				await fixture.updateComplete
			}

			if (!shouldDispatch) {
				expect(fixture.component.selectionChange.dispatch).toHaveBeenCalledTimes(0)
			} else {
				expect(fixture.component.selectionChange.dispatch).toHaveBeenCalledTimes(peopleToClick.length)
				expect(fixture.component.selectionChange.dispatch).toHaveBeenCalledWith(peopleToClick)
			}
		}

		describe('None', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid .getRowContextMenuTemplate=${getRowContextMenuTemplate}></test-data-grid>
			`)

			it('should be the default', () => expect(fixture.component.selectionMode).toEqual(DataGridSelectionMode.None))

			it('should not render checkboxes', () => {
				expect(fixture.component.headerSelectionCheckbox).not.toBeDefined()
				expect(fixture.component.rowsSelectionCheckboxes.length).toBe(0)
			})

			it('should not dispatch the "selectionChange" event when a row is clicked', () => shouldDispatchSelectionChange(fixture, [people[0]], false))
		})

		describe('Single', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid selectionMode=${DataGridSelectionMode.Single} .getRowContextMenuTemplate=${getRowContextMenuTemplate}></test-data-grid>
			`)

			it('should render checkboxes only for rows', () => {
				expect(fixture.component.headerSelectionCheckbox).not.toBeDefined()
				expect(fixture.component.rowsSelectionCheckboxes.length).toBe(people.length)
			})

			it('should auto-select the right-clicked row', () => shouldAutoSelectTheRightClickedRow(fixture))
			it('should not render checkboxes when selectionCheckboxesHidden is true', () => shouldNotRenderCheckboxesWhenSelectionCheckboxesHidden(fixture))

			it('should not select the row when clicked', () => expectClickingTheRowLeadsToSelection(fixture, false))
			it('should not select the row when isDataSelectable returns false', () => shouldNotSelectTheRowWhenIsDataSelectableReturnsFalse(fixture))
			it('should select the row when clicked and selectOnClick is true', () => shouldSelectTheRowWhenSelectOnClick(fixture))
			it('should select the row when clicked and selectionCheckboxesHidden is true', () => shouldSelectTheRowWhenSelectionCheckboxesHidden(fixture))
			it('should dispatch the "selectionChange" event when a row is clicked', () => shouldDispatchSelectionChange(fixture, [people[0]], true))
		})

		describe('Multiple', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid selectionMode=${DataGridSelectionMode.Multiple} .getRowContextMenuTemplate=${getRowContextMenuTemplate}></test-data-grid>
			`)

			it('should render checkboxes for header and rows', () => {
				expect(fixture.component.headerSelectionCheckbox).toBeDefined()
				expect(fixture.component.rowsSelectionCheckboxes.length).toBe(people.length)
			})

			it('should auto-select the right-clicked row', () => shouldAutoSelectTheRightClickedRow(fixture))
			it('should not render checkboxes when selectionCheckboxesHidden is true', () => shouldNotRenderCheckboxesWhenSelectionCheckboxesHidden(fixture))

			it('should not select the row when clicked', () => expectClickingTheRowLeadsToSelection(fixture, false))
			it('should not select the row when isDataSelectable returns false', () => shouldNotSelectTheRowWhenIsDataSelectableReturnsFalse(fixture))
			it('should select the row when clicked and selectOnClick is true', () => shouldSelectTheRowWhenSelectOnClick(fixture))
			it('should select the row when clicked and selectionCheckboxesHidden is true', () => shouldSelectTheRowWhenSelectionCheckboxesHidden(fixture))
			it('should dispatch the "selectionChange" event when a row is clicked', () => shouldDispatchSelectionChange(fixture, people, true))
		})
	})

	describe('DetailElements', () => {
		const fixture = new ComponentTestFixture<TestDataGrid>(html`
			<test-data-grid .getRowDetailsTemplate=${() => html`
				<div>Details</div>
			`}></test-data-grid>
		`)

		it('should open the detail element on row-click only when detailsOnClick is true and there is defined row-details-template', () => {
			const expectClickingLeadsTo = (open: boolean) => {
				const row = fixture.component.rows[0] as DataGridRow<Person>
				row.renderRoot.querySelector('#contentContainer')?.dispatchEvent(new MouseEvent('click'))
				expect(row.detailsOpen).toBe(open)
			}
			expectClickingLeadsTo(false)

			fixture.component.getRowDetailsTemplate = () => html`Something`
			expectClickingLeadsTo(false)

			fixture.component.getRowDetailsTemplate = undefined
			fixture.component.detailsOnClick = true
			expectClickingLeadsTo(false)

			fixture.component.getRowDetailsTemplate = () => html`Something`
			expectClickingLeadsTo(true)
		})

		it('should dispatch the "detailsOpenChange" event when a detail element of given row is opened or closed', async () => {
			const row = fixture.component.rows[0] as DataGridRow<Person>
			spyOn(row.detailsOpenChange, 'dispatch')
			spyOn(fixture.component.rowDetailsOpen, 'dispatch')
			spyOn(fixture.component.rowDetailsClose, 'dispatch')

			row.renderRoot.querySelector('#detailsExpanderIconButton')?.dispatchEvent(new MouseEvent('click'))
			await fixture.updateComplete
			expect(row.detailsOpenChange.dispatch).toHaveBeenCalledTimes(1)
			expect(row.detailsOpenChange.dispatch).toHaveBeenCalledWith(true)
			expect(fixture.component.rowDetailsOpen.dispatch).toHaveBeenCalledTimes(1)
			expect(fixture.component.rowDetailsOpen.dispatch).toHaveBeenCalledWith(row)

			row.renderRoot.querySelector('#detailsExpanderIconButton')?.dispatchEvent(new MouseEvent('click'))
			await fixture.updateComplete
			expect(row.detailsOpenChange.dispatch).toHaveBeenCalledTimes(2)
			expect(row.detailsOpenChange.dispatch).toHaveBeenCalledWith(false)
			expect(fixture.component.rowDetailsClose.dispatch).toHaveBeenCalledTimes(1)
			expect(fixture.component.rowDetailsClose.dispatch).toHaveBeenCalledWith(row)
		})
	})

	describe('Editability', () => {
		describe('Never', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)

			it('should not be editable', () => {
				const cell = fixture.component.rows[0]?.cells[0]
				cell?.dispatchEvent(new MouseEvent('dblclick'))
				expect(cell?.isEditing).toBe(false)
			})
		})

		describe('Cell', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid editability='cell'></test-data-grid>`)

			it('should switch to edit mode on double-click', () => {
				const cell = fixture.component.rows[0]?.cells[0]
				cell?.dispatchEvent(new MouseEvent('dblclick'))
				expect(cell?.isEditing).toBe(true)
			})

			it('should switch to edit mode on enter', () => {
				const cell = fixture.component.rows[0]?.cells[0]
				cell?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
				expect(cell?.isEditing).toBe(true)
			})

			it('should switch to edit mode on enter', () => {
				const cell = fixture.component.rows[0]?.cells[0]
				cell?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
				expect(cell?.isEditing).toBe(true)
			})

			it('should switch out of edit mode on Escape', () => {
				const cell = fixture.component.rows[0]?.cells[0]
				cell?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
				cell?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
				expect(cell?.isEditing).toBe(false)
			})

			it('should switch out of edit mode on a pointerdown event anywhere where the composedPath does not include the cell', () => {
				const cell = fixture.component.rows[0]?.cells[0]
				const anotherCell = fixture.component.rows[0]?.cells[1]
				cell?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
				anotherCell?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, composed: true }))
				expect(cell?.isEditing).toBe(false)
			})
		})

		describe('Always', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid editability='always'></test-data-grid>`)

			it('should be always editable', () => {
				const cell = fixture.component.rows[0]?.cells[0]
				expect(cell?.isEditing).toBe(true)
			})
		})
	})
})