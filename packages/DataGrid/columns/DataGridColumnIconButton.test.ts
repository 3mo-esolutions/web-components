import '../index.js'
import { html, render } from '@a11d/lit'
import { DataGridColumnIconButton } from './DataGridColumnIconButton.js'

type Item = { id: number, locked: boolean }

describe('DataGridColumnIconButton', () => {
	const container = document.createElement('div')
	const datum: Item = { id: 1, locked: false }
	const lockedDatum: Item = { id: 2, locked: true }

	afterEach(() => render(html.nothing, container))

	const clickedData = (column: DataGridColumnIconButton<Item>) => {
		const clicked = new Array<Item>()
		column.addEventListener('iconClick', event => clicked.push((event as CustomEvent<Item>).detail))
		return clicked
	}

	it('should dispatch iconClick with the row\'s data on click', () => {
		const column = new DataGridColumnIconButton<Item>()
		column.icon = 'edit'
		const clicked = clickedData(column)

		render(column.getContentTemplate(undefined, datum), container)
		container.querySelector('mo-icon-button')!.click()

		expect(clicked).toEqual([datum])
		expect(clicked[0]).toBe(datum)
	})

	it('should disable the button of the rows it is disabled for and not dispatch for them', () => {
		const column = new DataGridColumnIconButton<Item>()
		column.icon = 'edit'
		column.disabled = item => item.locked
		const clicked = clickedData(column)

		render(column.getContentTemplate(undefined, lockedDatum), container)
		const button = container.querySelector('mo-icon-button')!
		button.click()

		expect(button.disabled).toBe(true)
		expect(clicked).toEqual([])
	})

	it('should use the configured icon', () => {
		const column = new DataGridColumnIconButton<Item>()
		column.icon = 'edit'

		render(column.getContentTemplate(undefined, datum), container)

		expect(container.querySelector('mo-icon-button')!.getAttribute('icon')).toBe('edit')
	})

	it('should stay clickable while the row is edited', () => {
		const column = new DataGridColumnIconButton<Item>()
		column.icon = 'edit'
		const clicked = clickedData(column)

		render(column.getEditContentTemplate!(undefined, datum), container)
		container.querySelector('mo-icon-button')!.click()

		expect(clicked).toEqual([datum])
	})
})
