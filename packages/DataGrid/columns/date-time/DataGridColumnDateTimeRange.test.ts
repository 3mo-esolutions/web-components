import '../../index.js'
import { html, render } from '@a11d/lit'
import '@3mo/localization'
import { DateTimeRange } from '@3mo/date-time'
import { FieldDateTimePrecision } from '@3mo/date-time-fields'
import { DataGridColumnDateTimeRange } from './DataGridColumnDateTimeRange.js'

type Item = { id: number, range: DateTimeRange }

describe('DataGridColumnDateTimeRange', () => {
	const container = document.createElement('div')
	const range = new DateTimeRange(new Date('2023-01-15T10:00:00.000Z'), new Date('2023-01-15T12:00:00.000Z'))
	const datum: Item = { id: 1, range }

	afterEach(() => render(html.nothing, container))

	it('should format the range with time', () => {
		const column = new DataGridColumnDateTimeRange<Item>()

		expect(column.precision).toBe(FieldDateTimePrecision.Minute)

		render(column.getContentTemplate(range, datum), container)

		expect(container.textContent).toBe(range.format())
		expect(container.textContent).not.toBe(range.formatAsDateRange())
	})

	it('should render an empty cell for an absent range', () => {
		const column = new DataGridColumnDateTimeRange<Item>()

		render(column.getContentTemplate(undefined, datum), container)

		expect(container.textContent).toBe('')
	})

	it('should edit through a mo-field-date-time-range', () => {
		const column = new DataGridColumnDateTimeRange<Item>()

		render(column.getEditContentTemplate(range, datum), container)
		const field = container.querySelector('mo-field-date-time-range')!

		expect(field.value).toBe(range)
		expect(field.precision).toBe(FieldDateTimePrecision.Minute)
	})
})