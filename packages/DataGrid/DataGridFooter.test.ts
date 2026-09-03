import { query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Localizer } from '@3mo/localization'
import { DataGrid, DataGridCsvController, DataGridPagination, DataGridSelectability, type DataGridFooter } from './index.js'

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

class DynamicTestDataGrid extends DataGrid<Person> {
	override data: Array<Person> = [...testData]

	@query('mo-data-grid-footer') readonly footerElement!: DataGridFooter<Person>
}

customElements.define('test-data-grid-footer-dynamic', DynamicTestDataGrid)

class UnknownLengthTestDataGrid extends DynamicTestDataGrid {
	override get dataLength(): number | undefined { return undefined }
}

customElements.define('test-data-grid-footer-unknown-length', UnknownLengthTestDataGrid)

describe('DataGridFooter', () => {
	const language = Localizer.languages.current

	beforeEach(() => Localizer.languages.current = 'en')
	afterEach(() => Localizer.languages.current = language)

	const settle = async (fixture: ComponentTestFixture<DataGrid<Person> & { footerElement: DataGridFooter<Person> }>) => {
		await fixture.updateComplete
		const footer = fixture.component.footerElement
		footer.requestUpdate()
		await footer.updateComplete
		await new Promise(r => setTimeout(r, 20))
		return footer
	}

	const iconsOf = (footer: DataGridFooter<Person>) =>
		[...footer.renderRoot.querySelectorAll('mo-icon-button')].map(button => button.getAttribute('icon'))

	const navigationButtonOf = (footer: DataGridFooter<Person>, index: number) =>
		[...footer.renderRoot.querySelectorAll('mo-icon-button')][index] as HTMLElement

	const pageTextOf = (footer: DataGridFooter<Person>) =>
		[...footer.renderRoot.querySelectorAll('div')].find(div => div.children.length === 0 && !!div.textContent?.trim())

	describe('Page navigation', () => {
		const fixture = new ComponentTestFixture(() => {
			const dataGrid = new DynamicTestDataGrid()
			dataGrid.pagination = DataGridPagination.from('pages 1')
			return dataGrid
		})

		const [first, previous, next, last] = [0, 1, 2, 3]

		const disabledStates = (footer: DataGridFooter<Person>) =>
			[...footer.renderRoot.querySelectorAll('mo-icon-button')].map(button => button.hasAttribute('disabled'))

		it('should navigate with the first/previous/next/last buttons and disable them at the bounds', async () => {
			let footer = await settle(fixture)
			expect(fixture.component.maxPage).toBe(3)
			expect(disabledStates(footer)).toEqual([true, true, false, false])

			navigationButtonOf(footer, next).click()
			footer = await settle(fixture)
			expect(fixture.component.page).toBe(2)
			expect(disabledStates(footer)).toEqual([false, false, false, false])

			navigationButtonOf(footer, last).click()
			footer = await settle(fixture)
			expect(fixture.component.page).toBe(3)
			expect(disabledStates(footer)).toEqual([false, false, true, true])

			navigationButtonOf(footer, previous).click()
			footer = await settle(fixture)
			expect(fixture.component.page).toBe(2)

			navigationButtonOf(footer, first).click()
			footer = await settle(fixture)
			expect(fixture.component.page).toBe(1)
			expect(disabledStates(footer)).toEqual([true, true, false, false])
		})

		it('should dispatch pageChange through the grid when navigating', async () => {
			const footer = await settle(fixture)
			const pageChange = spyOn(fixture.component.pageChange, 'dispatch')

			navigationButtonOf(footer, next).click()
			await settle(fixture)

			expect(pageChange).toHaveBeenCalledOnceWith(2)
		})

		it('should switch to a number field when the page text is clicked and apply the entered page', async () => {
			let footer = await settle(fixture)
			expect(pageTextOf(footer)?.textContent?.trim()).toBe('1 of 3')

			pageTextOf(footer)!.click()
			footer = await settle(fixture)

			const field = footer.renderRoot.querySelector('mo-field-number')
			expect(field).not.toBeNull()
			expect(field?.getAttribute('value')).toBe('1')

			field!.change.dispatch(3)
			footer = await settle(fixture)

			expect(fixture.component.page).toBe(3)
			expect(footer.renderRoot.querySelector('mo-field-number')).toBeNull()
			expect(pageTextOf(footer)?.textContent?.trim()).toBe('3 of 3')
		})

		it('should clamp an entered page into [1, maxPage]', async () => {
			const enter = async (page: number) => {
				const footer = await settle(fixture)
				pageTextOf(footer)!.click()
				const opened = await settle(fixture)
				opened.renderRoot.querySelector('mo-field-number')!.change.dispatch(page)
				await settle(fixture)
				return fixture.component.page
			}

			expect(await enter(99)).toBe(3)
			expect(await enter(-5)).toBe(1)
		})

		it('should show only the current page without a maximum while the data length is unknown', async () => {
			const unknown = new UnknownLengthTestDataGrid()
			unknown.pagination = DataGridPagination.from('pages 1')
			document.body.appendChild(unknown)
			try {
				await unknown.updateComplete
				const footer = unknown.footerElement
				footer.requestUpdate()
				await footer.updateComplete

				expect(pageTextOf(footer)?.textContent?.trim()).toBe('1')
				expect(disabledStates(footer)).toEqual([true, true, false, true])

				pageTextOf(footer)!.click()
				footer.requestUpdate()
				await footer.updateComplete

				expect(footer.renderRoot.querySelector('mo-field-number')).toBeNull()
			} finally {
				unknown.remove()
			}
		})

		it('should show a plain count without navigation for a grid which paginates on its own', async () => {
			fixture.component.setPagination('scroll 1')
			const footer = await settle(fixture)

			expect(footer.renderRoot.querySelector('#page-info')).not.toBeNull()
			expect(footer.renderRoot.querySelector('mo-icon-button')).toBeNull()
			expect(footer.renderRoot.querySelector('mo-menu')).not.toBeNull()
		})

		it('should flip the navigation icons in RTL', async () => {
			let footer = await settle(fixture)
			expect(iconsOf(footer)).toEqual(['first_page', 'keyboard_arrow_left', 'keyboard_arrow_right', 'last_page'])

			Localizer.languages.current = 'fa'
			footer = await settle(fixture)

			expect(iconsOf(footer)).toEqual(['last_page', 'keyboard_arrow_right', 'keyboard_arrow_left', 'first_page'])
		})
	})

	describe('Page size menu', () => {
		const fixture = new ComponentTestFixture(() => new TestDataGrid())
		const dynamicFixture = new ComponentTestFixture(() => {
			const dataGrid = new DynamicTestDataGrid()
			dataGrid.pagination = DataGridPagination.from('pages 1')
			return dataGrid
		})

		const menuItemsOf = (footer: DataGridFooter<Person>) =>
			[...footer.renderRoot.querySelectorAll('mo-menu-item')]

		it('should pre-select the current page-size in the pagination menu', () => {
			const selectedPageSize = fixture.component
				.footerElement.renderRoot.querySelector('mo-menu-item[selected]')
				?.textContent?.toNumber()

			expect(selectedPageSize).toBe(fixture.component.pageSize)
		})

		it('should offer \'Auto\' only where the grid supports a dynamic page size', async () => {
			const staticFooter = await settle(fixture)
			expect(fixture.component.supportsDynamicPageSize).toBeFalse()
			expect(menuItemsOf(staticFooter).map(item => item.textContent?.trim())).not.toContain('Auto')

			const dynamicFooter = await settle(dynamicFixture)
			expect(dynamicFixture.component.supportsDynamicPageSize).toBeTrue()
			expect(menuItemsOf(dynamicFooter).map(item => item.textContent?.trim())).toContain('Auto')
		})

		it('should keep the strategy when applying a picked size, dispatching paginationChange', async () => {
			const footer = await settle(dynamicFixture)
			const paginationChange = spyOn(dynamicFixture.component.paginationChange, 'dispatch')

			menuItemsOf(footer).find(item => item.textContent?.trim() === (50).format())!.click()
			await settle(dynamicFixture)

			expect(dynamicFixture.component.pagination?.strategy).toBe('pages')
			expect(dynamicFixture.component.pagination?.size).toBe(50)
			expect(paginationChange).toHaveBeenCalledTimes(1)
		})

		it('should navigate back into range when the picked size lowers maxPage below the current page', async () => {
			dynamicFixture.component.setPage(3)
			const footer = await settle(dynamicFixture)
			expect(dynamicFixture.component.page).toBe(3)

			menuItemsOf(footer).find(item => item.textContent?.trim() === (10).format())!.click()
			await settle(dynamicFixture)
			await new Promise(r => setTimeout(r, 30))

			expect(dynamicFixture.component.maxPage).toBe(1)
			expect(dynamicFixture.component.page).toBe(1)
		})
	})

	describe('Range info', () => {
		const fixture = new ComponentTestFixture(() => {
			const dataGrid = new DynamicTestDataGrid()
			dataGrid.pagination = DataGridPagination.from('pages 2')
			return dataGrid
		})

		it('should show the rendered range and the total data length', async () => {
			let footer = await settle(fixture)

			expect(footer.renderRoot.querySelector('#range')?.textContent?.trim()).toBe(`${(1).format()}-${(2).format()}`)
			expect(footer.renderRoot.querySelector('#length')?.textContent?.trim()).toBe((3).format())

			fixture.component.setPage(2)
			footer = await settle(fixture)

			expect(footer.renderRoot.querySelector('#range')?.textContent?.trim()).toBe(`${(3).format()}-${(3).format()}`)
			expect(footer.renderRoot.querySelector('#length')?.textContent?.trim()).toBe((3).format())
		})

		it('should show the selected count instead of the range while a selection exists', async () => {
			fixture.component.selectability = DataGridSelectability.Multiple
			await settle(fixture)

			fixture.component.select([testData[0]!, testData[1]!])
			const footer = await settle(fixture)

			expect(footer.renderRoot.querySelector('#selected-length')?.textContent?.trim()).toBe((2).format())
			expect(footer.renderRoot.querySelector('#range')).toBeNull()
		})
	})

	describe('Export', () => {
		const fixture = new ComponentTestFixture(() => new TestDataGrid())

		const exportButtonOf = (footer: DataGridFooter<Person>) =>
			footer.renderRoot.querySelector<HTMLElement>('#csv mo-icon-button')

		it('should render the export button only when the grid is exportable', async () => {
			let footer = await settle(fixture)
			expect(exportButtonOf(footer)).toBeNull()

			fixture.component.exportable = true
			footer = await settle(fixture)

			expect(exportButtonOf(footer)).not.toBeNull()
		})

		it('should start the CSV generation on click and show the progress until it finishes', async () => {
			let resolveDownload!: () => void
			const download = spyOn(DataGridCsvController, 'download')
				.and.callFake(() => new Promise<void>(resolve => resolveDownload = resolve))
			fixture.component.exportable = true
			let footer = await settle(fixture)

			exportButtonOf(footer)!.click()
			footer = await settle(fixture)

			expect(fixture.component.csvController.isGenerating).toBeTrue()
			expect(footer.renderRoot.querySelector('#exporting-text')).not.toBeNull()
			expect(download).toHaveBeenCalledTimes(1)
			expect(download.calls.mostRecent().args[0]).toContain('Name')
			expect(download.calls.mostRecent().args[0]).toContain('John')

			resolveDownload()
			footer = await settle(fixture)

			expect(fixture.component.csvController.isGenerating).toBeFalse()
			expect(fixture.component.csvController.generationProgress).toBeUndefined()
			expect(footer.renderRoot.querySelector('#exporting-text')).toBeNull()
		})
	})
})