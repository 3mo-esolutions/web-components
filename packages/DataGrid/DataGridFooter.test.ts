import { query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type MenuItem } from '@3mo/menu'
import { DataGrid, DataGridPagination, type DataGridFooter } from './index.js'

type Person = { id: number, name: string, birthDate: DateTime, children?: Array<Person> }

const testData: Array<Person> = [
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0) },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0) },
]

class TestDataGrid extends DataGrid<Person> {
	override data: Array<Person> = [...testData]
	override pagination = DataGridPagination.from('pages 25')
	override get supportsDynamicPageSize() { return false }

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

	it('should show a plain count without navigation for a grid which paginates on its own', async () => {
		fixture.component.setPagination('scroll')
		spyOnProperty(fixture.component, 'hasPagination').and.returnValue(true)
		await fixture.update()
		await fixture.component.footerElement.updateComplete

		const footerRoot = fixture.component.footerElement.renderRoot
		expect(footerRoot.querySelector('#page-info')).not.toBeNull()
		expect(footerRoot.querySelector('mo-icon-button')).toBeNull()
		expect(footerRoot.querySelector('mo-menu')).not.toBeNull()
	})
})