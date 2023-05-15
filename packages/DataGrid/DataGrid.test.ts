import { ComponentTestFixture } from '@a11d/lit/dist/test'
import { DataGrid, DataGridRow, DataGridSelectionMode } from './index.js'
import { html } from '@a11d/lit'

type Person = { id: number, name: string, birthDate: DateTime }

const people = [
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0) },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0) },
]

describe('DataGrid', () => {
	const fixture = new ComponentTestFixture<DataGrid<Person>>(html`
		<mo-data-grid selectionMode=${DataGridSelectionMode.Single} .data=${people} .getRowContextMenuTemplate=${() => html`
			<mo-menu-item>Item1</mo-menu-item>
			<mo-menu-item>Item2</mo-menu-item>
		`}></mo-data-grid>
	`)

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

	it('should auto-select the right-clicked row', async () => {
		const row = fixture.component.rows[0] as DataGridRow<Person>

		await row.openContextMenu()

		expect(row.selected).toEqual(true)
	})
})