import '../index.js'
import { html, render } from '@a11d/lit'
import { DataGridColumnBoolean } from './DataGridColumnBoolean.js'

type Item = { id: number, done: boolean }

describe('DataGridColumnBoolean', () => {
	const container = document.createElement('div')
	const datum: Item = { id: 1, done: true }

	afterEach(() => render(html.nothing, container))

	const makeColumn = () => {
		const column = new DataGridColumnBoolean<Item>()
		column.trueIcon = 'star'
		column.falseIcon = 'block'
		column.trueIconColor = 'var(--test-true-color)'
		column.falseIconColor = 'var(--test-false-color)'
		return column
	}

	for (const value of [true, false]) {
		it(`should render the configured ${value} icon with its color`, () => {
			const column = makeColumn()

			render(column.getContentTemplate(value, datum), container)
			const icon = container.querySelector('mo-icon')!

			expect(icon.getAttribute('icon')).toBe(value ? 'star' : 'block')
			expect(icon.style.color).toBe(value ? 'var(--test-true-color)' : 'var(--test-false-color)')
		})
	}

	it('should export TRUE/FALSE in CSV', () => {
		const column = new DataGridColumnBoolean<Item>()

		expect([...column.generateCsvValue(true)]).toEqual(['TRUE'])
		expect([...column.generateCsvValue(false)]).toEqual(['FALSE'])
	})

	it('should apply a checkbox edit through the grid', () => {
		const column = new DataGridColumnBoolean<Item>()
		const handleEdit = jasmine.createSpy('handleEdit')
		column.dataGrid = { handleEdit } as any

		render(column.getEditContentTemplate(false, datum), container)
		container.querySelector('mo-checkbox')!.dispatchEvent(new CustomEvent('change', { detail: true }))

		expect(handleEdit).toHaveBeenCalledTimes(1)
		const [data, , value] = handleEdit.calls.mostRecent().args
		expect(data).toBe(datum)
		expect(value).toBeTrue()
	})
})