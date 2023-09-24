import { DateTimeZeroParser } from './DateTimeZeroParser.js'
import { expectDateTimesEquals } from '../expectDateTimesEquals.test.js'

describe('DateTimeZeroParser', () => {
	it('should return now for zero', () => {
		const parser = new DateTimeZeroParser('en')
		expectDateTimesEquals(parser.parse('0'), new DateTime())
		expectDateTimesEquals(parser.parse('    0  '), new DateTime())
		expect(parser.parse('   ')).toBe(undefined)
		expect(parser.parse('1y')).toBe(undefined)
		expect(parser.parse('15')).toBe(undefined)
		expect(parser.parse(' 1  5  ')).toBe(undefined)
		expect(parser.parse('   1    y  ')).toBe(undefined)
		expect(parser.parse('  1y      2m  ')).toBe(undefined)
		expect(parser.parse('02.05.1999')).toBe(undefined)
	})
})