import { TimeSpan } from './TimeSpan.js'

describe('TimeSpan', () => {
	describe('Factory methods & units', () => {
		it('should construct from milliseconds, seconds, minutes, hours, days, weeks, months, years', () => {
			expect(TimeSpan.fromMilliseconds(500).milliseconds).toBe(500)
			expect(TimeSpan.fromSeconds(2).seconds).toBe(2)
			expect(TimeSpan.fromMinutes(3).minutes).toBe(3)
			expect(TimeSpan.fromHours(4).hours).toBe(4)
			expect(TimeSpan.fromDays(5).days).toBe(5)
			expect(TimeSpan.fromWeeks(6).weeks).toBe(6)
			expect(TimeSpan.fromMonths(7).months).toBe(7)
			expect(TimeSpan.fromYears(8).years).toBe(8)
		})
	})

	describe('Formatting', () => {
		it('should format relative time in units', () => {
			const span = TimeSpan.fromDays(3)
			expect(span.format({ language: 'en' })).toContain('3 days')
		})
	})
})