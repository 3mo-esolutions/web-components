import '../../index.js'
import { html, render } from '@a11d/lit'
import '@3mo/localization'
import { DataGridColumnNumber } from './DataGridColumnNumber.js'

type Item = { id: number, val: number, limit?: number }

describe('DataGridColumnNumber', () => {
	const container = document.createElement('div')

	const renderTemplate = (template: ReturnType<typeof html>) => {
		render(template, container)
		return container
	}

	afterEach(() => render(html.nothing, container))

	it('should format the value with the format options', () => {
		const column = new DataGridColumnNumber<Item>()
		column.formatOptions = { minimumFractionDigits: 2 }

		const text = renderTemplate(column.getContentTemplate(42, { id: 1, val: 42 })).textContent!

		expect(text).toBe((42).format({ minimumFractionDigits: 2 }))
		expect(text).not.toBe('42')
	})

	it('should render nothing for non-finite values', () => {
		const column = new DataGridColumnNumber<Item>()

		expect(renderTemplate(column.getContentTemplate(NaN, { id: 1, val: NaN })).textContent).toBe('')
		expect(renderTemplate(column.getContentTemplate(Infinity, { id: 1, val: Infinity })).textContent).toBe('')
		expect(renderTemplate(column.getContentTemplate(undefined, { id: 1, val: 0 })).textContent).toBe('')
	})

	it('should render a zero, as only non-finite values are absent', () => {
		const column = new DataGridColumnNumber<Item>()

		expect(renderTemplate(column.getContentTemplate(0, { id: 1, val: 0 })).textContent).toBe((0).format())
	})

	it('should render the footer sum with the same format options', () => {
		const column = new DataGridColumnNumber<Item>()
		column.formatOptions = { minimumFractionDigits: 2 }

		const text = renderTemplate(column.getSumTemplate(100)).textContent!

		expect(text).toBe((100).format({ minimumFractionDigits: 2 }))
		expect(text).not.toBe('100')
	})

	it('should align its content to the end by default, as numbers are read by their last digit', () => {
		expect(new DataGridColumnNumber<Item>().textAlign).toBe('end')
	})

	it('should tunnel min, max and step into the edit field', () => {
		const column = new DataGridColumnNumber<Item>()
		column.min = 0
		column.max = 100
		column.step = 5

		const field = renderTemplate(column.getEditContentTemplate(50, { id: 1, val: 50 })).querySelector('mo-field-number')!

		expect(field.getAttribute('min')).toBe('0')
		expect(field.getAttribute('max')).toBe('100')
		expect(field.getAttribute('step')).toBe('5')
		expect(field.getAttribute('value')).toBe('50')
	})

	it('should take the bounds of the edit field from the data where a data selector is given', () => {
		const column = new DataGridColumnNumber<Item>()
		column.maxDataSelector = 'limit'

		const field = renderTemplate(column.getEditContentTemplate(5, { id: 1, val: 5, limit: 20 })).querySelector('mo-field-number')!

		expect(field.getAttribute('max')).toBe('20')
	})

	it('should leave the bounds of the edit field unset where neither a value nor a data selector provides one', () => {
		const column = new DataGridColumnNumber<Item>()

		const field = renderTemplate(column.getEditContentTemplate(5, { id: 1, val: 5 })).querySelector('mo-field-number')!

		expect(field.hasAttribute('min')).toBe(false)
		expect(field.hasAttribute('max')).toBe(false)
		expect(field.hasAttribute('step')).toBe(false)
	})
})