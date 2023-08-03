import { DateTime } from './DateTime.js'

describe('DateTime', () => {
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
})