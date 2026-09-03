import { html, render } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import '@3mo/localization'
import './index.js'
import { type DataGrid } from './DataGrid.js'

type Person = { id: number, name: string }

const testData: Array<Person> = [
	{ id: 1, name: 'Alice' },
	{ id: 2, name: 'Bob' },
]

describe('DataGridContextMenuController', () => {
	const fixture = new ComponentTestFixture<DataGrid<Person>>(html`
		<mo-data-grid .data=${testData}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
		</mo-data-grid>
	`)

	const container = document.createElement('div')
	afterEach(() => render(html.nothing, container))

	const rowContextMenuTemplate = (data: Array<Person>) => html`
		${data.map(person => html`<mo-context-menu-item>${person.name}</mo-context-menu-item>`)}
	`

	const renderMenuContent = (data: Array<Person>) => {
		render(fixture.component.contextMenuController.getMenuContentTemplate(data), container)
		return container
	}

	it('should have a context menu only when the grid defines a row context menu template', async () => {
		expect(fixture.component.contextMenuController.hasContextMenu).toBeFalse()
		expect(fixture.component.hasContextMenu).toBeFalse()

		fixture.component.getRowContextMenuTemplate = rowContextMenuTemplate
		await fixture.updateComplete

		expect(fixture.component.contextMenuController.hasContextMenu).toBeTrue()
		expect(fixture.component.hasContextMenu).toBeTrue()
	})

	it('should render nothing for empty data, as a menu without a subject is meaningless', () => {
		fixture.component.getRowContextMenuTemplate = rowContextMenuTemplate

		expect(renderMenuContent([]).textContent?.trim()).toBe('')
		expect(renderMenuContent([]).querySelector('mo-context-menu-item')).toBeNull()
	})

	it('should render the template\'s items for a single datum without a count header', () => {
		fixture.component.getRowContextMenuTemplate = rowContextMenuTemplate

		const content = renderMenuContent([testData[0]!])

		expect([...content.querySelectorAll('mo-context-menu-item')].map(item => item.textContent?.trim())).toEqual(['Alice'])
		expect(content.querySelector('mo-line')).toBeNull()
		expect(content.textContent).not.toContain('selected')
	})

	it('should prefix the items with the localized selection count for more than one datum', () => {
		fixture.component.getRowContextMenuTemplate = rowContextMenuTemplate

		const content = renderMenuContent(testData)

		expect([...content.querySelectorAll('mo-context-menu-item')].map(item => item.textContent?.trim())).toEqual(['Alice', 'Bob'])
		expect(content.querySelector('mo-line')).not.toBeNull()
		expect(content.firstElementChild?.textContent).toContain((2).format())
		expect(content.textContent).toContain(`${t('selected')}`)
	})
})