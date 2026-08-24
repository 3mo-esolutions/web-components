import { type LanguageCode } from '../LanguageCode.js'

/** Languages whose CLDR `minimumGroupingDigits` is 2, so that four-digit numbers render ungrouped. */
const minimumGroupingDigitsTwoLanguages: Array<LanguageCode> = ['es', 'it', 'pl', 'hu', 'bg', 'et', 'lv', 'sl', 'sq', 'be', 'hy', 'ka']

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
	// out as '' and `new RegExp('\')` threw a SyntaxError before any parsing happened.
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
})