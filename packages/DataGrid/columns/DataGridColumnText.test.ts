import '../index.js'
import { html, render } from '@a11d/lit'
import { DataGridColumnText } from './DataGridColumnText.js'

type Item = { id: number, name: string }

describe('DataGridColumnText', () => {
	const container = document.createElement('div')
	const datum: Item = { id: 1, name: 'Alice' }

	afterEach(() => render(html.nothing, container))

	it('should render an empty cell for null-ish values instead of "undefined"', () => {
		const column = new DataGridColumnText<Item>()

		render(column.getContentTemplate('Alice', datum), container)
		expect(container.textContent).toBe('Alice')

		render(column.getContentTemplate(undefined, datum), container)
		expect(container.textContent).toBe('')
	})

	it('should edit through a text field which applies on change', () => {
		const column = new DataGridColumnText<Item>()
		const handleEdit = jasmine.createSpy('handleEdit')
		column.dataGrid = { handleEdit } as any

		render(column.getEditContentTemplate('Alice', datum), container)
		const field = container.querySelector('mo-field-text')!

		expect(field.getAttribute('value')).toBe('Alice')

		field.dispatchEvent(new CustomEvent('change', { detail: 'Bob' }))

		expect(handleEdit).toHaveBeenCalledTimes(1)
		const [data, , value] = handleEdit.calls.mostRecent().args
		expect(data).toBe(datum)
		expect(value).toBe('Bob')
	})
})