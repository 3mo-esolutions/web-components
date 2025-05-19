import '@3mo/date-time'
import { FieldDateTimePrecision } from './FieldDateTimePrecision'

describe('FieldDateTimePrecision', () => {
	describe('parse', () => {
		it('should return undefined for an invalid precision string', () => {
			const result = FieldDateTimePrecision.parse('invalid')
			expect(result).toBeUndefined()
		})

		it('should return the correct precision for a valid precision string', () => {
			expect(FieldDateTimePrecision.parse('year')).toEqual(FieldDateTimePrecision.Year)
			expect(FieldDateTimePrecision.parse('month')).toEqual(FieldDateTimePrecision.Month)
			expect(FieldDateTimePrecision.parse('day')).toEqual(FieldDateTimePrecision.Day)
			expect(FieldDateTimePrecision.parse('hour')).toEqual(FieldDateTimePrecision.Hour)
			expect(FieldDateTimePrecision.parse('minute')).toEqual(FieldDateTimePrecision.Minute)
			expect(FieldDateTimePrecision.parse('second')).toEqual(FieldDateTimePrecision.Second)
		})
	})

	describe('formatOptions', () => {
		it('should return the correct format options for each precision', () => {
			expect(FieldDateTimePrecision.Year.formatOptions).toEqual(jasmine.objectContaining({ year: 'numeric', hourCycle: 'h23' }))
			expect(FieldDateTimePrecision.Month.formatOptions).toEqual(jasmine.objectContaining({ year: 'numeric', month: '2-digit', hourCycle: 'h23' }))
			expect(FieldDateTimePrecision.Day.formatOptions).toEqual(jasmine.objectContaining({ year: 'numeric', month: '2-digit', day: '2-digit', hourCycle: 'h23' }))
			expect(FieldDateTimePrecision.Hour.formatOptions).toEqual(jasmine.objectContaining({ year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }))
			expect(FieldDateTimePrecision.Minute.formatOptions).toEqual(jasmine.objectContaining({ year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }))
			expect(FieldDateTimePrecision.Second.formatOptions).toEqual(jasmine.objectContaining({ year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }))
		})
	})

	describe('getRange', () => {
		const date = new DateTime('2025-05-19T10:40:20')

		it('should return the correct range for "Year"', () => {
			expect(FieldDateTimePrecision.Year.getRange(date)).toEqual(new DateTimeRange(new DateTime('2025-01-01T00:00:00'), new DateTime('2025-12-31T23:59:59')))
		})

		it('should return the correct range for "Month"', () => {
			expect(FieldDateTimePrecision.Month.getRange(date)).toEqual(new DateTimeRange(new DateTime('2025-05-01T00:00:00'), new DateTime('2025-05-31T23:59:59')))
		})

		it('should return the correct range for "Day"', () => {
			expect(FieldDateTimePrecision.Day.getRange(date)).toEqual(new DateTimeRange(new DateTime('2025-05-19T00:00:00'), new DateTime('2025-05-19T23:59:59')))
		})

		it('should return the correct range for "Hour"', () => {
			expect(FieldDateTimePrecision.Hour.getRange(date)).toEqual(new DateTimeRange(new DateTime('2025-05-19T10:00:00'), new DateTime('2025-05-19T10:59:59')))
		})

		it('should return the correct range for "Minute"', () => {
			expect(FieldDateTimePrecision.Minute.getRange(date)).toEqual(new DateTimeRange(new DateTime('2025-05-19T10:40:00'), new DateTime('2025-05-19T10:40:59')))
		})

		it('should return the correct range for "Second"', () => {
			expect(FieldDateTimePrecision.Second.getRange(date)).toEqual(new DateTimeRange(new DateTime('2025-05-19T10:40:20'), new DateTime('2025-05-19T10:40:20')))
		})
	})
})