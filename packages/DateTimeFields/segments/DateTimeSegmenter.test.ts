import '@3mo/date-time'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import { DateTimeSegmenter } from './DateTimeSegmenter.js'
import { isEditableSegment } from '@3mo/segmented-input'
import { type DateTimeSegment, type EditableDateTimeSegmentType } from './DateTimeSegment.js'

describe('DateTimeSegmenter', () => {
	const utc = (isoDateTime: string, calendar = 'gregory') => DateTime.from(Date.parse(`${isoDateTime}.000Z`), calendar, 'UTC')
	const all = (segmenter: DateTimeSegmenter) => new Set<EditableDateTimeSegmentType>(segmenter.types)
	const none = new Set<EditableDateTimeSegmentType>()
	const texts = (segmenter: DateTimeSegmenter, date: DateTime, filled = all(segmenter)) => segmenter.segments(date, filled).map(segment => segment.text)
	const unit = (segments: ReadonlyArray<DateTimeSegment>, type: EditableDateTimeSegmentType) => segments.filter(isEditableSegment).find(segment => segment.type === type)!

	const de = (precision = FieldDateTimePrecision.Minute) => new DateTimeSegmenter({ precision, language: 'de', calendar: 'gregory', timeZone: 'UTC' })
	const en = (precision = FieldDateTimePrecision.Minute) => new DateTimeSegmenter({ precision, language: 'en', calendar: 'gregory', timeZone: 'UTC' })
	const fa = (precision = FieldDateTimePrecision.Minute) => new DateTimeSegmenter({ precision, language: 'fa', calendar: 'persian', timeZone: 'UTC' })

	const date = utc('2026-09-05T14:07:09')

	describe('derivation from the language', () => {
		it('should order German segments day.month.year, hour:minute', () => {
			expect(texts(de(), date)).toEqual(['05', '.', '09', '.', '2026', ', ', '14', ':', '07'])
			expect(de().types).toEqual(['day', 'month', 'year', 'hour', 'minute'])
		})

		it('should give English a 12-hour clock with a day period', () => {
			expect(en().hourCycle).toBe('h12')
			expect(texts(en(), date)).toEqual(['09', '/', '05', '/', '2026', ', ', '02', ':', '07', ' ', 'PM'])
			expect(en().types).toEqual(['month', 'day', 'year', 'hour', 'minute', 'dayPeriod'])
		})

		it('should render the Persian calendar in Persian digits, year first', () => {
			expect(fa().types.slice(0, 3)).toEqual(['year', 'month', 'day'])
			expect(texts(fa(FieldDateTimePrecision.Day), date)).toEqual(['۱۴۰۵', '/', '۰۶', '/', '۱۴'])
			expect(fa().direction).toBe('rtl')
		})

		it('should honor an explicit hour cycle', () => {
			const segmenter = new DateTimeSegmenter({ precision: FieldDateTimePrecision.Minute, language: 'de', calendar: 'gregory', timeZone: 'UTC', hourCycle: 'h12' })
			expect(segmenter.types).toContain('dayPeriod')
		})

		it('should restrict itself to the time units for time-only fields', () => {
			const segmenter = new DateTimeSegmenter({ precision: FieldDateTimePrecision.Minute, language: 'de', calendar: 'gregory', timeZone: 'UTC', timeOnly: true })
			expect(segmenter.types).toEqual(['hour', 'minute'])
			expect(texts(segmenter, date)).toEqual(['14', ':', '07'])
		})

		it('should render week precision as year and week number', () => {
			expect(texts(de(FieldDateTimePrecision.Week), date)).toEqual(['2026', ' KW', '36'])
			expect(de(FieldDateTimePrecision.Week).types).toEqual(['year', 'week'])
		})

		it('should name the units in the language', () => {
			expect(de().labelOf('month')).toBe('Monat')
			expect(en().labelOf('day')).toBe('day')
			expect(de(FieldDateTimePrecision.Week).labelOf('week')).toBe('Woche')
		})
	})

	describe('placeholders', () => {
		it('should derive letter placeholders from the unit names for Latin scripts', () => {
			expect(texts(de(FieldDateTimePrecision.Day), date, none)).toEqual(['tt', '.', 'mm', '.', 'jjjj'])
			expect(texts(en(FieldDateTimePrecision.Day), date, none)).toEqual(['mm', '/', 'dd', '/', 'yyyy'])
		})

		it('should use the whole unit name for other scripts', () => {
			expect(texts(fa(FieldDateTimePrecision.Day), date, none)).toEqual(['سال', '/', 'ماه', '/', 'روز'])
		})

		it('should use dashes for the time units', () => {
			expect(texts(de(), date, none).slice(-3)).toEqual(['--', ':', '--'])
		})

		it('should report which segments are filled', () => {
			const segments = de(FieldDateTimePrecision.Day).segments(date, new Set(['day']))
			expect(unit(segments, 'day').filled).toBe(true)
			expect(unit(segments, 'month').filled).toBe(false)
			expect(unit(segments, 'month').text).toBe('mm')
		})
	})

	describe('limits', () => {
		it('should limit the day to the days of the month', () => {
			expect(de().limits(utc('2026-02-10T00:00:00'), 'day')).toEqual({ min: 1, max: 28 })
			expect(de().limits(utc('2024-02-10T00:00:00'), 'day')).toEqual({ min: 1, max: 29 })
			expect(fa().limits(date, 'day')).toEqual({ min: 1, max: 31 })
		})

		it('should limit the month to the months of the year, thirteen in a Hebrew leap year', () => {
			const hebrew = new DateTimeSegmenter({ precision: FieldDateTimePrecision.Day, language: 'en', calendar: 'hebrew', timeZone: 'UTC' })
			expect(hebrew.limits(utc('2024-03-01T00:00:00', 'hebrew'), 'month')).toEqual({ min: 1, max: 13 })
			expect(hebrew.limits(utc('2026-03-01T00:00:00', 'hebrew'), 'month')).toEqual({ min: 1, max: 12 })
		})

		it('should limit the hour by the hour cycle', () => {
			expect(de().limits(date, 'hour')).toEqual({ min: 0, max: 23 })
			expect(en().limits(date, 'hour')).toEqual({ min: 1, max: 12 })
		})

		it('should expose the value in the numbers the user sees', () => {
			expect(de().valueOf(date, 'hour')).toBe(14)
			expect(en().valueOf(date, 'hour')).toBe(2)
			expect(en().valueOf(date, 'dayPeriod')).toBe(1)
			expect(fa().valueOf(date, 'year')).toBe(1405)
		})

		it('should describe the month by name and the hour with its period', () => {
			const segments = en().segments(date, all(en()))
			expect(unit(segments, 'month').valueText).toBe('September')
			expect(unit(segments, 'hour').valueText).toBe('2 PM')
		})
	})

	describe('editing', () => {
		it('should constrain the day when the month changes', () => {
			expect(de().set(utc('2026-01-31T00:00:00'), 'month', 2).valueOf()).toBe(utc('2026-02-28T00:00:00').valueOf())
		})

		it('should set the Persian year through the calendar', () => {
			expect(fa().set(date, 'year', 1400).year).toBe(1400)
		})

		it('should wrap steps at the limits', () => {
			expect(de().step(utc('2026-01-31T00:00:00'), 'day', 1).day).toBe(1)
			expect(de().step(utc('2026-12-05T00:00:00'), 'month', 1).month).toBe(1)
			expect(de().step(utc('2026-09-05T23:00:00'), 'hour', 1).hour).toBe(0)
			expect(de().step(utc('2026-09-05T00:00:00'), 'minute', -1).minute).toBe(59)
		})

		it('should clamp the year instead of wrapping it', () => {
			expect(de().step(utc('9999-01-01T00:00:00'), 'year', 1).year).toBe(9999)
		})

		it('should keep the day period when editing a 12-hour clock', () => {
			expect(en().set(date, 'hour', 3).hour).toBe(15)
			expect(en().set(date, 'hour', 12).hour).toBe(12)
			expect(en().set(utc('2026-09-05T09:00:00'), 'hour', 12).hour).toBe(0)
			expect(en().step(utc('2026-09-05T23:00:00'), 'hour', 1).hour).toBe(12)
		})

		it('should toggle the day period by twelve hours', () => {
			expect(en().set(date, 'dayPeriod', 0).hour).toBe(2)
			expect(en().set(date, 'dayPeriod', 1).hour).toBe(14)
			expect(en().step(date, 'dayPeriod', 1).hour).toBe(2)
		})

		it('should move whole weeks at week precision', () => {
			expect(de(FieldDateTimePrecision.Week).set(date, 'week', 1).weekOfYear).toBe(1)
			expect(de(FieldDateTimePrecision.Week).step(date, 'week', 1).weekOfYear).toBe(37)
		})
	})

	describe('input', () => {
		it('should read digits in the language\'s numbering system and in ASCII', () => {
			expect(fa().digitOf('۵')).toBe(5)
			expect(fa().digitOf('5')).toBe(5)
			expect(de().digitOf('7')).toBe(7)
			expect(de().digitOf('a')).toBeUndefined()
		})

		it('should match a typed letter to the day period', () => {
			expect(en().dayPeriodOf('a')).toBe(0)
			expect(en().dayPeriodOf('P')).toBe(1)
			expect(en().dayPeriodOf('x')).toBeUndefined()
		})

		it('should describe the whole value in one string', () => {
			expect(de().describe(date)).toBe('05.09.2026, 14:07')
			expect(de(FieldDateTimePrecision.Week).describe(date)).toBe('KW 36, 2026')
		})

		it('should bring a date into its calendar and zone', () => {
			const adopted = fa().adopt(date)
			expect(adopted.calendarId).toBe('persian')
			expect(adopted.valueOf()).toBe(date.valueOf())
		})
	})
})