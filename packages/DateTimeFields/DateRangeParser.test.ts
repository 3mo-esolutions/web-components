import '@3mo/date-time'
import { DateRangeParser } from './DateRangeParser.js'

describe('DateRangeParser', () => {
	const referenceDate = DateTime.from(Date.parse('2020-06-15T00:00:00.000Z'), 'gregory', 'UTC')
	const instant = (isoDate: string) => Date.parse(`${isoDate}T00:00:00.000Z`)

	describe('parse', () => {
		for (const separator of [' – ', ' ', '-', '~']) {
			it(`should split start and end on the "${separator}" separator`, () => {
				const range = DateRangeParser.parse(`10${separator}20`, referenceDate)

				expect(range.start?.valueOf()).toBe(instant('2020-06-10'))
				expect(range.end?.valueOf()).toBe(instant('2020-06-20'))
			})
		}

		it('should parse a single date as a start-only range', () => {
			const range = DateRangeParser.parse('10', referenceDate)

			expect(range.start?.valueOf()).toBe(instant('2020-06-10'))
			expect(range.end).toBeUndefined()
		})

		const rangeByKeyword: ReadonlyArray<readonly [keyword: string, start: string, end: string]> = [
			['w', '2020-06-15', '2020-06-21'],
			['dw', '2020-06-15', '2020-06-21'],
			['nw', '2020-06-22', '2020-06-28'],
			['lw', '2020-06-08', '2020-06-14'],
			['m', '2020-06-01', '2020-06-30'],
			['dm', '2020-06-01', '2020-06-30'],
			['lm', '2020-05-01', '2020-05-31'],
			['nm', '2020-07-01', '2020-07-31'],
			['j', '2020-01-01', '2020-12-31'],
			['dj', '2020-01-01', '2020-12-31'],
			['lj', '2019-01-01', '2019-12-31'],
			['nj', '2021-01-01', '2021-12-31'],
		]

		for (const [keyword, start, end] of rangeByKeyword) {
			it(`should resolve the "${keyword}" keyword shortcut relative to the reference date`, () => {
				const range = DateRangeParser.parse(keyword, referenceDate)

				expect(range.start?.valueOf()).toBe(instant(start))
				expect(range.end?.valueOf()).toBe(instant(end))
			})
		}
	})
})