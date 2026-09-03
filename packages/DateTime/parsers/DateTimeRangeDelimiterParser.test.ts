import { type LanguageCode } from '@3mo/localization'
import { DateTime } from '../DateTime.js'
import { DateTimeRangeDelimiterParser } from './DateTimeRangeDelimiterParser.js'
import '../index.js'

describe('DateTimeRangeDelimiterParser', () => {
	const startInstant = Date.parse('2020-06-10T00:00:00.000Z')
	const endInstant = Date.parse('2020-06-20T00:00:00.000Z')
	const start = '2020-06-10T00:00:00.000Z'
	const end = '2020-06-20T00:00:00.000Z'

	it('should split on the canonical delimiters', () => {
		const parser = new DateTimeRangeDelimiterParser('en')

		for (const text of [`${start} – ${end}`, `${start}–${end}`, `${start} ~ ${end}`, `${start}~${end}`]) {
			const range = parser.parse(text)
			expect(range?.start?.valueOf()).withContext(text).toBe(startInstant)
			expect(range?.end?.valueOf()).withContext(text).toBe(endInstant)
		}
	})

	const delimiterByLanguage: ReadonlyArray<readonly [LanguageCode, string]> = [['en', '–'], ['de', '–'], ['fa', 'تا']]

	for (const [language, delimiter] of delimiterByLanguage) {
		it(`should split on the language's own formatted range delimiter (${language})`, () => {
			const range = new DateTimeRangeDelimiterParser(language).parse(`${start} ${delimiter} ${end}`)

			expect(range?.start?.valueOf()).toBe(startInstant)
			expect(range?.end?.valueOf()).toBe(endInstant)
		})
	}

	it('should parse each side through the full DateTime parser pipeline', () => {
		const referenceDate = DateTime.from(startInstant, 'gregory', 'UTC')

		const range = new DateTimeRangeDelimiterParser('en').parse('+1 ~ +5', referenceDate)

		expect(range?.start?.valueOf()).toBe(Date.parse('2020-06-11T00:00:00.000Z'))
		expect(range?.end?.valueOf()).toBe(Date.parse('2020-06-15T00:00:00.000Z'))
	})
})