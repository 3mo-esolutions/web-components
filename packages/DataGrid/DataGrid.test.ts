import { component, css, html, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { DataGrid, DataGridPagination, type DataGridRow, DataGridColumn, type DataGridColumnComponent, DataRecord, DataGridSelectability } from './index.js'

type Person = { id: number, name: string, birthDate: DateTime, children?: Array<Person>, balance: number }

const testData: Array<Person> = [
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0), balance: 100 },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0), balance: -50 },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0), balance: 0 },
]

class TestDataGrid extends DataGrid<Person> {
	override data: Array<Person> = [...testData]

	get headerSelectionCheckbox() { return this['header']?.renderRoot.querySelector('.selection mo-checkbox') ?? undefined }
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

/**
 * Mimics the composition of ModdableDataGrid, whose modebar renders a decorative scroller
 * before the grid's own content scroller.
 */
class TestDataGridWithLeadingScroller extends TestDataGrid {
	protected override get template() {
		return html`
			<mo-scroller id='modebar'>modebar</mo-scroller>
			${super.template}
		`
	}
}

customElements.define('test-data-grid-with-leading-scroller', TestDataGridWithLeadingScroller)

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
				{ id: 4, name: 'John', birthDate: new DateTime(2000, 0, 0), balance: 200 },
				{ id: 5, name: 'Jane', birthDate: new DateTime(2000, 0, 0), balance: -100 },
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
			fixture.component.data = [{ ...first, children: [third!] }, second!]
			const firstWithChildren = fixture.component.data[0]

			await fixture.updateComplete

			const [firstRecord, secondRecord, thirdRecord] = fixture.component.dataRecords

			expect(firstRecord?.index).toBe(0)
			expect(firstRecord?.level).toBe(0)
			expect(firstRecord?.data).toBe(firstWithChildren)
			expect(firstRecord?.subDataRecords?.length).toBe(1)
			expect(firstRecord?.subDataRecords?.[0]?.index).toBe(1)
			expect(firstRecord?.subDataRecords?.[0]?.level).toBe(1)
			expect(firstRecord?.subDataRecords?.[0]?.data).toBe(third)

			expect(secondRecord?.index).toBe(1)
			expect(secondRecord?.level).toBe(1)
			expect(secondRecord?.data).toBe(third)

			expect(thirdRecord?.index).toBe(2)
			expect(thirdRecord?.level).toBe(0)
			expect(thirdRecord?.data).toBe(second)
		})
	})

	describe('Columns', () => {
		describe('auto-generated', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)

			it('should auto-generate columns', () => {
				const [firstColumn, secondColumn, thirdColumn] = fixture.component.columns

				expect(firstColumn?.dataSelector).toEqual('id')
				expect(firstColumn).toBeInstanceOf(DataGridColumn)
				expect(firstColumn?.heading).toEqual('Id')
				expect(firstColumn?.width).toEqual('max-content')
				expect(firstColumn?.hidden).toEqual(false)

				expect(secondColumn?.dataSelector).toEqual('name')
				expect(secondColumn).toBeInstanceOf(DataGridColumn)
				expect(secondColumn?.heading).toEqual('Name')
				expect(secondColumn?.width).toEqual('max-content')
				expect(secondColumn?.hidden).toEqual(false)

				expect(thirdColumn?.dataSelector).toEqual('birthDate')
				expect(thirdColumn).toBeInstanceOf(DataGridColumn)
				expect(thirdColumn?.heading).toEqual('Birth Date')
				expect(thirdColumn?.width).toEqual('max-content')
				expect(thirdColumn?.hidden).toEqual(false)
			})

			it('should automatically set dataGrid property of columns', () => {
				const [firstColumn, secondColumn] = fixture.component.columns
				expect(firstColumn?.dataGrid).toBe(fixture.component)
				expect(secondColumn?.dataGrid).toBe(fixture.component)
			})
		})

		describe('explicit', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)

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

			it('should take precedence over auto-generated columns', async () => {
				fixture.component.columns = [
					new DataGridColumn({ heading: 'Name', dataSelector: 'name' }),
				]

				await fixture.updateComplete

				expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['name'])
				expect(fixture.component.columnsController.columns.definitions.programmatic.length).toBe(1)
				expect(fixture.component.columnsController.columns.definitions.generated.length).toBe(0)
			})

			it('should be providable through the deprecated setColumns as well', async () => {
				fixture.component.setColumns([
					new DataGridColumn({ heading: 'Name', dataSelector: 'name' }),
				])

				await fixture.updateComplete

				expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['name'])
			})
		})

		describe('extracted from slotted elements', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid>
					<mo-data-grid-column-number heading='Id' dataSelector='id'></mo-data-grid-column-number>
					<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
				</test-data-grid>
			`)

			it('should extract columns from elements', () => {
				const [firstColumn, secondColumn] = fixture.component.columns

				expect(firstColumn?.dataSelector).toEqual('id')
				expect(firstColumn?.heading).toEqual('Id')

				expect(secondColumn?.dataSelector).toEqual('name')
				expect(secondColumn?.heading).toEqual('Name')
			})

			it('should set dataGrid property of columns', () => {
				const [firstColumn, secondColumn] = fixture.component.columns
				expect(firstColumn?.dataGrid).toBe(fixture.component)
				expect(secondColumn?.dataGrid).toBe(fixture.component)
			})

			it('should update columns when columns change', async () => {
				fixture.component.querySelector('mo-data-grid-column-number')!.heading = 'Identifier'
				await fixture.updateComplete
				expect(fixture.component.columns[0]?.heading).toEqual('Identifier')
			})

			it('should update columns when columns connect or disconnect', async () => {
				const column = fixture.component.querySelector('mo-data-grid-column-number')
				column?.remove()
				await fixture.updateComplete
				expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['name'])

				fixture.component.innerHTML += '<mo-data-grid-column-number heading="Id" dataSelector="id"></mo-data-grid-column-number>'
				await fixture.updateComplete
				expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['name', 'id'])
			})

			it('should expose the definition sources with extracted definitions winning', () => {
				const definitions = fixture.component.columnsController.columns.definitions

				expect(definitions.extracted.map(c => c.dataSelector)).toEqual(['id', 'name'])
				expect(definitions.programmatic.length).toBe(0)
				expect(definitions.generated.length).toBe(0)
			})

			it('should be iterable and array-like over the effective definitions', () => {
				const definitions = fixture.component.columnsController.columns.definitions

				expect(definitions.length).toBe(2)
				expect(definitions[0]?.dataSelector).toBe('id')
				expect([...definitions].map(c => c.dataSelector)).toEqual(['id', 'name'])
				expect(Array.from(definitions).map(c => c.dataSelector)).toEqual(['id', 'name'])
				expect(definitions.map(c => c.dataSelector)).toEqual(['id', 'name'])
				expect(definitions.find(c => c.dataSelector === 'name')?.heading).toBe('Name')
				expect(definitions.filter(c => c.dataSelector === 'id').length).toBe(1)
			})

			it('should compose anew and update the data grid when a source is assigned', async () => {
				const definitions = fixture.component.columnsController.columns.definitions
				const columnsChange = jasmine.createSpy()
				fixture.component.addEventListener('columnsChange', columnsChange)

				definitions.extracted = [new DataGridColumn({ heading: 'Balance', dataSelector: 'balance' })]
				await fixture.updateComplete

				expect(columnsChange).toHaveBeenCalled()
				expect(definitions.length).toBe(1)
				expect(definitions[0]?.dataSelector).toBe('balance')
				expect(definitions[1]).toBeUndefined()
				expect([...definitions].map(c => c.dataSelector)).toEqual(['balance'])
				expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['balance'])
			})
		})

		describe('extracted from non-slotted elements', () => {
			@component('test-data-grid-with-columns')
			class TestDataGridWithColumns extends TestDataGrid {
				@state() disconnectId = false
				protected override get columnsTemplate() {
					return html`
						${this.disconnectId ? html.nothing : html`
							<mo-data-grid-column-number heading='Id' dataSelector='id'></mo-data-grid-column-number>
						`}
						<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
					`
				}
			}
			const fixture = new ComponentTestFixture(() => new TestDataGridWithColumns())

			it('should extract columns from elements', () => {
				const [firstColumn, secondColumn] = fixture.component.columns

				expect(firstColumn?.dataSelector).toEqual('id')
				expect(firstColumn?.heading).toEqual('Id')

				expect(secondColumn?.dataSelector).toEqual('name')
				expect(secondColumn?.heading).toEqual('Name')
			})

			it('should update columns when the template changes', async () => {
				fixture.component.disconnectId = true
				await fixture.updateComplete
				expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['name'])

				fixture.component.disconnectId = false
				await fixture.updateComplete
				expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['id', 'name'])
			})
		})

		describe('modifications', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid>
					<mo-data-grid-column-number heading='Id' dataSelector='id'></mo-data-grid-column-number>
					<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
				</test-data-grid>
			`)

			it('should apply modifications to known columns by order and presentation and append unknown ones as defined', async () => {
				fixture.component.columnsController.columns.modifications.set([{ dataSelector: 'name', width: '200px', hidden: true }])
				await fixture.updateComplete

				expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['name', 'id'])
				expect(fixture.component.columns[0]?.width).toBe('200px')
				expect(fixture.component.columns[0]?.hidden).toBe(true)
				expect(fixture.component.columns[1]?.heading).toBe('Id')
				expect(fixture.component.columns[1]?.hidden).toBe(false)
			})

			it('should keep the modifications when a definition changes', async () => {
				fixture.component.columnsController.columns.modifications.set([{ dataSelector: 'name', width: '200px' }, { dataSelector: 'id' }])

				fixture.component.querySelector('mo-data-grid-column-text')!.heading = 'Full Name'
				await fixture.updateComplete

				expect(fixture.component.columns[0]?.heading).toBe('Full Name')
				expect(fixture.component.columns[0]?.width).toBe('200px')
			})

			it('should omit modifications without a definition and apply them once their column element renders', async () => {
				fixture.component.columnsController.columns.modifications.set([{ dataSelector: 'birthDate', width: '321px' }, { dataSelector: 'name' }, { dataSelector: 'id' }])
				await fixture.updateComplete
				expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['name', 'id'])

				const column = document.createElement('mo-data-grid-column-text') as any
				column.heading = 'Birth Date'
				column.dataSelector = 'birthDate'
				fixture.component.appendChild(column)
				await new Promise(r => setTimeout(r))
				await fixture.updateComplete

				expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['birthDate', 'name', 'id'])
				expect(fixture.component.columns[0]?.width).toBe('321px')
				expect(fixture.component.columns[0]?.heading).toBe('Birth Date')
			})

			it('should record hiding a column in the modifications', async () => {
				fixture.component.columns.find(c => c.dataSelector === 'id')!.hide()
				await fixture.updateComplete

				expect(fixture.component.columns.find(c => c.dataSelector === 'id')?.hidden).toBe(true)
				expect(fixture.component.columnsController.columns.modifications.find(e => e.dataSelector === 'id')?.hidden).toBe(true)
			})

			it('should record the placement of a moved column', async () => {
				fixture.component.columnsController.columns.move('name', 0)
				await fixture.updateComplete

				expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['name', 'id'])
				// Moving a column expresses intent about the order of all of them
				expect(fixture.component.columnsController.columns.modifications.map(e => e.dataSelector)).toEqual(['name', 'id'])
			})
		})
	})

	describe('Selection', () => {
		const shouldAutoSelectTheRightClickedRow = async (fixture: ComponentTestFixture<TestDataGrid>) => {
			const row = fixture.component.rows[0] as DataGridRow<Person>
			await row.openContextMenu()
			expect(fixture.component.isRowSelected(row)).toBe(true)
		}

		const shouldOpenContextMenuWithTheRightClickedRowData = async (fixture: ComponentTestFixture<TestDataGrid>) => {
			const row0 = fixture.component.rows[0] as DataGridRow<Person>
			const row1 = fixture.component.rows[1] as DataGridRow<Person>

			// Select row 0
			fixture.component.select([row0.data])
			await fixture.updateComplete

			// Capture every data set passed to getRowContextMenuTemplate. It is invoked for every
			// row during rendering (not only the opened one), so we assert on the set of calls and
			// on the resulting selection rather than on the last call.
			const receivedDataSets = new Array<Array<Person>>()
			const originalTemplate = fixture.component.getRowContextMenuTemplate!
			fixture.component.getRowContextMenuTemplate = (data: Array<Person>) => {
				receivedDataSets.push(data)
				return originalTemplate(data)
			}
			await fixture.updateComplete

			// Open context menu on unselected row 1
			await row1.openContextMenu()

			// Right-clicking the unselected row re-selects it, so the open menu reflects the
			// right-clicked row's data — not the previously selected row 0.
			expect(fixture.component.selectedData).toEqual([row1.data])
			expect(fixture.component.selectedData).not.toEqual([row0.data])
			expect(receivedDataSets).toContain([row1.data])

			await row1.closeContextMenu()
			fixture.component.getRowContextMenuTemplate = originalTemplate
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

		// A row context menu acts on a row, so a grid that has one has to be able to have a row.
		describe('Defaulting from a row context menu', () => {
			const plain = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)
			const withMenu = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid .getRowContextMenuTemplate=${getRowContextMenuTemplate}></test-data-grid>
			`)
			const withMenuAndSelectability = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid selectability=${DataGridSelectability.Multiple} .getRowContextMenuTemplate=${getRowContextMenuTemplate}></test-data-grid>
			`)

			it('should stay undefined without one', () => expect(plain.component.selectability).toBe(undefined))
			it('should become single with one', () => expect(withMenu.component.selectability).toBe(DataGridSelectability.Single))
			it('should leave an explicit selectability alone', () => expect(withMenuAndSelectability.component.selectability).toBe(DataGridSelectability.Multiple))
		})

		describe('None', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid></test-data-grid>
			`)

			it('should be the default', () => expect(fixture.component.selectability).toEqual(undefined))

			it('should not render checkboxes', () => {
				expect(fixture.component.headerSelectionCheckbox).not.toBeDefined()
				expect(fixture.component.rowsSelectionCheckboxes.length).toBe(0)
			})

			it('should not dispatch the "selectionChange" event when a row is clicked', () => shouldDispatchSelectionChange(fixture, [fixture.component.data[0]!], false))
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
			it('should open context menu with the right-clicked row data when another row is selected', () => shouldOpenContextMenuWithTheRightClickedRowData(fixture))

			it('should not select the row when clicked', () => expectClickingTheRowLeadsToSelection(fixture, false))
			it('should not select the row when isDataSelectable returns false', () => shouldNotSelectTheRowWhenIsDataSelectableReturnsFalse(fixture))
			it('should select the row when clicked and selectOnClick is true', () => shouldSelectTheRowWhenSelectOnClick(fixture))
			it('should select the row when focused with the keyboard', () => expectCellFocusLeadsToRowSelectionWhenSelectOnClick(fixture))
			it('should dispatch the "selectionChange" event when a row is clicked', () => shouldDispatchSelectionChange(fixture, [fixture.component.data[0]!], true))
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
			it('should open context menu with the right-clicked row data when another row is selected', () => shouldOpenContextMenuWithTheRightClickedRowData(fixture))

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
			const firstRow = fixture.component.rows[0]!
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

			expect(fixture.component.data[0]?.name).toBe('Not John!')
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

			it('should not stop propagation of Enter key when already editing', () => {
				const cell = fixture.component.rows[0]?.cells[0]
				cell?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
				expect(cell?.isEditing).toBe(true)

				const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
				spyOn(event, 'stopPropagation')
				cell?.dispatchEvent(event)
				expect(event.stopPropagation).not.toHaveBeenCalled()
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

	describe('Primary Action', () => {
		const getPrimaryActionSlot = (component: TestDataGrid) => component.renderRoot.querySelector<HTMLSlotElement>('slot[name=primary-action]') ?? undefined

		describe('without', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)

			it('should not have a primary action by default', () => expect(fixture.component.hasPrimaryAction).toBeFalse())

			it('should not render the toolbar', () => expect(fixture.component.renderRoot.querySelector('#toolbar')).toBeNull())
		})

		describe('with slotted primary action', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`
				<test-data-grid>
					<button slot='primary-action'>Create</button>
				</test-data-grid>
			`)

			it('should have a primary action', () => expect(fixture.component.hasPrimaryAction).toBeTrue())

			it('should render the slotted element', () => {
				expect(fixture.component.primaryActionElements.length).toBe(1)
				expect(getPrimaryActionSlot(fixture.component)?.assignedElements().length).toBe(1)
			})
		})

		// Regression: a primary action provided by a template getter instead of a slotted element used to leave
		// "hasPrimaryAction" false, which hid the whole toolbar - consumers had to override the flag themselves.
		describe('with primaryActionDefaultTemplate', () => {
			@component('test-data-grid-with-primary-action')
			class DataGridWithPrimaryAction extends TestDataGrid {
				@state() primaryActionHidden = false
				protected override get primaryActionDefaultTemplate() {
					return this.primaryActionHidden ? html.nothing : html`<button id='create'>Create</button>`
				}
			}

			const fixture = new ComponentTestFixture(() => new DataGridWithPrimaryAction())

			it('should have a primary action without overriding "hasPrimaryAction"', () => expect(fixture.component.hasPrimaryAction).toBeTrue())

			it('should render the toolbar', () => expect(fixture.component.renderRoot.querySelector('#toolbar')).not.toBeNull())

			it('should render the primary action as the slot\'s default content', () => {
				const button = fixture.component.renderRoot.querySelector('#create')
				expect(button).not.toBeNull()
				expect(getPrimaryActionSlot(fixture.component)?.assignedElements().length).toBe(0)
			})

			it('should render the primary action visibly', () => {
				const button = fixture.component.renderRoot.querySelector('#create') as HTMLElement
				expect(button.checkVisibility()).toBeTrue()
				expect(button.getBoundingClientRect().width).toBeGreaterThan(0)
				expect(button.getBoundingClientRect().height).toBeGreaterThan(0)
			})

			it('should be replaced by slotted primary actions like any other default slot content', async () => {
				const slotted = document.createElement('button')
				slotted.id = 'slotted'
				slotted.slot = 'primary-action'
				fixture.component.appendChild(slotted)
				await fixture.updateComplete

				expect(getPrimaryActionSlot(fixture.component)?.assignedElements()).toEqual([slotted])
				expect((fixture.component.renderRoot.querySelector('#create') as HTMLElement).checkVisibility()).toBeFalse()

				slotted.remove()
				await fixture.updateComplete
				expect((fixture.component.renderRoot.querySelector('#create') as HTMLElement).checkVisibility()).toBeTrue()
			})

			it('should hide the toolbar again when the template becomes empty', async () => {
				fixture.component.primaryActionHidden = true
				await fixture.updateComplete

				expect(fixture.component.hasPrimaryAction).toBeFalse()
				expect(fixture.component.renderRoot.querySelector('#toolbar')).toBeNull()

				fixture.component.primaryActionHidden = false
				await fixture.updateComplete

				expect(fixture.component.hasPrimaryAction).toBeTrue()
				expect(fixture.component.renderRoot.querySelector('#create')).not.toBeNull()
			})
		})
	})

	describe('Cell Styling', () => {
		const fixture = new class extends ComponentTestFixture<DataGrid<Person>> {
			constructor() {
				super(html`
					<test-data-grid>
						<mo-data-grid-column-number heading='Balance' dataSelector='balance'></mo-data-grid-column-number>
					</test-data-grid>
				`)
			}

			// Columns are immutable value-objects, so styling is defined where the column is defined: on the element
			get balanceColumnElement() {
				return this.component.querySelector('mo-data-grid-column-number') as DataGridColumnComponent<Person, number>
			}

			getBalanceCell(rowIndex: number) {
				return this.component.rows[rowIndex]?.cells?.find(cell => cell.column.dataSelector === 'balance')
			}

			get updateCompleted() {
				return (async () => {
					await new Promise(r => setTimeout(r, 0))
					await this.updateComplete
				})()
			}
		}

		describe('no contentStyle', () => {
			it('should not render style tag when contentStyle is undefined', async () => {
				fixture.balanceColumnElement.contentStyle = undefined
				await fixture.updateCompleted

				const cell = fixture.getBalanceCell(0)
				expect(cell?.renderRoot.querySelector('style')).toBeFalsy()
			})

			it('should not modify styles when function returns undefined', async () => {
				fixture.balanceColumnElement.contentStyle = () => undefined
				await fixture.updateCompleted

				const cell = fixture.getBalanceCell(0)
				expect(cell?.renderRoot.querySelector('style')).toBeFalsy()
			})
		})

		describe('string contentStyle', () => {
			it('should apply function returning string as inline style based on value', async () => {
				fixture.balanceColumnElement.contentStyle = value => value < 0 ? 'color: red' : 'color: green'
				await fixture.updateCompleted

				const positiveCell = fixture.getBalanceCell(0) // balance: 100
				const negativeCell = fixture.getBalanceCell(1) // balance: -50

				expect(positiveCell?.style.color).toBe('green')
				expect(negativeCell?.style.color).toBe('red')
			})

			it('should have access to data object in contentStyle function', async () => {
				fixture.balanceColumnElement.contentStyle = (_, person) => person.balance > 0 ? 'font-weight: bold' : 'font-weight: normal'
				await fixture.updateCompleted

				const johnCell = fixture.getBalanceCell(0) // balance: 100
				const janeCell = fixture.getBalanceCell(1) // balance: -50

				expect(getComputedStyle(johnCell!).fontWeight).toBe('700') // bold
				expect(getComputedStyle(janeCell!).fontWeight).toBe('400') // normal
			})
		})

		describe('CSSResult contentStyle', () => {
			it('should render static CSSResult as style tag in shadow DOM', async () => {
				fixture.balanceColumnElement.contentStyle = css`:host { color: blue }`
				await fixture.updateCompleted

				const cell = fixture.getBalanceCell(0)
				const styleTag = cell?.renderRoot.querySelector('style')

				expect(styleTag).toBeTruthy()
				expect(styleTag?.textContent).toContain(':host')
				expect(getComputedStyle(cell!).color).toBe('rgb(0, 0, 255)')
			})

			it('should render function returning CSSResult with different styles per cell', async () => {
				fixture.balanceColumnElement.contentStyle = value => value < 0 ? css`:host { color: red }` : css`:host { color: green }`
				await fixture.updateCompleted

				const positiveCell = fixture.getBalanceCell(0) // balance: 100
				const negativeCell = fixture.getBalanceCell(1) // balance: -50

				const positiveStyle = positiveCell?.renderRoot.querySelector('style')?.textContent
				const negativeStyle = negativeCell?.renderRoot.querySelector('style')?.textContent

				expect(positiveStyle).toContain('green')
				expect(negativeStyle).toContain('red')
				expect(getComputedStyle(positiveCell!).color).toBe('rgb(0, 128, 0)')
			})
		})
	})

	describe('Pagination resolution', () => {
		const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)

		afterEach(() => DataGrid.defaultPagination = undefined)

		it('should not paginate a grid which specifies none', () => {
			expect(fixture.component.resolvedPagination).toBeUndefined()
			expect(fixture.component.hasPagination).toBeFalse()
		})

		it('should revive a pagination which is set as a string, as a mode applies it', () => {
			fixture.component.setPagination('pages 100')

			expect(fixture.component.pagination).toBeInstanceOf(DataGridPagination)
			expect(fixture.component.pagination?.toString()).toBe('pages 100')
		})

		it('should fill the strategy of a size-only pagination', () => {
			fixture.component.setPagination(25)

			expect(fixture.component.resolvedPagination).toEqual({ strategy: 'pages', size: 25 })
		})

		it('should fill the size of a strategy-only pagination', () => {
			fixture.component.setPagination('pages')

			expect(fixture.component.resolvedPagination).toEqual({ strategy: 'pages', size: 'auto' })
		})

		it('should take an unspecified slot from the class default', () => {
			DataGrid.defaultPagination = 'pages 50'

			expect(fixture.component.resolvedPagination).toEqual({ strategy: 'pages', size: 50 })
		})

		it('should prefer the specified slots over the class default', () => {
			DataGrid.defaultPagination = 'pages 50'
			fixture.component.setPagination(100)

			expect(fixture.component.resolvedPagination).toEqual({ strategy: 'pages', size: 100 })
		})

		it('should accept a class default depending on the grid it is applied to', () => {
			DataGrid.defaultPagination = dataGrid => dataGrid.data.length > 0 ? 'pages 10' : undefined

			expect(fixture.component.resolvedPagination).toEqual({ strategy: 'pages', size: 10 })
		})

		it('should cut the rows into a page only while navigating pages explicitly', () => {
			fixture.component.setPagination('pages 2')
			expect(fixture.component.renderDataRecords.length).toBe(2)

			fixture.component.setPagination('scroll 2')
			expect(fixture.component.renderDataRecords.length).toBe(fixture.component.data.length)
		})
	})

	describe('Scroller', () => {
		const scrollerOf = (dataGrid: DataGrid<Person>) => dataGrid['scroller']

		describe('without other scrollers in the shadow root', () => {
			const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)

			it('should resolve to the scroller containing the content', () => {
				expect(scrollerOf(fixture.component)?.querySelector('#content')).not.toBeNull()
			})
		})

		// A subclass rendering its own scroller before the content used to shadow the content scroller,
		// as the query resolved to the first scroller in the shadow root instead of the grid's own one.
		describe('with another scroller preceding the content', () => {
			const fixture = new ComponentTestFixture<TestDataGridWithLeadingScroller>(
				html`<test-data-grid-with-leading-scroller></test-data-grid-with-leading-scroller>`
			)

			it('should resolve to the scroller containing the content', () => {
				expect(scrollerOf(fixture.component)?.querySelector('#content')).not.toBeNull()
			})

			it('should not resolve to the preceding scroller', () => {
				const precedingScroller = fixture.component.renderRoot.querySelector('mo-scroller#modebar')

				expect(precedingScroller).not.toBeNull()
				expect(scrollerOf(fixture.component)).not.toBe(precedingScroller as never)
			})

			it('should scroll the rows and not the preceding scroller', () => {
				const scroller = scrollerOf(fixture.component)

				expect(scroller?.contains(fixture.component.rows[0]!)).toBe(true)
			})
		})
	})
})