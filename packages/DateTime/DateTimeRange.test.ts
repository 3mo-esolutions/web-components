import { DateTimeRange } from './DateTimeRange.js'
import { DateTime } from './DateTime.js'

describe('DateTimeRange', () => {
	describe('static parse()', () => {
		it('should parse a date range with multiple delimiters', () => {
			const expected = new DateTimeRange(new DateTime('2020-01-01'), new DateTime('2021-09-02'))
			const validInputs = [
				['2020-01-01 – 2021-09-02'],
				['2020-01-01–2021-09-02'],
				['2020-01-01 ~ 2021-09-02'],
				['2020-01-01~2021-09-02'],
				['2020-01-01T00:00:00.000Z ~ 2021-09-02T00:00:00.000Z'],
				// eslint-disable-next-line no-irregular-whitespace
				// ['Jan 1, 2020, 1:00:00 AM – Sep 2, 2021, 2:00:00 AM']
			] as const

			for (const input of validInputs) {
				expect(DateTimeRange.parse(...input)).toEqual(expected)
			}
		})
	})

	describe('constructor', () => {
		it('should construct without any dates', () => {
			const range = new DateTimeRange()
			expect(range.start).toBeUndefined()
			expect(range.end).toBeUndefined()
			expect(range.isInfinite).toBeTrue()
		})

		it('should construct with a start date', () => {
			const start = new DateTime()
			const range = new DateTimeRange(start)
			expect(range.start).toEqual(start)
			expect(range.end).toBeUndefined()
			expect(range.isInfinite).toBeFalse()
		})

		it('should construct with an end date', () => {
			const end = new DateTime()
			const range = new DateTimeRange(undefined, end)
			expect(range.start).toBeUndefined()
			expect(range.end).toEqual(end)
			expect(range.isInfinite).toBeFalse()
		})

		it('should construct with a start and end date', () => {
			const start = new DateTime('2020-01-01')
			const end = new DateTime('2020-01-02')
			const range = new DateTimeRange(start, end)
			expect(range.start).toEqual(start)
			expect(range.end).toEqual(end)
		})

		it('should construct with a start and end date in reverse order', () => {
			const start = new DateTime('2020-01-01')
			const end = new DateTime('2020-01-02')
			const range = new DateTimeRange(end, start)
			expect(range.start).toEqual(start)
			expect(range.end).toEqual(end)
		})
	})

	it('.includes() should return true for a date within the range', () => {
		const start = new DateTime('2020-01-02')
		const end = new DateTime('2020-01-04')
		const range = new DateTimeRange(start, end)
		expect(range.includes(new DateTime('2020-01-01'))).toBeFalse()
		expect(range.includes(new DateTime('2020-01-02'))).toBeTrue()
		expect(range.includes(new DateTime('2020-01-03'))).toBeTrue()
		expect(range.includes(new DateTime('2020-01-04'))).toBeTrue()
		expect(range.includes(new DateTime('2020-01-05'))).toBeFalse()
	})

	describe('equals()', () => {
		const start = new DateTime('2020-01-02')
		const end = new DateTime('2020-01-04')

		it('should return true for the same range', () => {
			expect(new DateTimeRange(start, end).equals(new DateTimeRange(start, end))).toBeTrue()
			expect(new DateTimeRange(start, undefined).equals(new DateTimeRange(start, undefined))).toBeTrue()
			expect(new DateTimeRange(undefined, end).equals(new DateTimeRange(undefined, end))).toBeTrue()
		})

		it('should return false for a different range', () => {
			expect(new DateTimeRange(start, end).equals(new DateTimeRange(start, end.add({ seconds: 1 })))).toBeFalse()
			expect(new DateTimeRange(start, undefined).equals(new DateTimeRange(start.add({ seconds: 1 }), undefined))).toBeFalse()
			expect(new DateTimeRange(undefined, end).equals(new DateTimeRange(undefined, end.add({ seconds: 1 })))).toBeFalse()
		})
	})

	describe('formatAsDateRange()', () => {
		it('should return an empty string for an infinite range', () => {
			const range = new DateTimeRange()
			expect(range.formatAsDateRange()).toBe('')
		})

		it('should return a formatted start date for a range with only a start date', () => {
			const start = new DateTime('2020-01-02')
			const range = new DateTimeRange(start)
			expect(range.formatAsDateRange({ language: 'de' }).replace(/\s/g, '')).toBe('02.01.2020–')
			expect(range.formatAsDateRange({ language: 'fa' }).replace(/\s/g, '')).toBe('۲ژانویه۲۰۲۰تا')
		})

		it('should return a formatted end date for a range with only an end date', () => {
			const end = new DateTime('2020-01-02')
			const range = new DateTimeRange(undefined, end)
			expect(range.formatAsDateRange({ language: 'de' }).replace(/\s/g, '')).toBe('–02.01.2020')
			expect(range.formatAsDateRange({ language: 'fa' }).replace(/\s/g, '')).toBe('تا۲ژانویه۲۰۲۰')
		})

		it('should return a formatted start and end date for a range with both dates', () => {
			const start = new DateTime('2010-01-02')
			const end = new DateTime('2020-01-04')
			const range = new DateTimeRange(start, end)
			expect(range.formatAsDateRange({ language: 'de' }).replace(/\s/g, '')).toBe('02.01.2010–04.01.2020')
			expect(range.formatAsDateRange({ language: 'fa' }).replace(/\s/g, '')).toBe('۲ژانویه۲۰۱۰تا۴ژانویه۲۰۲۰')
		})
	})

	it('.format() should return a formatted start and end date with time for a range with both dates', () => {
		const start = new DateTime('2010-01-02 12:00:00')
		const end = new DateTime('2020-01-04 16:00:00')
		const range = new DateTimeRange(start, end)
		expect(range.format({ language: 'de' }).replace(/\s/g, '')).toBe('02.01.2010,12:00:00–04.01.2020,16:00:00')
		expect(range.format({ language: 'fa' }).replace(/\s/g, '')).toBe('۲ژانویه۲۰۱۰،۱۲:۰۰:۰۰تا۴ژانویه۲۰۲۰،۱۶:۰۰:۰۰')
	})

	describe('toJSON()', () => {
		it('should return an empty string for an infinite range', () => {
			const range = new DateTimeRange()
			expect(range.toJSON()).toBe(undefined)
		})

		it('should return a formatted start date for a range with only a start date', () => {
			const start = new DateTime('2020-01-02')
			const range = new DateTimeRange(start)
			expect(range.toJSON()).toBe('2020-01-02T00:00:00.000Z~')
		})

		it('should return a formatted end date for a range with only an end date', () => {
			const end = new DateTime('2020-01-02')
			const range = new DateTimeRange(undefined, end)
			expect(range.toJSON()).toBe('~2020-01-02T00:00:00.000Z')
		})

		it('should return a formatted start and end date for a range with both dates', () => {
			const start = new DateTime('2010-01-02')
			const end = new DateTime('2020-01-04')
			const range = new DateTimeRange(start, end)
			expect(range.toJSON()).toBe('2010-01-02T00:00:00.000Z~2020-01-04T00:00:00.000Z')
		})
	})
})