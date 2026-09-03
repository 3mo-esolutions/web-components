import '../../index.js'
import { html, render } from '@a11d/lit'
import '@3mo/localization'
import { FieldDateTimePrecision } from '@3mo/date-time-fields'
import { DataGridColumnDateTime } from './DataGridColumnDateTime.js'

type Item = { id: number, dateTime: Date }

const dateTime = new Date('2023-01-15T12:34:56.000Z')

describe('DataGridColumnDateTime', () => {
	const container = document.createElement('div')
	const datum: Item = { id: 1, dateTime }

	afterEach(() => render(html.nothing, container))

	it('should format with Minute precision by default, preferring explicit formatOptions over the precision', () => {
		const column = new DataGridColumnDateTime<Item>()

		expect(column.precision).toBe(FieldDateTimePrecision.Minute)

		render(column.getContentTemplate(dateTime, datum), container)

		expect(container.textContent).toBe(dateTime.format())
		expect(container.textContent).not.toBe(dateTime.formatAsDate())

		column.formatOptions = { year: 'numeric' }

		render(column.getContentTemplate(dateTime, datum), container)

		expect(container.textContent).toBe(dateTime.format({ year: 'numeric' }))
		expect(container.textContent).not.toBe(dateTime.format())
	})

	it('should format with the precision\'s options where the precision is not the default', () => {
		const column = new DataGridColumnDateTime<Item>()
		column.precision = FieldDateTimePrecision.Year

		render(column.getContentTemplate(dateTime, datum), container)

		expect(container.textContent).toBe(dateTime.format(FieldDateTimePrecision.Year.formatOptions))
		expect(container.textContent).not.toBe(dateTime.format())
	})

	it('should render an empty cell for an absent value', () => {
		const column = new DataGridColumnDateTime<Item>()

		render(column.getContentTemplate(undefined, datum), container)

		expect(container.textContent).toBe('')
	})

	it('should export the full ISO timestamp in CSV', () => {
		const column = new DataGridColumnDateTime<Item>()

		expect([...column.generateCsvValue(dateTime)]).toEqual(['2023-01-15T12:34:56.000Z'])
		expect([...column.generateCsvValue(undefined)]).toEqual([''])
	})

	it('should edit through a mo-field-date-time carrying the value and precision', () => {
		const column = new DataGridColumnDateTime<Item>()
		column.precision = FieldDateTimePrecision.Second

		render(column.getEditContentTemplate(dateTime, datum), container)
		const field = container.querySelector('mo-field-date-time')!

		expect(field.value?.getTime()).toBe(dateTime.getTime())
		expect(field.precision).toBe(FieldDateTimePrecision.Second)
	})
})