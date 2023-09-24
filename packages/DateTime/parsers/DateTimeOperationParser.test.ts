import { DateTimeOperationParser } from './DateTimeOperationParser.js'
import { expectDateTimesEquals } from '../expectDateTimesEquals.test.js'

const testNumbers = [-7, -1, 1, 7]

const testSuites = {
	years: [
		['en', ['year', 'years', 'y']],
		['de', ['jahr', 'jahre', 'j']],
		['fa', ['سال']],
	],
	months: [
		['en', ['month', 'months']],
		['de', ['monat', 'monate']],
		['fa', ['ماه']],
	],
	weeks: [
		['en', ['week', 'weeks', 'w']],
		['de', ['woche', 'wochen', 'w']],
		['fa', ['هفته']],
	],
	days: [
		['en', ['day', 'days', 'd']],
		['de', ['tag', 'tage', 't']],
		['fa', ['روز']],
	],
	hours: [
		['en', ['hour', 'hours', 'h']],
		['de', ['stunde', 'stunden', 'std']],
		['fa', ['ساعت']],
	],
	minutes: [
		['en', ['minute', 'minutes', 'min']],
		['de', ['minute', 'minuten', 'min']],
		['fa', ['دقیقه']],
	],
} as const

describe('DateTimeOperationParser', () => {
	it('should return undefined for invalid input', () => {
		const parser = new DateTimeOperationParser()
		expect(parser.parse('')).toBe(undefined)
		expect(parser.parse('   ')).toBe(undefined)
		expect(parser.parse('1')).toBe(undefined)
		expect(parser.parse('   1   ')).toBe(undefined)
		expect(parser.parse('1y')).toBe(undefined)
		expect(parser.parse('   1    y  ')).toBe(undefined)
		expect(parser.parse('  1y      2m  ')).toBe(undefined)
	})

	for (const [key, values] of Object.entries(testSuites)) {
		describe(`should parse by ${key}`, () => {
			for (const [language, suffixes] of values) {
				for (const suffix of suffixes ?? []) {
					for (const number of testNumbers) {
						const sign = number < 0 ? '' : '+'
						it(`should be able to parse "${sign}${number} ${suffix}" in ${language}`, () => {
							const parser = new DateTimeOperationParser(language as any)
							const then = new DateTime().add({ [key]: number })

							expectDateTimesEquals(parser.parse(`${sign}${number}${suffix}`), then)
							expectDateTimesEquals(parser.parse(`${sign}${number}   ${suffix}`), then)
							expectDateTimesEquals(parser.parse(`${sign}   ${number}${suffix}`), then)
							expectDateTimesEquals(parser.parse(`   ${sign}   ${number}${suffix}`), then)
						})
					}
				}
			}
		})
	}
})