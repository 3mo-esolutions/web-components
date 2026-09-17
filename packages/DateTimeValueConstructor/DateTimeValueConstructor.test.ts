import { DateTime } from '@3mo/date-time'
import { DateTimeValueConstructor } from './DateTimeValueConstructor.js'

describe('DateTimeValueConstructor', () => {
	const valueConstructor = new DateTimeValueConstructor()

	describe('shallConstruct', () => {
		const acceptedValues = new Map([
			['milliseconds and "Z"', '2020-06-15T08:05:00.123Z'],
			['seconds and a numeric offset', '2020-06-15T08:05:00+02:00'],
			['minutes and "Z"', '2020-06-15T08:05Z'],
		])

		for (const [description, value] of acceptedValues) {
			it(`should accept ISO date-time strings with a time zone designator - ${description}`, () => {
				expect(valueConstructor.shallConstruct(value)).toBe(true)
			})
		}

		it('should reject date-only and zone-less date-time strings', () => {
			expect(valueConstructor.shallConstruct('2020-01-01')).toBe(false)
			expect(valueConstructor.shallConstruct('2020-01-01T00:00:00')).toBe(false)
			expect(valueConstructor.shallConstruct('2020-01-01T00:00')).toBe(false)
		})

		it('should reject non-string values', () => {
			expect(valueConstructor.shallConstruct(1592208300000)).toBe(false)
			expect(valueConstructor.shallConstruct(new DateTime('2020-06-15T08:05:00.000Z'))).toBe(false)
			expect(valueConstructor.shallConstruct(undefined)).toBe(false)
			expect(valueConstructor.shallConstruct(null)).toBe(false)
		})
	})

	describe('construct', () => {
		it('should construct a DateTime representing the same instant', () => {
			const dateTime = valueConstructor.construct('2020-06-15T08:05:00+02:00')

			expect(dateTime).toBeInstanceOf(DateTime)
			expect(dateTime.valueOf()).toBe(Date.parse('2020-06-15T06:05:00.000Z'))
		})
	})

	describe('shallDeconstruct', () => {
		it('should accept Date and DateTime instances only', () => {
			expect(valueConstructor.shallDeconstruct(new Date('2020-06-15T08:05:00.000Z'))).toBe(true)
			expect(valueConstructor.shallDeconstruct(new DateTime('2020-06-15T08:05:00.000Z'))).toBe(true)

			expect(valueConstructor.shallDeconstruct('2020-06-15T08:05:00.000Z')).toBe(false)
			expect(valueConstructor.shallDeconstruct(1592208300000)).toBe(false)
			expect(valueConstructor.shallDeconstruct(undefined)).toBe(false)
		})
	})

	describe('round-trip', () => {
		it('should deconstruct to an ISO string that constructs back to an equal DateTime', () => {
			const dateTime = new DateTime('2020-06-15T08:05:00+02:00')

			const text = valueConstructor.deconstruct(dateTime)

			expect(valueConstructor.shallConstruct(text)).toBe(true)
			expect(valueConstructor.construct(text).valueOf()).toBe(dateTime.valueOf())
		})
	})
})