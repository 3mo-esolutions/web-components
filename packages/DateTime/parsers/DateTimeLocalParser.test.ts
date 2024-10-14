import { DateTimeLocalParser } from './DateTimeLocalParser.js'
import { expectDateTimesEquals } from '../expectDateTimesEquals.test.js'

describe('DateTimeLocalParser', () => {
	it('should return undefined for invalid input', () => {
		const englishParser = new DateTimeLocalParser('en')
		expect(englishParser.parse('')).toBe(undefined)
		expect(englishParser.parse('   ')).toBe(undefined)
		expect(englishParser.parse('1y')).toBe(undefined)
		expect(englishParser.parse('15')).toBe(undefined)
		expect(englishParser.parse('109')).toBe(undefined)
		expect(englishParser.parse(' 1  5  ')).toBe(undefined)
		expect(englishParser.parse('   1    y  ')).toBe(undefined)
		expect(englishParser.parse('  1y      2m  ')).toBe(undefined)
		expect(englishParser.parse('02.05.1999')).toBe(undefined)
		expect(englishParser.parse('201')).toBe(undefined)
		expect(englishParser.parse('10/010/2000')).toBe(undefined)
		expect(englishParser.parse('100/10/2000')).toBe(undefined)
		expect(englishParser.parse('10/10/2000/200')).toBe(undefined)
		expect(englishParser.parse('10/10/2000y')).toBe(undefined)

		const germanParser = new DateTimeLocalParser('de')
		expect(germanParser.parse('')).toBe(undefined)
		expect(germanParser.parse('   ')).toBe(undefined)
		expect(germanParser.parse('1y')).toBe(undefined)
		expect(germanParser.parse('15')).toBe(undefined)
		expect(germanParser.parse('109')).toBe(undefined)
		expect(germanParser.parse('02/05/1999')).toBe(undefined)
		expect(germanParser.parse(' 1  5  ')).toBe(undefined)
		expect(germanParser.parse('   1    y  ')).toBe(undefined)
		expect(germanParser.parse('  1y      2m  ')).toBe(undefined)
		expect(germanParser.parse('201')).toBe(undefined)
		expect(germanParser.parse('10.010.2000')).toBe(undefined)
		expect(germanParser.parse('100.10.2000')).toBe(undefined)
		expect(germanParser.parse('10.10.2000.200')).toBe(undefined)
		expect(germanParser.parse('10.10.2000y')).toBe(undefined)
	})

	describe('handles gregory calendar', () => {
		it('with day and month', () => {
			const expected = DateTime.from(undefined, 'gregory').with({ month: 2, day: 11 })

			expectDateTimesEquals(new DateTimeLocalParser('en-US' as any).parse('02/11'), expected)
			expectDateTimesEquals(new DateTimeLocalParser('en-US' as any).parse('  2 / 11  '), expected)

			expectDateTimesEquals(new DateTimeLocalParser('en-UK' as any).parse('11/02'), expected)

			expectDateTimesEquals(new DateTimeLocalParser('de').parse('11.02'), expected)
			expectDateTimesEquals(new DateTimeLocalParser('de').parse(' 11  . 02 '), expected)
		})

		it('with day, month and year', () => {
			const expected = DateTime.from(undefined, 'gregory').with({ year: 2020, month: 9, day: 2 })

			expectDateTimesEquals(new DateTimeLocalParser('en-US' as any).parse('09/02/2020'), expected)
			expectDateTimesEquals(new DateTimeLocalParser('en-US' as any).parse('  9 / 02 / 2 0  2 0 '), expected)

			expectDateTimesEquals(new DateTimeLocalParser('en-UK' as any).parse('02/09/2020'), expected)

			expectDateTimesEquals(new DateTimeLocalParser('de').parse('02.09.2020'), expected)
			expectDateTimesEquals(new DateTimeLocalParser('de').parse(' 02  . 09 . 2 02 0 '), expected)
		})

		it('with time', () => {
			const expected = DateTime.from(undefined, 'gregory').with({ year: 2020, month: 9, day: 2, hour: 12, minute: 30, second: 45 })

			expectDateTimesEquals(new DateTimeLocalParser('en-US' as any).parse('09/02/2020 12:30:45'), expected)
			expectDateTimesEquals(new DateTimeLocalParser('en-US' as any).parse('  09 / 02 / 2 0  2 0   12 : 30 : 45 '), expected)

			expectDateTimesEquals(new DateTimeLocalParser('en-UK' as any).parse('02/09/2020 12:30:45'), expected)
			expectDateTimesEquals(new DateTimeLocalParser('en-UK' as any).parse('  02 / 09 / 2 0  2 0   12 : 30 : 45 '), expected)

			expectDateTimesEquals(new DateTimeLocalParser('de').parse('02.09.2020 12:30:45'), expected)
			expectDateTimesEquals(new DateTimeLocalParser('de').parse(' 02  . 09 . 2 02 0   12 : 30 : 45 '), expected)
		})

		it('can handle 31st', () => {
			const expected = DateTime.from(undefined, 'gregory').with({ year: 2020, month: 10, day: 31 })

			expectDateTimesEquals(new DateTimeLocalParser('de').parse('31.10.2020'), expected)
		})
	})

	describe('handles persian calendar', () => {
		it('with day and month', () => {
			const expected = DateTime.from(undefined, 'persian').with({ month: 2, day: 1 })
			expectDateTimesEquals(new DateTimeLocalParser('fa').parse(' 02 / 1 '), expected)
		})

		it('with day, month and year', () => {
			const expected = DateTime.from(undefined, 'persian').with({ year: 1400, month: 2, day: 1 })
			expectDateTimesEquals(new DateTimeLocalParser('fa').parse('1400/02/01'), expected)
			expectDateTimesEquals(new DateTimeLocalParser('fa').parse('1400/2/1'), expected)
			expectDateTimesEquals(new DateTimeLocalParser('fa').parse(' 14 0 0 / 02 / 1 '), expected)
		})

		it('with time', () => {
			const expected = DateTime.from(undefined, 'persian').with({ year: 1400, month: 2, day: 1, hour: 12, minute: 30, second: 45 })
			expectDateTimesEquals(new DateTimeLocalParser('fa').parse('1400/02/01 12:30:45'), expected)
			expectDateTimesEquals(new DateTimeLocalParser('fa').parse(' 14 0 0 / 02 / 01   12 : 30 : 45 '), expected)
		})
	})
})