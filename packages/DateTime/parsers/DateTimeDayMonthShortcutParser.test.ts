import { DateTimeDayMonthShortcutParser } from './DateTimeDayMonthShortcutParser.js'
import { expectDateTimesEquals } from '../expectDateTimesEquals.test.js'

describe('DateTimeDayMonthShortcutParser', () => {
	it('should return undefined for invalid input', () => {
		const formatter = new DateTimeDayMonthShortcutParser('de')
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

	const gregorianEnglishParser = new DateTimeDayMonthShortcutParser('en')
	const gregorianGermanParser = new DateTimeDayMonthShortcutParser('de')

	it('should parse by day', () => {
		const expected = DateTime.from(undefined, 'gregory').with({ day: 15 })
		expectDateTimesEquals(gregorianGermanParser.parse('15'), expected)
		expectDateTimesEquals(gregorianGermanParser.parse('  1   5  '), expected)
		expectDateTimesEquals(gregorianEnglishParser.parse('15'), expected)
		expectDateTimesEquals(gregorianEnglishParser.parse('  1   5  '), expected)
	})

	it('should parse day and month', () => {
		expectDateTimesEquals(gregorianEnglishParser.parse('0203'), DateTime.from(undefined, 'gregory').with({ month: 2, day: 3 }))
		expectDateTimesEquals(gregorianEnglishParser.parse('0110'), DateTime.from(undefined, 'gregory').with({ month: 1, day: 10 }))
		expectDateTimesEquals(gregorianGermanParser.parse('0203'), DateTime.from(undefined, 'gregory').with({ month: 3, day: 2 }))
		expectDateTimesEquals(gregorianGermanParser.parse('0110'), DateTime.from(undefined, 'gregory').with({ month: 10, day: 1 }))
	})

	it('should resolve the day-month ambiguity', () => {
		expectDateTimesEquals(gregorianGermanParser.parse('32'), DateTime.from(undefined, 'gregory').with({ month: 2, day: 3 }))
		expectDateTimesEquals(gregorianGermanParser.parse('032'), DateTime.from(undefined, 'gregory').with({ month: 2, day: 3 }))
		expectDateTimesEquals(gregorianGermanParser.parse('98'), DateTime.from(undefined, 'gregory').with({ month: 8, day: 9 }))
		expectDateTimesEquals(gregorianGermanParser.parse('098'), DateTime.from(undefined, 'gregory').with({ month: 8, day: 9 }))
		expectDateTimesEquals(gregorianGermanParser.parse('204'), DateTime.from(undefined, 'gregory').with({ month: 4, day: 20 }))

		expectDateTimesEquals(gregorianEnglishParser.parse('32'), DateTime.from(undefined, 'gregory').with({ month: 3, day: 2 }))
		expectDateTimesEquals(gregorianEnglishParser.parse('032'), DateTime.from(undefined, 'gregory').with({ month: 3, day: 2 }))
		expectDateTimesEquals(gregorianEnglishParser.parse('98'), DateTime.from(undefined, 'gregory').with({ month: 9, day: 8 }))
		expectDateTimesEquals(gregorianEnglishParser.parse('098'), DateTime.from(undefined, 'gregory').with({ month: 9, day: 8 }))
		expectDateTimesEquals(gregorianEnglishParser.parse('204'), DateTime.from(undefined, 'gregory').with({ month: 2, day: 4 }))
	})

	it('should handle gregory calendar', () => {
		const expected = DateTime.from(undefined, 'gregory').with({ day: 15 })
		expectDateTimesEquals(gregorianGermanParser.parse('15'), expected)
		expectDateTimesEquals(gregorianGermanParser.parse('  1   5  '), expected)
	})

	const persianParser = new DateTimeDayMonthShortcutParser('fa')

	it('should handle persian calendar', () => {
		const expected = DateTime.from(undefined, 'persian').with({ day: 11 })
		expectDateTimesEquals(persianParser.parse(' 1 1 '), expected)
		expectDateTimesEquals(persianParser.parse('11'), expected)
	})
})