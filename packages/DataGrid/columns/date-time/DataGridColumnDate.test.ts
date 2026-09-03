import '../../index.js'
import { html, render } from '@a11d/lit'
import '@3mo/localization'
import { FieldDateTimePrecision } from '@3mo/date-time-fields'
import { DataGridColumnDate } from './DataGridColumnDate.js'

type Item = { id: number, date: Date }

const date = new Date('2023-01-15T12:00:00.000Z')

describe('DataGridColumnDate', () => {
	const container = document.createElement('div')
	const datum: Item = { id: 1, date }

	afterEach(() => render(html.nothing, container))

	it('should format the value as a date with Day precision by default', () => {
		const column = new DataGridColumnDate<Item>()

		expect(column.precision).toBe(FieldDateTimePrecision.Day)

		render(column.getContentTemplate(date, datum), container)

		expect(container.textContent).toBe(date.formatAsDate())
		expect(container.textContent).not.toBe(date.format())
	})

	it('should render an empty cell for an absent value', () => {
		const column = new DataGridColumnDate<Item>()

		render(column.getContentTemplate(undefined, datum), container)

		expect(container.textContent).toBe('')
	})

	it('should export the ISO date without a time part in CSV', () => {
		const column = new DataGridColumnDate<Item>()

		expect([...column.generateCsvValue(date)]).toEqual(['2023-01-15'])
		expect([...column.generateCsvValue(undefined)]).toEqual([''])
	})

	it('should edit through a mo-field-date carrying value, precision and pickerHidden', () => {
		const column = new DataGridColumnDate<Item>()
		column.precision = FieldDateTimePrecision.Month
		column.pickerHidden = true

		render(column.getEditContentTemplate(date, datum), container)
		const field = container.querySelector('mo-field-date')!

		expect(field.value?.getTime()).toBe(date.getTime())
		expect(field.precision).toBe(FieldDateTimePrecision.Month)
		expect(field.pickerHidden).toBeTrue()
	})

	it('should leave the picker of the edit field visible by default', () => {
		const column = new DataGridColumnDate<Item>()

		render(column.getEditContentTemplate(date, datum), container)

		expect(container.querySelector('mo-field-date')!.pickerHidden).toBeFalse()
	})
})