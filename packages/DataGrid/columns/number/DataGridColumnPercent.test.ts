import '../../index.js'
import { html, render } from '@a11d/lit'
import '@3mo/localization'
import { DataGridColumnPercent } from './DataGridColumnPercent.js'

type Item = { id: number, pct: number }

describe('DataGridColumnPercent', () => {
	const container = document.createElement('div')
	const datum: Item = { id: 1, pct: 15.5 }

	afterEach(() => render(html.nothing, container))

	it('should format the value as percent', () => {
		const column = new DataGridColumnPercent<Item>()

		render(column.getContentTemplate(15.5, datum), container)
		const text = container.textContent!

		expect(text).toBe((15.5).formatAsPercent())
		expect(text).not.toBe('15.5')
		expect(text).not.toBe((15.5).format())
	})

	it('should format the value with the format options', () => {
		const column = new DataGridColumnPercent<Item>()
		column.formatOptions = { maximumFractionDigits: 0 }

		render(column.getContentTemplate(15.5, datum), container)
		const text = container.textContent!

		expect(text).toBe((15.5).formatAsPercent({ maximumFractionDigits: 0 }))
		expect(text).not.toBe((15.5).formatAsPercent())
	})

	it('should render nothing for a non-finite value, while still rendering a zero', () => {
		const column = new DataGridColumnPercent<Item>()

		render(column.getContentTemplate(NaN, datum), container)
		expect(container.textContent).toBe('')

		render(column.getContentTemplate(undefined, datum), container)
		expect(container.textContent).toBe('')

		render(column.getContentTemplate(0, datum), container)
		expect(container.textContent).toBe((0).formatAsPercent())
	})

	it('should suffix the CSV heading with (%)', () => {
		const column = new DataGridColumnPercent<Item>()
		column.heading = 'Discount'

		expect([...column.generateCsvHeading()]).toEqual(['Discount (%)'])

		column.description = 'Applied at checkout'

		expect([...column.generateCsvHeading()]).toEqual(['Discount - Applied at checkout (%)'])
	})

	it('should format the footer sum as percent with the format options', () => {
		const column = new DataGridColumnPercent<Item>()
		column.formatOptions = { maximumFractionDigits: 0 }

		render(column.getSumTemplate(42.75), container)
		const text = container.textContent!

		expect(text).toBe((42.75).formatAsPercent({ maximumFractionDigits: 0 }))
		expect(text).not.toBe((42.75).formatAsPercent())
	})

	it('should tunnel min, max and step — own or resolved via data selectors — into the edit field', () => {
		const column = new DataGridColumnPercent<Item>()
		column.min = 0
		column.max = 100
		column.stepDataSelector = 'pct'

		render(column.getEditContentTemplate(15.5, datum), container)
		const field = container.querySelector('mo-field-percent')!

		expect(field.getAttribute('min')).toBe('0')
		expect(field.getAttribute('max')).toBe('100')
		expect(field.getAttribute('step')).toBe('15.5')
		expect(field.getAttribute('value')).toBe('15.5')
	})
})