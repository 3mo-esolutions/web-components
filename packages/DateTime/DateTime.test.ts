import { type LanguageCode, Localizer } from '@3mo/localization'
import { DateTime } from './DateTime.js'
import { DateTimeParser } from './parsers/index.js'
import { expectDateTimesEquals } from './expectDateTimesEquals.test.js'
import './index.js'

class SentinelParser extends DateTimeParser {
	static readonly text = '@@sentinel-parser@@'
	static readonly instant = Date.parse('2011-11-11T11:11:11.000Z')

	override parse(text: string) {
		return text === SentinelParser.text ? DateTime.from(SentinelParser.instant) : undefined
	}
}

describe('DateTime', () => {
	describe('from()', () => {
		it('should construct a DateTime from epoch milliseconds', () => {
			const epochMilliseconds = 1609459200000
			const dateTime = DateTime.from(epochMilliseconds)
			expect(dateTime.temporalInstant.epochMilliseconds).toBe(epochMilliseconds)
		})

		it('should construct from a Temporal.ZonedDateTime preserving instant, calendar and time zone', () => {
			const instant = Date.parse('2020-06-10T00:00:00.000Z')
			const zonedDateTime = new Temporal.ZonedDateTime(BigInt(instant) * BigInt(1_000_000), 'Asia/Tehran', 'persian')

			const dateTime = DateTime.from(zonedDateTime)

			expect(dateTime.valueOf()).toBe(instant)
			expect(dateTime.calendarId).toBe('persian')
			expect(dateTime.timeZoneId).toBe('Asia/Tehran')
		})

		it('should default calendar and time zone to the current language\'s when omitted', () => {
			const resolved = Intl.DateTimeFormat(Localizer.languages.current).resolvedOptions()

			const dateTime = DateTime.from(Date.parse('2020-06-10T00:00:00.000Z'))

			expect(dateTime.calendar).toBe(resolved.calendar)
			expect(dateTime.timeZone).toBe(resolved.timeZone)
		})
	})

	describe('parseAsDateTime()', () => {
		it('should return undefined for empty or whitespace-only text', () => {
			expect(DateTime.parseAsDateTime('')).toBeUndefined()
			expect(DateTime.parseAsDateTime('   ')).toBeUndefined()
		})

		it('should delegate to the zero parser', () => {
			expectDateTimesEquals(DateTime.parseAsDateTime('0'), new DateTime())
			expectDateTimesEquals('0'.toDateTime(), new DateTime())
		})

		it('should delegate to the operation parser', () => {
			expectDateTimesEquals(DateTime.parseAsDateTime('+1'), new DateTime().add({ days: 1 }))
			expectDateTimesEquals('+1'.toDateTime(), new DateTime().add({ days: 1 }))
		})

		it('should delegate to the local parser', () => {
			expectDateTimesEquals(DateTime.parseAsDateTime('10.9', 'de'), new DateTime().with({ day: 10, month: 9 }))
			expectDateTimesEquals('10.9'.toDateTime('de'), new DateTime().with({ day: 10, month: 9 }))
		})

		it('should delegate to the day-and-month shortcut parser', () => {
			expectDateTimesEquals(DateTime.parseAsDateTime('109', 'de'), new DateTime().with({ day: 10, month: 9 }))
			expectDateTimesEquals('109'.toDateTime('de'), new DateTime().with({ day: 10, month: 9 }))

			expectDateTimesEquals(DateTime.parseAsDateTime('204', 'de'), new DateTime().with({ day: 20, month: 4 }))
			expectDateTimesEquals('204'.toDateTime('de'), new DateTime().with({ day: 20, month: 4 }))

			expectDateTimesEquals(DateTime.parseAsDateTime('2', 'de'), new DateTime().with({ day: 2 }))
			expectDateTimesEquals('2'.toDateTime('de'), new DateTime().with({ day: 2 }))
		})

		it('should delegate to the native parser', () => {
			expectDateTimesEquals(DateTime.parseAsDateTime('2023-09-01', 'de'), new DateTime('2023-09-01'))
			expectDateTimesEquals('2023-09-01'.toDateTime('de'), new DateTime('2023-09-01'))
		})

		it('should support the (text, referenceDate, language) overload', () => {
			const referenceDate = DateTime.from(Date.parse('2020-06-15T00:00:00.000Z'), 'gregory', 'UTC')

			const parsed = DateTime.parseAsDateTime('10.9', referenceDate, 'de')

			expect(parsed?.valueOf()).toBe(Date.parse('2020-09-10T00:00:00.000Z'))
		})

		it('should consult parsers registered via addParser() after the built-in ones', () => {
			DateTime.addParser(SentinelParser)

			expect(DateTime.parseAsDateTime(SentinelParser.text)?.valueOf()).toBe(SentinelParser.instant)
			expectDateTimesEquals(DateTime.parseAsDateTime('0'), new DateTime())
		})
	})

	describe('locale resolution', () => {
		let initialLanguage: LanguageCode

		beforeEach(() => initialLanguage = Localizer.languages.current)

		afterEach(async () => {
			Localizer.languages.current = initialLanguage
			await Promise.resolve()
		})

		it('should return the date separator of the given language', () => {
			expect(DateTime.getDateSeparator('en')).toBe('/')
			expect(DateTime.getDateSeparator('de')).toBe('.')
		})

		it('should return the time separator of the given language', () => {
			expect(DateTime.getTimeSeparator('en')).toBe(':')
			expect(DateTime.getTimeSeparator('de')).toBe(':')
		})

		it('should resolve the calendar per language', () => {
			expect(DateTime.getCalendar('en')).toBe('gregory')
			expect(DateTime.getCalendar('de')).toBe('gregory')
			expect(DateTime.getCalendar('fa')).toBe('persian')
		})

		it('should memoize resolved options per language and invalidate on language change', () => {
			const resolved = DateTime.getResolvedOptions('en')
			expect(DateTime.getResolvedOptions('en')).toBe(resolved)

			Localizer.languages.current = initialLanguage === 'de' ? 'en' : 'de'

			expect(DateTime.getResolvedOptions('en')).not.toBe(resolved)
		})
	})

	describe('component getters', () => {
		it('should return the day of the month', () => {
			const dateTime = new DateTime('2020-01-01')
			expect(dateTime.day).toBe(1)
		})

		it('should return the month of the year', () => {
			const dateTime = new DateTime('2020-01-01')
			expect(dateTime.month).toBe(1)
		})

		it('should return the year', () => {
			const dateTime = new DateTime('2020-01-01')
			expect(dateTime.year).toBe(2020)
		})

		it('should expose persian-calendar components for a persian-calendar instance', () => {
			const dateTime = DateTime.from(Date.parse('2025-05-19T00:00:00.000Z'), 'persian', 'UTC')

			expect(dateTime.year).toBe(1404)
			expect(dateTime.month).toBe(2)
			expect(dateTime.day).toBe(29)
		})

		it('should fall back to iso8601 week numbering when the calendar defines none', () => {
			const instant = Date.parse('2025-05-19T00:00:00.000Z')
			const persian = DateTime.from(instant, 'persian', 'UTC')
			const iso = DateTime.from(instant, 'iso8601', 'UTC')

			expect(persian.zonedDateTime.weekOfYear).toBeUndefined()
			expect(persian.weekOfYear).toBe(iso.weekOfYear)
			expect(persian.yearOfWeek).toBe(iso.yearOfWeek)
		})
	})

	describe('comparison', () => {
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

		it('should treat two DateTimes of the same instant in different time zones as equal', () => {
			const instant = Date.parse('2020-06-10T00:00:00.000Z')
			const utc = DateTime.from(instant, 'gregory', 'UTC')
			const tehran = DateTime.from(instant, 'gregory', 'Asia/Tehran')

			expect(utc.hour).not.toBe(tehran.hour)
			expect(utc.equals(tehran)).toBeTrue()
		})
	})

	describe('since() / until()', () => {
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
	})

	describe('arithmetic', () => {
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

		it('should preserve the wall-clock hour when adding days across a DST boundary', () => {
			const before = DateTime.from(Date.parse('2025-03-29T12:00:00.000Z'), 'gregory', 'Europe/Berlin')

			const after = before.add({ days: 1 })

			expect(after.hour).toBe(before.hour)
			expect(after.day).toBe(before.day + 1)
			expect(before.until(after).hours).toBe(23)
		})

		it('with() should replace only the given components, preserving calendar and time zone', () => {
			const dateTime = DateTime.from(Date.parse('2025-05-19T08:45:30.000Z'), 'persian', 'Asia/Tehran')

			const replaced = dateTime.with({ day: 1 })

			expect(replaced.day).toBe(1)
			expect(replaced.month).toBe(dateTime.month)
			expect(replaced.year).toBe(dateTime.year)
			expect(replaced.hour).toBe(dateTime.hour)
			expect(replaced.minute).toBe(dateTime.minute)
			expect(replaced.calendarId).toBe('persian')
			expect(replaced.timeZoneId).toBe('Asia/Tehran')
		})
	})

	describe('boundaries', () => {
		it('should return dayStart/dayEnd enclosing every instant of the day', () => {
			const dateTime = DateTime.from(Date.parse('2025-06-15T10:00:00.000Z'), 'gregory', 'Europe/Berlin')

			const { dayStart, dayEnd, dayRange } = dateTime

			expect(dayStart.hour).toBe(0)
			expect(dayStart.minute).toBe(0)
			expect(dayEnd.valueOf() - dayStart.valueOf()).toBe(24 * 60 * 60 * 1000 - 1)
			expect(dayRange.includes(dayStart)).toBeTrue()
			expect(dayRange.includes(dateTime)).toBeTrue()
			expect(dayRange.includes(dayEnd)).toBeTrue()
			expect(dayRange.includes(dayStart.subtract({ milliseconds: 1 }))).toBeFalse()
			expect(dayRange.includes(dayEnd.add({ milliseconds: 1 }))).toBeFalse()
		})

		it('should return weekStart/weekEnd respecting the locale\'s day-of-week numbering', () => {
			const dateTime = DateTime.from(Date.parse('2025-06-11T00:00:00.000Z'), 'gregory', 'UTC')

			expect(dateTime.weekStart.dayOfWeek).toBe(1)
			expect(dateTime.weekStart.day).toBe(9)
			expect(dateTime.weekEnd.dayOfWeek).toBe(dateTime.daysInWeek)
			expect(dateTime.weekEnd.day).toBe(15)
		})

		it('should return monthStart/monthEnd respecting the calendar\'s days in month', () => {
			const instant = Date.parse('2025-05-19T00:00:00.000Z')
			const persian = DateTime.from(instant, 'persian', 'UTC')
			const gregorian = DateTime.from(instant, 'gregory', 'UTC')

			expect(persian.monthStart.valueOf()).toBe(Date.parse('2025-04-21T00:00:00.000Z'))
			expect(persian.monthEnd.valueOf()).toBe(Date.parse('2025-05-21T00:00:00.000Z'))
			expect(gregorian.monthStart.valueOf()).toBe(Date.parse('2025-05-01T00:00:00.000Z'))
			expect(gregorian.monthEnd.valueOf()).toBe(Date.parse('2025-05-31T00:00:00.000Z'))
		})

		it('should return yearStart/yearEnd of the calendar year', () => {
			const instant = Date.parse('2025-05-19T00:00:00.000Z')
			const gregorian = DateTime.from(instant, 'gregory', 'UTC')
			const persian = DateTime.from(instant, 'persian', 'UTC')

			expect(gregorian.yearStart.valueOf()).toBe(Date.parse('2025-01-01T00:00:00.000Z'))
			expect(gregorian.yearEnd.valueOf()).toBe(Date.parse('2025-12-31T00:00:00.000Z'))
			expect(persian.yearStart.valueOf()).toBe(Date.parse('2025-03-21T00:00:00.000Z'))
			expect(persian.yearEnd.year).toBe(persian.year)
			expect(persian.yearEnd.add({ days: 1 }).year).toBe(persian.year + 1)
		})
	})

	describe('format()', () => {
		it('should format with the instance\'s own calendar and time zone by default', () => {
			const persian = DateTime.from(Date.parse('2025-05-19T00:00:00.000Z'), 'persian', 'UTC')

			const formatted = persian.format({ year: 'numeric', language: 'en' })

			expect(formatted).toContain((1404).format('en'))
			expect(formatted).not.toContain((2025).format('en'))
		})

		describe('week option', () => {
			const dt = new DateTime('2025-01-05')

			it('should reject invalid week options', () => {
				expect(() => dt.format({ week: 'long' } as any)).toThrowError('The week option only supports "short" and "medium" values.')
			})

			it('should format week with "short" style', () => {
				expect(dt.format({ week: 'short', language: 'en' })).toBe('2025 W01')
				expect(dt.format({ week: 'short', language: 'de' })).toBe('2025 KW01')
			})

			it('should format week with "medium" style', () => {
				expect(dt.format({ week: 'medium', language: 'en' })).toBe('Week 01, 2025')
				expect(dt.format({ week: 'medium', language: 'de' })).toBe('KW 01, 2025')
			})

			it('should pad the week number with the language\'s own zero digit', () => {
				const paddedPersianWeek = (1).format('fa').padStart(2, (0).format('fa'))

				expect(dt.format({ week: 'short', language: 'fa' })).toContain(paddedPersianWeek)
				expect(dt.format({ week: 'medium', language: 'fa' })).toContain(paddedPersianWeek)
			})
		})
	})
})