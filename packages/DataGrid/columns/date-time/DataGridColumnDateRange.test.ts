import '../../index.js'
import { html, render } from '@a11d/lit'
import '@3mo/localization'
import { DateTimeRange } from '@3mo/date-time'
import { FieldDateTimePrecision } from '@3mo/date-time-fields'
import { DataGridColumnDateRange } from './DataGridColumnDateRange.js'

type Item = { id: number, range: DateTimeRange }

describe('DataGridColumnDateRange', () => {
	const container = document.createElement('div')
	const range = new DateTimeRange(new Date('2023-01-15T12:00:00.000Z'), new Date('2023-01-20T12:00:00.000Z'))
	const datum: Item = { id: 1, range }

	afterEach(() => render(html.nothing, container))

	it('should format the range as dates', () => {
		const column = new DataGridColumnDateRange<Item>()

		expect(column.precision).toBe(FieldDateTimePrecision.Day)

		render(column.getContentTemplate(range, datum), container)

		expect(container.textContent).toBe(range.formatAsDateRange())
		expect(container.textContent).not.toBe(range.format())
	})

	it('should render an empty cell for an absent range', () => {
		const column = new DataGridColumnDateRange<Item>()

		render(column.getContentTemplate(undefined, datum), container)

		expect(container.textContent).toBe('')
	})

	it('should edit through a mo-field-date-range', () => {
		const column = new DataGridColumnDateRange<Item>()

		render(column.getEditContentTemplate(range, datum), container)
		const field = container.querySelector('mo-field-date-range')!

		expect(field.value).toBe(range)
		expect(field.precision).toBe(FieldDateTimePrecision.Day)
	})
})