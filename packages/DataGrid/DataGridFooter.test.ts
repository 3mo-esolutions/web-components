import { query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { MenuItem } from '@3mo/menu'
import { DataGrid, type DataGridFooter } from './index.js'

type Person = { id: number, name: string, birthDate: DateTime, children?: Array<Person> }

const testData: Array<Person> = [
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0) },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0) },
]

class TestDataGrid extends DataGrid<Person> {
	override data: Array<Person> = [...testData]
	get supportsDynamicPageSize() { return false }
	get hasPagination() { return true }

	@query('mo-data-grid-footer') readonly footerElement!: DataGridFooter<Person>
}

customElements.define('test-data-grid-footer', TestDataGrid)

describe('DataGridFooter', () => {
	const fixture = new ComponentTestFixture(() => new TestDataGrid())

	it('should pre-select the current page-size in the pagination menu', () => {
		const selectedPageSize = fixture.component
			.footerElement.renderRoot.querySelector<MenuItem>('mo-menu-item[selected]')
			?.textContent?.toNumber()

		expect(selectedPageSize).toBe(fixture.component.pageSize)
	})
})