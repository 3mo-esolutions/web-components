import { DateTime } from './DateTime.js'
import { expectDateTimesEquals } from './expectDateTimesEquals.test.js'
import './index.js'

describe('DateTime', () => {
	it('should not cache calendar and time-zone when language changes', () => {
		let lang: any
		spyOnProperty(Localizer.languages, 'current').and.callFake(() => lang)

		lang = 'de'
		Localizer.languages.change.dispatch(lang)
		expect(DateTime.getCalendar()).toBe('gregory')

		lang = 'fa'
		Localizer.languages.change.dispatch(lang)
		expect(DateTime.getCalendar()).toBe('persian')
	})

	it('from() should construct a DateTime from an epoch nanoseconds number', () => {
		const epochMilliseconds = 1609459200000
		const dateTime = DateTime.from(epochMilliseconds)
		expect(dateTime.temporalInstant.epochMilliseconds).toBe(epochMilliseconds)
	})

	it('equals() should return true only for the same date', () => {
		const dateTime = new DateTime('2020-01-01T00:00:00')
		expect(dateTime.equals(new DateTime('2020-01-01T00:00:00'))).toBeTrue()
		expect(dateTime.equals(new DateTime('2020-01-01T01:00:00.001'))).toBeFalse()
		expect(dateTime.equals(new DateTime('2020-01-02'))).toBeFalse()
	})

	it('isBefore() should return true only for a date before the current date', () => {
		const dateTime = new DateTime('2020-01-01')
		expect(dateTime.isBefore(new DateTime('2019-12-31'))).toBeFalse()
		expect(dateTime.isBefore(new DateTime('2020-01-01'))).toBeFalse()
		expect(dateTime.isBefore(new DateTime('2020-01-02'))).toBeTrue()
	})

	it('isAfter() should return true only for a date after the current date', () => {
		const dateTime = new DateTime('2020-01-01')
		expect(dateTime.isAfter(new DateTime('2019-12-31'))).toBeTrue()
		expect(dateTime.isAfter(new DateTime('2020-01-01'))).toBeFalse()
		expect(dateTime.isAfter(new DateTime('2020-01-02'))).toBeFalse()
	})

	it('since() should return a TimeSpan representing the time since the given date', () => {
		const dateTime = new DateTime('2020-01-01')
		expect(dateTime.since(new DateTime('2019-12-31')).days).toBe(1)
		expect(dateTime.since(new DateTime('2020-01-01')).days).toBe(0)
		expect(dateTime.since(new DateTime('2020-01-02')).days).toBe(-1)
	})

	it('until() should return a TimeSpan representing the time until the given date', () => {
		const dateTime = new DateTime('2020-01-01')
		expect(dateTime.until(new DateTime('2019-12-31')).days).toBe(-1)
		expect(dateTime.until(new DateTime('2020-01-01')).days).toBe(0)
		expect(dateTime.until(new DateTime('2020-01-02')).days).toBe(1)
	})

	it('add() should return a DateTime with the given amount added', () => {
		const dateTime = new DateTime('2020-01-01')
		expect(dateTime.add({ days: 1 }).equals(new DateTime('2020-01-02'))).toBeTrue()
		expect(dateTime.add({ days: -1 }).equals(new DateTime('2019-12-31'))).toBeTrue()
	})

	it('subtract() should return a DateTime with the given amount subtracted', () => {
		const dateTime = new DateTime('2020-01-01')
		expect(dateTime.subtract({ days: 1 }).equals(new DateTime('2019-12-31'))).toBeTrue()
		expect(dateTime.subtract({ days: -1 }).equals(new DateTime('2020-01-02'))).toBeTrue()
	})

	it('round() should return a DateTime rounded to the given precision', () => {
		const dateTime = new DateTime('2020-01-01T12:30:30.500')
		expect(dateTime.round('second').equals(new DateTime('2020-01-01T12:30:31'))).toBeTrue()
		expect(dateTime.round('minute').equals(new DateTime('2020-01-01T12:31'))).toBeTrue()
	})

	it('day should return the day of the month', () => {
		const dateTime = new DateTime('2020-01-01')
		expect(dateTime.day).toBe(1)
	})

	it('month should return the month of the year', () => {
		const dateTime = new DateTime('2020-01-01')
		expect(dateTime.month).toBe(1)
	})

	it('year should return the year', () => {
		const dateTime = new DateTime('2020-01-01')
		expect(dateTime.year).toBe(2020)
	})

	it('getDateSeparator() should return the date separator of given language', () => {
		expect(DateTime.getDateSeparator('en')).toBe('/')
		expect(DateTime.getDateSeparator('de')).toBe('.')
	})

	it('getTimeSeparator() should return the time separator of given language', () => {
		expect(DateTime.getTimeSeparator('en')).toBe(':')
		expect(DateTime.getTimeSeparator('de')).toBe(':')
	})

	it('Zero parser is in place', () => {
		expectDateTimesEquals(DateTime.parseAsDateTime('0'), new DateTime())
		expectDateTimesEquals('0'.toDateTime(), new DateTime())
	})

	it('Operation parser is in place', () => {
		expectDateTimesEquals(DateTime.parseAsDateTime('+1'), new DateTime().add({ days: 1 }))
		expectDateTimesEquals('+1'.toDateTime(), new DateTime().add({ days: 1 }))
	})

	it('Local parser is in place', () => {
		expectDateTimesEquals(DateTime.parseAsDateTime('10.9', 'de'), new DateTime().with({ day: 10, month: 9 }))
		expectDateTimesEquals('10.9'.toDateTime('de'), new DateTime().with({ day: 10, month: 9 }))
	})

	it('Day and month shortcut parser is in place', () => {
		expectDateTimesEquals(DateTime.parseAsDateTime('109', 'de'), new DateTime().with({ day: 10, month: 9 }))
		expectDateTimesEquals('109'.toDateTime('de'), new DateTime().with({ day: 10, month: 9 }))

		expectDateTimesEquals(DateTime.parseAsDateTime('204', 'de'), new DateTime().with({ day: 20, month: 4 }))
		expectDateTimesEquals('204'.toDateTime('de'), new DateTime().with({ day: 20, month: 4 }))

		expectDateTimesEquals(DateTime.parseAsDateTime('2', 'de'), new DateTime().with({ day: 2 }))
		expectDateTimesEquals('2'.toDateTime('de'), new DateTime().with({ day: 2 }))
	})

	it('Native parser is in place', () => {
		expectDateTimesEquals(DateTime.parseAsDateTime('2023-09-01', 'de'), new DateTime('2023-09-01'))
		expectDateTimesEquals('2023-09-01'.toDateTime('de'), new DateTime('2023-09-01'))
	})
})