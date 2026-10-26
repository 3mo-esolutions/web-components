import '../index.js'
import { html, render } from '@a11d/lit'
import { DataGridColumnBoolean } from './DataGridColumnBoolean.js'

type Item = { id: number, done: boolean }

describe('DataGridColumnBoolean', () => {
	const container = document.createElement('div')
	const datum: Item = { id: 1, done: true }

	afterEach(() => render(html.nothing, container))

	const dot = () => container.querySelector<HTMLElement>('span')

	it('should center its content', () => {
		expect(new DataGridColumnBoolean<Item>().textAlign).toBe('center')
	})

	for (const [value, color, title] of [[true, 'var(--mo-color-green)', 'Yes'], [false, 'var(--mo-color-red)', 'No']] as const) {
		it(`should render ${value} as a dot in its color, named after it`, () => {
			render(new DataGridColumnBoolean<Item>().getContentTemplate(value, datum), container)

			expect(dot()!.style.background).toBe(color)
			expect(dot()!.title).toBe(title)
		})
	}

	it('should color the dot as configured', () => {
		const column = new DataGridColumnBoolean<Item>()
		column.trueColor = 'var(--test-true-color)'
		column.falseColor = 'var(--test-false-color)'

		render(column.getContentTemplate(true, datum), container)
		expect(dot()!.style.background).toBe('var(--test-true-color)')

		render(column.getContentTemplate(false, datum), container)
		expect(dot()!.style.background).toBe('var(--test-false-color)')
	})

	it('should render nothing for undefined', () => {
		render(new DataGridColumnBoolean<Item>().getContentTemplate(undefined, datum), container)

		expect(container.textContent!.trim()).toBe('')
		expect(dot()).toBeNull()
	})

	it('should export 1/0 in CSV', () => {
		const column = new DataGridColumnBoolean<Item>()

		expect([...column.generateCsvValue(true)]).toEqual(['1'])
		expect([...column.generateCsvValue(false)]).toEqual(['0'])
	})

	it('should apply a checkbox edit through the grid', () => {
		const column = new DataGridColumnBoolean<Item>()
		const handleEdit = vi.fn()
		column.dataGrid = { handleEdit } as any

		render(column.getEditContentTemplate(false, datum), container)
		container.querySelector('mo-checkbox')!.dispatchEvent(new CustomEvent('change', { detail: true }))

		expect(handleEdit).toHaveBeenCalledTimes(1)
		const [data, , value] = handleEdit.mock.lastCall!
		expect(data).toBe(datum)
		expect(value).toBe(true)
	})
})
