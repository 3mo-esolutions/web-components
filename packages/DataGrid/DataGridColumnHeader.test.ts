import { html, type HTMLTemplateResult } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type DataGrid, DataGridColumn, type DataGridColumnHeader, DataGridSortingStrategy } from './index.js'

type Person = { id: number, name: string, age: number }

const testData: Array<Person> = [
	{ id: 1, name: 'Alice', age: 30 },
	{ id: 2, name: 'Bob', age: 25 },
]

describe('DataGridColumnHeader', () => {
	const fixture = new ComponentTestFixture<DataGrid<Person>>(html`<mo-data-grid .data=${testData}></mo-data-grid>`)

	beforeEach(() => window.dispatchEvent(new KeyboardEvent('keyup')))

	const settle = async () => {
		await fixture.updateComplete
		await new Promise(r => setTimeout(r, 30))
		const header = fixture.component.renderRoot.querySelector('mo-data-grid-header')!
		header.requestUpdate()
		await header.updateComplete
		const columnHeaders = [...header.renderRoot.querySelectorAll('mo-data-grid-column-header')]
		for (const columnHeader of columnHeaders) {
			columnHeader.requestUpdate()
			await columnHeader.updateComplete
		}
		return columnHeaders
	}

	const withColumns = (...columns: Array<DataGridColumn<Person>>) => {
		fixture.component.columns = columns
		return settle()
	}

	const nameColumn = (column: Partial<DataGridColumn<Person>> = {}) =>
		new DataGridColumn<Person>({ heading: 'Name', dataSelector: 'name', ...column })

	const ageColumn = (column: Partial<DataGridColumn<Person>> = {}) =>
		new DataGridColumn<Person>({ heading: 'Age', dataSelector: 'age', alignment: 'end', ...column })

	const contentOf = (columnHeader: DataGridColumnHeader) => columnHeader.renderRoot.querySelector<HTMLElement>('#content')!
	const sortOf = (columnHeader: DataGridColumnHeader) => columnHeader.renderRoot.querySelector('#sort')
	const separatorOf = (columnHeader: DataGridColumnHeader) => columnHeader.renderRoot.querySelector('mo-data-grid-header-separator')!

	describe('Heading', () => {
		it('should render the column\'s heading with the column\'s alignment', async () => {
			const [name, age] = await withColumns(nameColumn(), ageColumn())

			expect(contentOf(name!).textContent?.trim()).toBe('Name')
			expect(contentOf(name!).style.textAlign).toBe('start')
			expect(name!.renderRoot.querySelector('#container')?.getAttribute('direction')).toBe('horizontal')

			expect(contentOf(age!).textContent?.trim()).toBe('Age')
			expect(contentOf(age!).style.textAlign).toBe('end')
			expect(age!.renderRoot.querySelector('#container')?.getAttribute('direction')).toBe('horizontal-reversed')
		})
	})

	describe('Sorting', () => {
		it('should toggle the sort on the sort icon-button without opening the menu, as the click stops propagation', async () => {
			const [name] = await withColumns(nameColumn(), ageColumn())

			sortOf(name!)!.querySelector<HTMLElement>('mo-icon-button')!.click()
			await settle()

			expect(fixture.component.getSorting()).toEqual([{ selector: 'name', strategy: DataGridSortingStrategy.Descending, rank: 1 }])
			expect(name!.menuOpen).toBeFalse()
		})

		it('should reflect the sorting strategy in the icon and keep it hidden while unsorted', async () => {
			const [name] = await withColumns(nameColumn(), ageColumn())

			expect(sortOf(name!)?.hasAttribute('data-preview')).toBeTrue()
			expect(getComputedStyle(sortOf(name!)!).display).toBe('none')

			fixture.component.sort({ selector: 'name', strategy: DataGridSortingStrategy.Ascending })
			await settle()

			expect(sortOf(name!)?.hasAttribute('data-preview')).toBeFalse()
			expect(sortOf(name!)?.querySelector('mo-icon-button')?.getAttribute('icon')).toBe('arrow_upward')

			fixture.component.sort({ selector: 'name', strategy: DataGridSortingStrategy.Descending })
			await settle()

			expect(sortOf(name!)?.querySelector('mo-icon-button')?.getAttribute('icon')).toBe('arrow_downward')
		})

		it('should show the sorting rank only while multiple sortings are active', async () => {
			const [name, age] = await withColumns(nameColumn(), ageColumn())

			fixture.component.sort({ selector: 'name', strategy: DataGridSortingStrategy.Ascending })
			await settle()
			expect(sortOf(name!)?.querySelector('span')).toBeNull()

			fixture.component.sort([
				{ selector: 'name', strategy: DataGridSortingStrategy.Ascending },
				{ selector: 'age', strategy: DataGridSortingStrategy.Descending },
			])
			await settle()

			expect(sortOf(name!)?.querySelector('span')?.textContent?.trim()).toBe('1')
			expect(sortOf(age!)?.querySelector('span')?.textContent?.trim()).toBe('2')
		})

		it('should mark the active strategy\'s menu item selected and reset the sorting when it is clicked again', async () => {
			const [name] = await withColumns(nameColumn(), ageColumn())
			const itemOf = (icon: string) => name!.renderRoot.querySelector(`mo-selectable-menu-item[icon=${icon}]`)

			fixture.component.sort({ selector: 'name', strategy: DataGridSortingStrategy.Descending })
			await settle()

			expect(itemOf('arrow_downward')?.selected).toBeTrue()
			expect(itemOf('arrow_upward')?.selected).toBeFalse()

			itemOf('arrow_downward')!.click()
			await settle()

			expect(fixture.component.getSorting()).toEqual([])
			expect(itemOf('arrow_downward')?.selected).toBeFalse()
		})

		it('should not offer sorting for a non-sortable column', async () => {
			const [name] = await withColumns(nameColumn({ sortable: false }), ageColumn())

			expect(sortOf(name!)).toBeNull()
			expect(name!.renderRoot.querySelector('mo-selectable-menu-item[icon=arrow_downward]')).toBeNull()
			expect(name!.renderRoot.querySelector('mo-selectable-menu-item[icon=arrow_upward]')).toBeNull()
		})
	})

	describe('Menu', () => {
		it('should hide the column through the \'Hide\' item', async () => {
			const [name] = await withColumns(nameColumn(), ageColumn())

			name!.renderRoot.querySelector<HTMLElement>('mo-menu-item[icon=visibility_off]')!.click()
			await settle()

			expect(fixture.component.columns.find(c => c.dataSelector === 'name')?.hidden).toBeTrue()
			expect(fixture.component.visibleColumns.map(c => c.dataSelector)).toEqual(['age'])
			expect(fixture.component.columnsController.columns.modifications.get('name')?.hidden).toBeTrue()
		})

		it('should append the column\'s custom menu items', async () => {
			const more = html`<mo-menu-item id='custom-more'>More</mo-menu-item>`
			const sorting = html`<mo-menu-item id='custom-sorting'>Sorting</mo-menu-item>`

			const [plain] = await withColumns(nameColumn({ getMenuItemsTemplate: () => more }))
			expect(plain!.renderRoot.querySelector('#custom-more')).not.toBeNull()

			const [mapped] = await withColumns(nameColumn({
				getMenuItemsTemplate: () => new Map<'sorting' | 'stickiness' | 'more', HTMLTemplateResult>([['sorting', sorting], ['more', more]]),
			}))
			const customSorting = mapped!.renderRoot.querySelector('#custom-sorting')
			const customMore = mapped!.renderRoot.querySelector('#custom-more')

			expect(customSorting).not.toBeNull()
			expect(customMore).not.toBeNull()
			expect(customSorting!.compareDocumentPosition(customMore!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		})
	})

	describe('Stickiness', () => {
		it('should reflect the column\'s stickiness, edge and inset as attributes, mirroring the body cells', async () => {
			const [name, age] = await withColumns(nameColumn({ sticky: 'start' }), ageColumn())

			expect(name!.getAttribute('data-sticky')).toBe('start')
			expect(name!.getAttribute('data-sticky-edge')).toBe('end')
			expect(name!.style.insetInline).toBe('0px auto')

			expect(age!.hasAttribute('data-sticky')).toBeFalse()
			expect(age!.hasAttribute('data-sticky-edge')).toBeFalse()
		})

		it('should mark the separator of the last visible column (data-last)', async () => {
			const [name, age] = await withColumns(nameColumn(), ageColumn())

			expect(separatorOf(name!).hasAttribute('data-last')).toBeFalse()
			expect(separatorOf(age!).hasAttribute('data-last')).toBeTrue()

			fixture.component.columns.find(c => c.dataSelector === 'age')!.hide()
			const [onlyName] = await settle()

			expect(separatorOf(onlyName!).hasAttribute('data-last')).toBeTrue()
		})
	})
})