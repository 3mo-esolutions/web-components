import { component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { DataGrid, type DataGridRow, DataGridColumn, DataRecord, DataGridSelectability } from './index.js'

type Person = { id: number, name: string, birthDate: DateTime, children?: Array<Person> }

const testData: Array<Person> = [
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0) },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0) },
]

class TestDataGrid extends DataGrid<Person> {
	override data: Array<Person> = [...testData]

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
	describe('Data', () => {
		const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)

		it('should extract records out of data', () => {
			const [first, second, third] = fixture.component.data

			expect(fixture.component.dataRecords).toEqual([
				new DataRecord(fixture.component, { index: 0, level: 0, data: first }),
				new DataRecord(fixture.component, { index: 1, level: 0, data: second }),
				new DataRecord(fixture.component, { index: 2, level: 0, data: third }),
			])
		})

		it('should update records when data changes', async () => {
			fixture.component.data = [
				{ id: 4, name: 'John', birthDate: new DateTime(2000, 0, 0) },
				{ id: 5, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
			]
			await fixture.updateComplete

			const [first, second] = fixture.component.data

			expect(fixture.component.dataRecords).toEqual([
				new DataRecord(fixture.component, { index: 0, level: 0, data: first }),
				new DataRecord(fixture.component, { index: 1, level: 0, data: second }),
			])
		})

		it('should extract records out of nested data', async () => {
			const [first, second, third] = fixture.component.data
			fixture.component.subDataGridDataSelector = 'children'
			fixture.component.data = [{ ...first, children: [third] }, second]
			const firstWithChildren = fixture.component.data[0]

			await fixture.updateComplete

			expect(fixture.component.dataRecords).toEqual([
				new DataRecord(fixture.component, {
					index: 0,
					level: 0,
					data: firstWithChildren,
					subDataRecords: [
						new DataRecord(fixture.component, { index: 1, level: 1, data: third }),
					]
				}),
				new DataRecord(fixture.component, { index: 1, level: 1, data: third }),
				new DataRecord(fixture.component, { index: 2, level: 0, data: second }),
			])
		})
	})

	describe('Columns', () => {
		const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)

		it('should auto-generate columns', () => {
			const [firstColumn, secondColumn, thirdColumn] = fixture.component.columns

			// expect(firstColumn?.dataSelector as any).toEqual('id')
			expect(firstColumn).toBeInstanceOf(DataGridColumn)
			expect(firstColumn?.dataGrid).toBe(fixture.component)
			expect(firstColumn?.heading).toEqual('Id')
			expect(firstColumn?.width).toEqual('max-content')
			expect(firstColumn?.hidden).toEqual(false)

			// expect(secondColumn?.dataSelector as any).toEqual('name')
			expect(secondColumn).toBeInstanceOf(DataGridColumn)
			expect(secondColumn?.dataGrid).toBe(fixture.component)
			expect(secondColumn?.heading).toEqual('Name')
			expect(secondColumn?.width).toEqual('max-content')
			expect(secondColumn?.hidden).toEqual(false)

			// expect(thirdColumn?.dataSelector as any).toEqual('birthDate')
			expect(thirdColumn).toBeInstanceOf(DataGridColumn)
			expect(thirdColumn?.dataGrid).toBe(fixture.component)
			expect(thirdColumn?.heading).toEqual('Birth Date')
			expect(thirdColumn?.width).toEqual('max-content')
			expect(thirdColumn?.hidden).toEqual(false)
		})

		it('should automatically set dataGrid property of columns', async () => {
			fixture.component.columns = [
				new DataGridColumn({ heading: 'Id', dataSelector: 'id' }),
				new DataGridColumn({ heading: 'Name', dataSelector: 'name' }),
			]

			await fixture.updateComplete

			const [firstColumn, secondColumn] = fixture.component.columns
			expect(firstColumn?.dataGrid).toBe(fixture.component)
			expect(secondColumn?.dataGrid).toBe(fixture.component)
		})
	})

	describe('Selection', () => {
		const shouldAutoSelectTheRightClickedRow = async (fixture: ComponentTestFixture<TestDataGrid>) => {
			const row = fixture.component.rows[0] as DataGridRow<Person>
			await row.openContextMenu()
			expect(fixture.component.isRowSelected(row)).toBe(true)
		}

		const expectCellFocusLeadsToRowSelectionWhenSelectOnClick = async (fixture: ComponentTestFixture<TestDataGrid>) => {
			const shouldPreservePreviousSelection = fixture.component.selectability === DataGridSelectability.Multiple

			fixture.component.selectOnClick = true
			await fixture.updateComplete

			fixture.component.rows.at(0)!.cells.at(0)!
				.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', shiftKey: false }))
			await fixture.updateComplete

			expect(fixture.component.isRowSelected(fixture.component.rows.at(1)!)).toBe(true)

			fixture.component.rows.at(1)!.cells.at(0)!
				.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', shiftKey: true }))
			await fixture.updateComplete

			expect(fixture.component.isRowSelected(fixture.component.rows.at(1)!)).toBe(shouldPreservePreviousSelection)
			expect(fixture.component.isRowSelected(fixture.component.rows.at(2)!)).toBe(true)
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
				row.renderRoot.querySelector('mo-checkbox')?.change.dispatch(true)
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
				<test-data-grid></test-data-grid>
			`)

			it('should be the default', () => expect(fixture.component.selectability).toEqual(undefined))

			it('should not render checkboxes', () => {
				expect(fixture.component.headerSelectionCheckbox).not.toBeDefined()
				expect(fixture.component.rowsSelectionCheckboxes.length).toBe(0)
			})

			it('should not dispatch the "selectionChange" event when a row is clicked', () => shouldDispatchSelectionChange(fixture, [fixture.component.data[0]], false))
		})

		describe('Single', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid selectability=${DataGridSelectability.Single} .getRowContextMenuTemplate=${getRowContextMenuTemplate}></test-data-grid>
			`)

			it('should render checkboxes only for rows', () => {
				expect(fixture.component.headerSelectionCheckbox).not.toBeDefined()
				expect(fixture.component.rowsSelectionCheckboxes.length).toBe(fixture.component.data.length)
			})

			it('should auto-select the right-clicked row', () => shouldAutoSelectTheRightClickedRow(fixture))

			it('should not select the row when clicked', () => expectClickingTheRowLeadsToSelection(fixture, false))
			it('should not select the row when isDataSelectable returns false', () => shouldNotSelectTheRowWhenIsDataSelectableReturnsFalse(fixture))
			it('should select the row when clicked and selectOnClick is true', () => shouldSelectTheRowWhenSelectOnClick(fixture))
			it('should select the row when focused with the keyboard', () => expectCellFocusLeadsToRowSelectionWhenSelectOnClick(fixture))
			it('should dispatch the "selectionChange" event when a row is clicked', () => shouldDispatchSelectionChange(fixture, [fixture.component.data[0]], true))
		})

		describe('Multiple', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid selectability=${DataGridSelectability.Multiple} .getRowContextMenuTemplate=${getRowContextMenuTemplate}></test-data-grid>
			`)

			it('should render checkboxes for header and rows', () => {
				expect(fixture.component.headerSelectionCheckbox).toBeDefined()
				expect(fixture.component.rowsSelectionCheckboxes.length).toBe(fixture.component.data.length)
			})

			it('should auto-select the right-clicked row', () => shouldAutoSelectTheRightClickedRow(fixture))

			it('should not select the row when clicked', () => expectClickingTheRowLeadsToSelection(fixture, false))
			it('should not select the row when isDataSelectable returns false', () => shouldNotSelectTheRowWhenIsDataSelectableReturnsFalse(fixture))
			it('should select the row when clicked and selectOnClick is true', () => shouldSelectTheRowWhenSelectOnClick(fixture))
			it('should select the row when focused with the keyboard', () => expectCellFocusLeadsToRowSelectionWhenSelectOnClick(fixture))
			it('should dispatch the "selectionChange" event when a row is clicked', () => shouldDispatchSelectionChange(fixture, fixture.component.data, true))
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
			spyOn(fixture.component.rowDetailsOpen, 'dispatch')
			spyOn(fixture.component.rowDetailsClose, 'dispatch')

			row.renderRoot.querySelector('#detailsExpanderIconButton')?.dispatchEvent(new MouseEvent('click'))
			await fixture.updateComplete
			expect(fixture.component.rowDetailsOpen.dispatch).toHaveBeenCalledTimes(1)
			expect(fixture.component.rowDetailsOpen.dispatch).toHaveBeenCalledWith(row)

			row.renderRoot.querySelector('#detailsExpanderIconButton')?.dispatchEvent(new MouseEvent('click'))
			await fixture.updateComplete
			expect(fixture.component.rowDetailsClose.dispatch).toHaveBeenCalledTimes(1)
			expect(fixture.component.rowDetailsClose.dispatch).toHaveBeenCalledWith(row)
		})
	})

	describe('with multi-level data', () => {
		const [first, second, third] = [...testData]
		const data = [{ ...first, children: [{ ...second, children: [{ ...third }] }] }]
		const fixture = new ComponentTestFixture<TestDataGrid>(html`
			<test-data-grid detailsOnClick subDataGridDataSelector='children' .data=${data}></test-data-grid>
		`)

		it('should not include sub-rows of different levels in the details', async () => {
			const firstRow = fixture.component.rows[0]
			firstRow.renderRoot.querySelector('#contentContainer')?.dispatchEvent(new MouseEvent('click'))

			await fixture.updateComplete

			const subRows = firstRow.renderRoot.querySelector('#detailsContainer')?.children.length ?? 0

			expect(firstRow.detailsOpen).toBe(true)
			expect(subRows).toBe(1)
		})
	})

	describe('Editability', () => {
		const expectCellToBeEditable = (fixture: ComponentTestFixture<TestDataGrid>, editable: boolean, alsoWithoutDoubleClick = false) => {
			const cell = fixture.component.rows[0]?.cells[0]
			if (alsoWithoutDoubleClick === false) {
				cell?.dispatchEvent(new MouseEvent('dblclick'))
			}
			expect(cell?.isEditing).toBe(editable)
		}

		const shouldApplyTheEditedValueWhenChanged = async (fixture: ComponentTestFixture<TestDataGrid>, alsoWithoutKeyDown = false) => {
			const row = fixture.component.rows[0]
			const cell = row?.cells[1] // name

			if (alsoWithoutKeyDown === false) {
				cell?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
				await fixture.updateComplete
			}
			cell?.renderRoot.querySelector('mo-field-text')?.change.dispatch('Not John!')

			expect(fixture.component.data[0].name).toBe('Not John!')
		}

		describe('Never', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)

			it('should not be editable', () => expectCellToBeEditable(fixture, false))
		})

		describe('Cell', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid editability='cell'></test-data-grid>`)

			it('should switch to edit mode on double-click', () => expectCellToBeEditable(fixture, true))

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

			it('should apply the edited value when changed', () => shouldApplyTheEditedValueWhenChanged(fixture))
		})

		describe('Always', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid editability='always'></test-data-grid>`)

			it('should be always editable', () => expectCellToBeEditable(fixture, true, true))

			it('should apply the edited value when changed', () => shouldApplyTheEditedValueWhenChanged(fixture, true))

			it('should not auto-focus on any cell', async () => {
				const spy = spyOn(HTMLElement.prototype, 'focus')
				await fixture.initialize()
				expect(spy).not.toHaveBeenCalled()
			})
		})
	})

	describe('Toolbar', () => {
		describe('without', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)
			it('should not have toolbar by default', () => expect(fixture.component.hasToolbar).toBeFalse())
		})

		describe('with slotted toolbar content', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid>
					<div slot='toolbar'>Toolbar</div>
				</test-data-grid>
			`)
			it('should have toolbar', () => expect(fixture.component.hasToolbar).toBeTrue())
		})

		describe('with toolbarDefaultTemplate', () => {
			@component('test-data-grid-with-toolbar')
			class DataGridWithToolbar extends TestDataGrid {
				override get toolbarDefaultTemplate() { return html`<div>Toolbar</div>` }
			}

			const fixture = new ComponentTestFixture(() => new DataGridWithToolbar())

			it('should have toolbar', () => expect(fixture.component.hasToolbar).toBeTrue())
		})
	})

	describe('Filters', () => {
		describe('without', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)
			it('should not have filters by default', () => expect(fixture.component.hasFilters).toBeFalse())
		})

		describe('with slotted filter content', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid>
					<div slot='filter'>Filter</div>
				</test-data-grid>
			`)
			it('should have filters', () => expect(fixture.component.hasFilters).toBeTrue())
		})

		describe('with filterDefaultTemplate', () => {
			@component('test-data-grid-with-filter')
			class DataGridWithFilters extends TestDataGrid {
				override get filtersDefaultTemplate() { return html`<div>Filter</div>` }
			}

			const fixture = new ComponentTestFixture(() => new DataGridWithFilters())

			it('should have filters', () => expect(fixture.component.hasFilters).toBeTrue())
		})
	})
})