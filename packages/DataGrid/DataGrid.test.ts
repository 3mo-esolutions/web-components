import { ComponentTestFixture } from '@a11d/lit/dist/test'
import { DataGrid, DataGridRow, DataGridSelectionMode } from './index.js'
import { html } from '@a11d/lit'

type Person = { id: number, name: string, birthDate: DateTime }

const people = [
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0) },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0) },
]

class TestDataGrid extends DataGrid<Person> {
	override data = people

	get headerSelectionCheckbox() { return this.header?.renderRoot.querySelector('mo-checkbox') ?? undefined }
	get rowsSelectionCheckboxes() { return this.rows.map(row => row.renderRoot.querySelector('mo-checkbox') ?? undefined).filter(Boolean) }

	isRowSelected(row: DataGridRow<Person>, skipCheckboxCheck = false) {
		const checkboxChecked = row.renderRoot.querySelector('mo-checkbox')?.checked ?? false
		return row.selected && (skipCheckboxCheck || checkboxChecked)
	}
}

const getRowContextMenuTemplate = () => html`
	<mo-menu-item>Item1</mo-menu-item>
	<mo-menu-item>Item2</mo-menu-item>
`

customElements.define('test-data-grid', TestDataGrid)

describe('DataGrid', () => {
	const fixture = new ComponentTestFixture<TestDataGrid>(html`<test-data-grid></test-data-grid>`)

	it('should auto-generate columns', () => {
		const [firstColumn, secondColumn, thirdColumn] = fixture.component.columns
		// TODO: dataSelector's type (KeyPath) leads to compiler exhaustion

		// expect(firstColumn?.dataSelector as any).toEqual('id')
		expect(firstColumn?.heading).toEqual('Id')
		expect(firstColumn?.width).toEqual('1fr')
		expect(firstColumn?.hidden).toEqual(false)

		// expect(secondColumn?.dataSelector as any).toEqual('name')
		expect(secondColumn?.heading).toEqual('Name')
		expect(secondColumn?.width).toEqual('1fr')
		expect(secondColumn?.hidden).toEqual(false)

		// expect(thirdColumn?.dataSelector as any).toEqual('birthDate')
		expect(thirdColumn?.heading).toEqual('Birth Date')
		expect(thirdColumn?.width).toEqual('1fr')
		expect(thirdColumn?.hidden).toEqual(false)
	})

	describe('Selection', () => {
		const shouldAutoSelectTheRightClickedRow = async (f = fixture) => {
			const row = f.component.rows[0] as DataGridRow<Person>
			await row.openContextMenu()
			expect(fixture.component.isRowSelected(row)).toBe(true)
		}

		const shouldNotRenderCheckboxesWhenSelectionCheckboxesHidden = async (f = fixture) => {
			f.component.selectionCheckboxesHidden = true
			await f.updateComplete
			expect(f.component.headerSelectionCheckbox).not.toBeDefined()
			expect(f.component.rowsSelectionCheckboxes.length).toBe(0)
		}

		const expectClickingTheRowLeadsToSelection = async (f = fixture, selection = true, skipCheckboxCheck = false) => {
			const row = f.component.rows[0] as DataGridRow<Person>
			row.renderRoot.querySelector('#contentContainer')?.dispatchEvent(new MouseEvent('click'))
			await f.updateComplete
			expect(f.component.isRowSelected(row, skipCheckboxCheck)).toBe(selection)
		}

		const shouldSelectTheRowWhenSelectOnClick = async (f = fixture) => {
			f.component.selectOnClick = true
			await f.updateComplete
			await expectClickingTheRowLeadsToSelection(f)
		}

		const shouldSelectTheRowWhenSelectionCheckboxesHidden = async (f = fixture) => {
			f.component.selectionCheckboxesHidden = true
			await f.updateComplete
			await expectClickingTheRowLeadsToSelection(f, true, true)
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
			it('should select the row when clicked and selectOnClick is true', () => shouldSelectTheRowWhenSelectOnClick(fixture))
			it('should select the row when clicked and selectionCheckboxesHidden is true', () => shouldSelectTheRowWhenSelectionCheckboxesHidden(fixture))
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
			it('should select the row when clicked and selectOnClick is true', () => shouldSelectTheRowWhenSelectOnClick(fixture))
			it('should select the row when clicked and selectionCheckboxesHidden is true', () => shouldSelectTheRowWhenSelectionCheckboxesHidden(fixture))
		})
	})
})