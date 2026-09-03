import '../index.js'
import { html, render } from '@a11d/lit'
import { DataGridColumnDeletion } from './DataGridColumnDeletion.js'

type Item = { id: number }

describe('DataGridColumnDeletion', () => {
	const container = document.createElement('div')
	const datum: Item = { id: 1 }

	afterEach(() => render(html.nothing, container))

	it('should dispatch delete with the row\'s data on click', () => {
		const column = new DataGridColumnDeletion<Item>()
		const deleted = new Array<Item>()
		column.addEventListener('delete', event => deleted.push((event as CustomEvent<Item>).detail))

		render(column.getContentTemplate(undefined as never, datum), container)
		container.querySelector('mo-icon-button')!.click()

		expect(deleted).toEqual([datum])
		expect(deleted[0]).toBe(datum)
	})

	it('should render nothing while prevented', () => {
		const column = new DataGridColumnDeletion<Item>()

		render(column.getContentTemplate(undefined as never, datum), container)
		expect(container.querySelector('mo-icon-button')).not.toBeNull()

		column.prevent = true

		render(column.getContentTemplate(undefined as never, datum), container)
		expect(container.querySelector('mo-icon-button')).toBeNull()
	})

	it('should use the configured icon', () => {
		const column = new DataGridColumnDeletion<Item>()

		render(column.getContentTemplate(undefined as never, datum), container)
		expect(container.querySelector('mo-icon-button')!.getAttribute('icon')).toBe('delete')

		column.icon = 'delete_forever'

		render(column.getContentTemplate(undefined as never, datum), container)
		expect(container.querySelector('mo-icon-button')!.getAttribute('icon')).toBe('delete_forever')
	})
})