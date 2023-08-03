import { LanguageCode } from '@3mo/localization'
import { DateTimeRange } from './DateTimeRange.js'
import { DateTime } from './DateTime.js'

describe('DateRange', () => {
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

	it('.equals() should return true for the same range', () => {
		const start = new DateTime('2020-01-02')
		const end = new DateTime('2020-01-04')
		const range = new DateTimeRange(start, end)
		expect(range.equals(new DateTimeRange(start, end))).toBeTrue()
	})

	it('.equals() should return false for a different range', () => {
		const start = new DateTime('2020-01-02')
		const end = new DateTime('2020-01-04')
		const range = new DateTimeRange(start, end)
		expect(range.equals(new DateTimeRange(start, new DateTime('2020-01-04 00:00:01')))).toBeFalse()
	})

	it('.format() should return an empty string for an infinite range', () => {
		const range = new DateTimeRange()
		expect(range.format()).toBe('')
	})

	it('.format() should return a formatted start date for a range with only a start date', () => {
		const start = new DateTime('2020-01-02')
		const range = new DateTimeRange(start)
		expect(range.format({ language: LanguageCode.German }).replace(/\s/g, '')).toBe('02.01.2020–')
		expect(range.format({ language: LanguageCode.Farsi })).toBe('۲۰۲۰/۰۱/۰۲ تا')
	})

	it('.format() should return a formatted end date for a range with only an end date', () => {
		const end = new DateTime('2020-01-02')
		const range = new DateTimeRange(undefined, end)
		expect(range.format({ language: LanguageCode.German }).replace(/\s/g, '')).toBe('–02.01.2020')
		expect(range.format({ language: LanguageCode.Farsi })).toBe('تا ۲۰۲۰/۰۱/۰۲')
	})

	it('.format() should return a formatted start and end date for a range with both dates', () => {
		const start = new DateTime('2010-01-02')
		const end = new DateTime('2020-01-04')
		const range = new DateTimeRange(start, end)
		expect(range.format({ language: LanguageCode.German }).replace(/\s/g, '')).toBe('02.01.2010–04.01.2020')
		expect(range.format({ language: LanguageCode.Farsi })).toBe('۲۰۱۰/۱/۲ تا ۲۰۲۰/۱/۴')
	})
})