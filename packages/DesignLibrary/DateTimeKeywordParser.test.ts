import { DateTime } from '@3mo/date-time'
import { DateTimeKeywordParser } from './DateTimeKeywordParser.js'

const referenceDate = new DateTime('2024-06-13T10:30:00')

type Expectation = readonly [keyword: string, year: number, month: number, day: number]

const expectKeywordToParseAs = (keyword: string, year: number, month: number, day: number) => {
	const parsed = new DateTimeKeywordParser().parse(keyword, referenceDate)
	expect(parsed).withContext(`"${keyword}" was not parsed at all`).toBeDefined()
	expect([parsed?.year, parsed?.month, parsed?.day]).toEqual([year, month, day])
}

const parameterize = (label: string, expectations: ReadonlyArray<Expectation>) => {
	for (const [keyword, year, month, day] of expectations) {
		it(`${label} (${keyword})`, () => expectKeywordToParseAs(keyword, year, month, day))
	}
}

describe('DateTimeKeywordParser', () => {
	it('should return undefined for unrecognized text', () => {
		const parser = new DateTimeKeywordParser
		expect(parser.parse('', referenceDate)).toBeUndefined()
		expect(parser.parse('   ', referenceDate)).toBeUndefined()
		expect(parser.parse('tomorrow', referenceDate)).toBeUndefined()
		expect(parser.parse('hm', referenceDate)).toBeUndefined()
		expect(parser.parse('15', referenceDate)).toBeUndefined()
	})

	it('should ignore case and surrounding whitespace', () => {
		expectKeywordToParseAs('  H  ', 2024, 6, 13)
		expectKeywordToParseAs(' ÜM ', 2024, 6, 15)
		expectKeywordToParseAs('\tADM\n', 2024, 6, 1)
	})

	parameterize('should parse day keywords relative to the reference date', [
		['h', 2024, 6, 13],
		['m', 2024, 6, 14],
		['üm', 2024, 6, 15],
		['üüm', 2024, 6, 16],
		['g', 2024, 6, 12],
		['vg', 2024, 6, 11],
		['vvg', 2024, 6, 10],
	])

	parameterize('should parse week start and end keywords', [
		['adw', 2024, 6, 10],
		['edw', 2024, 6, 16],
		['anw', 2024, 6, 17],
		['enw', 2024, 6, 23],
		['alw', 2024, 6, 3],
		['elw', 2024, 6, 9],
	])

	parameterize('should parse Friday keywords as two days before the respective week end', [
		['fdw', 2024, 6, 14],
		['fnw', 2024, 6, 21],
		['flw', 2024, 6, 7],
	])

	parameterize('should parse month start and end keywords', [
		['adm', 2024, 6, 1],
		['edm', 2024, 6, 30],
		['anm', 2024, 7, 1],
		['enm', 2024, 7, 31],
		['alm', 2024, 5, 1],
		['elm', 2024, 5, 31],
	])

	parameterize('should parse year start and end keywords', [
		['adj', 2024, 1, 1],
		['edj', 2024, 12, 31],
		['anj', 2025, 1, 1],
		['enj', 2025, 12, 31],
		['alj', 2023, 1, 1],
		['elj', 2023, 12, 31],
	])

	it('should be registered globally so keywords resolve through DateTime.parseAsDateTime', () => {
		const parsed = DateTime.parseAsDateTime('adm', referenceDate)

		expect(parsed).toBeDefined()
		expect([parsed?.year, parsed?.month, parsed?.day]).toEqual([2024, 6, 1])
	})
})