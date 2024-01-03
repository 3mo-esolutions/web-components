import { DateTimeShortcutParser } from './DateTimeShortcutParser.js'
import { expectDateTimesEquals } from '../expectDateTimesEquals.test.js'

describe('DateTimeShortcutParser', () => {
	it('should return undefined for invalid input', () => {
		const formatter = new DateTimeShortcutParser('de')
		expect(formatter.parse('30/1')).toBe(undefined)
		expect(formatter.parse('566')).toBe(undefined)
		expect(formatter.parse('1336')).toBe(undefined)
		expect(formatter.parse('')).toBe(undefined)
		expect(formatter.parse('   ')).toBe(undefined)
		expect(formatter.parse('1y')).toBe(undefined)
		expect(formatter.parse('   1    y  ')).toBe(undefined)
		expect(formatter.parse('  1y      2m  ')).toBe(undefined)
		expect(formatter.parse('02.05.1999')).toBe(undefined)
		expect(formatter.parse('2013')).toBe(undefined)
		expect(formatter.parse('320')).toBe(undefined)
		expect(formatter.parse('10/010/2000')).toBe(undefined)
		expect(formatter.parse('100/10/2000')).toBe(undefined)
		expect(formatter.parse('10/10/20000')).toBe(undefined)
		expect(formatter.parse('10/10/2000/200')).toBe(undefined)
		expect(formatter.parse('10/10/2000y')).toBe(undefined)
	})

	const gregorianEnglishParser = new DateTimeShortcutParser('en')
	const gregorianGermanParser = new DateTimeShortcutParser('de')
	const persianParser = new DateTimeShortcutParser('fa')

	describe('parsing by day', () => {
		it('should work for gregory calendar', () => {
			const expected = new DateTime({ calendar: 'gregory' }).with({ day: 15 })
			expectDateTimesEquals(gregorianGermanParser.parse('15'), expected)
			expectDateTimesEquals(gregorianGermanParser.parse('  1   5  '), expected)
			expectDateTimesEquals(gregorianEnglishParser.parse('15'), expected)
			expectDateTimesEquals(gregorianEnglishParser.parse('  1   5  '), expected)
		})

		it('should work for persian calendar', () => {
			const expected = new DateTime({ calendar: 'persian' }).with({ day: 11 })
			expectDateTimesEquals(persianParser.parse(' 1 1 '), expected)
			expectDateTimesEquals(persianParser.parse('11'), expected)
		})
	})

	describe('parsing by day and month', () => {
		it('should work for gregory calendar', () => {
			expectDateTimesEquals(gregorianEnglishParser.parse('0203'), new DateTime({ calendar: 'gregory' }).with({ month: 2, day: 3 }))
			expectDateTimesEquals(gregorianEnglishParser.parse('0110'), new DateTime({ calendar: 'gregory' }).with({ month: 1, day: 10 }))
			expectDateTimesEquals(gregorianGermanParser.parse('0203'), new DateTime({ calendar: 'gregory' }).with({ month: 3, day: 2 }))
			expectDateTimesEquals(gregorianGermanParser.parse('0110'), new DateTime({ calendar: 'gregory' }).with({ month: 10, day: 1 }))
		})

		it('should work for persian calendar', () => {
			expectDateTimesEquals(persianParser.parse('0110'), new DateTime({ calendar: 'persian' }).with({ month: 1, day: 10 }))
			expectDateTimesEquals(persianParser.parse('0203'), new DateTime({ calendar: 'persian' }).with({ month: 2, day: 3 }))
		})
	})

	describe('parsing by ambiguous day and month', () => {
		it('should work for gregory calendar', () => {
			expectDateTimesEquals(gregorianGermanParser.parse('32'), new DateTime({ calendar: 'gregory' }).with({ month: 2, day: 3 }))
			expectDateTimesEquals(gregorianGermanParser.parse('032'), new DateTime({ calendar: 'gregory' }).with({ month: 2, day: 3 }))
			expectDateTimesEquals(gregorianGermanParser.parse('98'), new DateTime({ calendar: 'gregory' }).with({ month: 8, day: 9 }))
			expectDateTimesEquals(gregorianGermanParser.parse('098'), new DateTime({ calendar: 'gregory' }).with({ month: 8, day: 9 }))
			expectDateTimesEquals(gregorianGermanParser.parse('204'), new DateTime({ calendar: 'gregory' }).with({ month: 4, day: 20 }))

			expectDateTimesEquals(gregorianEnglishParser.parse('32'), new DateTime({ calendar: 'gregory' }).with({ month: 3, day: 2 }))
			expectDateTimesEquals(gregorianEnglishParser.parse('032'), new DateTime({ calendar: 'gregory' }).with({ month: 3, day: 2 }))
			expectDateTimesEquals(gregorianEnglishParser.parse('98'), new DateTime({ calendar: 'gregory' }).with({ month: 9, day: 8 }))
			expectDateTimesEquals(gregorianEnglishParser.parse('098'), new DateTime({ calendar: 'gregory' }).with({ month: 9, day: 8 }))
			expectDateTimesEquals(gregorianEnglishParser.parse('204'), new DateTime({ calendar: 'gregory' }).with({ month: 2, day: 4 }))
		})

		it('should work for persian calendar', () => {
			expectDateTimesEquals(persianParser.parse('32'), new DateTime({ calendar: 'persian' }).with({ month: 3, day: 2 }))
			expectDateTimesEquals(persianParser.parse('032'), new DateTime({ calendar: 'persian' }).with({ month: 3, day: 2 }))
			expectDateTimesEquals(persianParser.parse('98'), new DateTime({ calendar: 'persian' }).with({ month: 9, day: 8 }))
			expectDateTimesEquals(persianParser.parse('098'), new DateTime({ calendar: 'persian' }).with({ month: 9, day: 8 }))
			expectDateTimesEquals(persianParser.parse('204'), new DateTime({ calendar: 'persian' }).with({ month: 2, day: 4 }))
		})
	})

	describe('parsing by day, month and year', () => {
		it('should work for gregory calendar', () => {
			expectDateTimesEquals(gregorianEnglishParser.parse('020122'), new DateTime({ calendar: 'gregory' }).with({ year: 2022, month: 2, day: 1, }))
			expectDateTimesEquals(gregorianEnglishParser.parse('02012022'), new DateTime({ calendar: 'gregory' }).with({ year: 2022, month: 2, day: 1, }))
			expectDateTimesEquals(gregorianGermanParser.parse('020122'), new DateTime({ calendar: 'gregory' }).with({ year: 2022, month: 1, day: 2, }))
			expectDateTimesEquals(gregorianGermanParser.parse('02012022'), new DateTime({ calendar: 'gregory' }).with({ year: 2022, month: 1, day: 2, }))
		})

		it('should work for persian calendar', () => {
			expectDateTimesEquals(persianParser.parse('030201'), new DateTime({ calendar: 'persian' }).with({ year: 1403, month: 2, day: 1, }))
			expectDateTimesEquals(persianParser.parse('14030201'), new DateTime({ calendar: 'persian' }).with({ year: 1403, month: 2, day: 1, }))
		})
	})
})