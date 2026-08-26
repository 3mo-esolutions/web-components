import { type LanguageCode } from '../LanguageCode.js'

/** Languages whose CLDR `minimumGroupingDigits` is 2, so that four-digit numbers render ungrouped. */
const minimumGroupingDigitsTwoLanguages: Array<LanguageCode> = ['es', 'it', 'pl', 'hu', 'bg', 'et', 'lv', 'sl', 'sq', 'be', 'hy', 'ka']

const nonLatinDigitLanguages: Array<LanguageCode> = ['as', 'bn', 'my', 'dz', 'fa', 'ks', 'ps', 'mr', 'ne', 'sa', 'sd']

const rightToLeftLanguages: Array<LanguageCode> = ['ar', 'he', 'fa', 'ur', 'ks', 'ps', 'sd']

const representativeLanguages: Array<LanguageCode> = [
	'en', 'de', 'fr', 'gsw', 'eo', 'rm',
	'af', 'sq', 'hy', 'az', 'eu', 'hr', 'et', 'fo',
	...minimumGroupingDigitsTwoLanguages,
	...nonLatinDigitLanguages,
	...rightToLeftLanguages,
]

describe('String.toNumber()', () => {
	it('should return undefined when empty', () => {
		expect(''.toNumber()).toBeUndefined()
	})

	it('should return undefined when not a number', () => {
		expect('abc'.toNumber()).toBeUndefined()
	})

	it('should parse numbers that include separators', () => {
		expect('12.345,67'.toNumber('de')).toBe(12345.67)
		expect('12,345.67'.toNumber('en')).toBe(12345.67)
	})

	it('should not allow -0 and return 0 instead', () => {
		expect(Object.is('-0'.toNumber('en'), 0)).toBeTrue()
		expect(Object.is('-0'.toNumber('de'), 0)).toBeTrue()
	})

	// Regression: the group separator used to be probed with `formatToParts(1000)`. Languages whose
	// `minimumGroupingDigits` is 2 render 1000 ungrouped, so no group part existed, the separator came
	// out as '' and `new RegExp('\\')` threw a SyntaxError before any parsing happened.
	describe('languages that do not group four-digit numbers', () => {
		for (const language of minimumGroupingDigitsTwoLanguages) {
			it(`should not throw for '${language}'`, () => {
				expect(() => '1'.toNumber(language)).not.toThrow()
			})

			it(`should parse a grouped number in '${language}'`, () => {
				const formatted = Intl.NumberFormat(language, { useGrouping: true, maximumFractionDigits: 16 }).format(12345.67)
				expect(formatted.toNumber(language)).toBe(12345.67)
			})
		}
	})

	// Regression: `parseFloat` only understands ASCII digits, so languages with a non-latn numbering
	// system could not parse their own formatted output and always returned undefined.
	describe('languages with non-latin digits', () => {
		for (const language of nonLatinDigitLanguages) {
			it(`should parse localized digits in '${language}'`, () => {
				const formatted = Intl.NumberFormat(language, { useGrouping: true, maximumFractionDigits: 16 }).format(12345.67)
				expect(formatted.toNumber(language)).toBe(12345.67)
			})
		}

		it('should still parse ASCII digits typed into a non-latin language', () => {
			expect('12345٫67'.toNumber('fa')).toBe(12345.67)
		})
	})

	// Regression: Intl embeds LRM and ALM marks in right-to-left output, which `parseFloat` chokes on.
	describe('right-to-left languages', () => {
		for (const language of rightToLeftLanguages) {
			it(`should parse a negative number in '${language}'`, () => {
				const formatted = Intl.NumberFormat(language, { maximumFractionDigits: 16 }).format(-1234.5)
				expect(formatted.toNumber(language)).toBe(-1234.5)
			})
		}
	})

	it('should normalise the U+2212 minus sign used by some languages', () => {
		expect('−1234,5'.toNumber('et')).toBe(-1234.5)
		expect(Intl.NumberFormat('eu').format(-5).toNumber('eu')).toBe(-5)
	})

	it('should ignore whitespace regardless of which kind the language groups with', () => {
		expect('12 345,67'.toNumber('pl')).toBe(12345.67)
		expect('12 345,67'.toNumber('pl')).toBe(12345.67)
		expect('12 345,67'.toNumber('fr')).toBe(12345.67)
		expect('12 345,67'.toNumber('fr')).toBe(12345.67)
	})

	it('should round-trip every representative language', () => {
		const values = [0, 1, -1, 0.5, -0.5, 1000, 12345.67, -12345.67, 1234567.891]
		const failures = new Array<string>()

		for (const language of representativeLanguages) {
			for (const value of values) {
				const formatted = Intl.NumberFormat(language, { useGrouping: true, maximumFractionDigits: 16 }).format(value)
				const parsed = formatted.toNumber(language)
				if (parsed !== value) {
					failures.push(`${language}: ${value} formatted as "${formatted}" parsed back as ${parsed}`)
				}
			}
		}

		expect(failures).toEqual([])
	})
})