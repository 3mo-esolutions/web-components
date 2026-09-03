import { CardinalPluralizationRulesByLanguage } from './CardinalPluralizationRulesByLanguage.js'
import { type LanguageCode } from './LanguageCode.js'

describe('CardinalPluralizationRulesByLanguage', () => {
	it('should return undefined for a language without a rule', () => {
		expect(CardinalPluralizationRulesByLanguage.get('la')).toBeUndefined()
	})

	type RuleFamily = {
		readonly description: string
		readonly languages: Array<LanguageCode>
		readonly formByCount: Record<number, number>
	}

	const families: Array<RuleFamily> = [
		{
			description: 'a single form',
			languages: ['ja', 'zh', 'ko', 'th', 'vi', 'id'],
			formByCount: { 0: 0, 1: 0, 2: 0, 5: 0, 21: 0, 100: 0 },
		},
		{
			description: 'n ≠ 1',
			languages: ['en', 'de', 'nl', 'sv', 'es', 'it'],
			formByCount: { 0: 1, 1: 0, 2: 1, 11: 1, 21: 1, 100: 1 },
		},
		{
			description: 'n > 1',
			languages: ['fr', 'fa', 'tr'],
			formByCount: { 0: 0, 1: 0, 2: 1, 11: 1, 100: 1 },
		},
		{
			description: '1 / 2–4 / other',
			languages: ['cs', 'sk'],
			formByCount: { 0: 2, 1: 0, 2: 1, 4: 1, 5: 2, 22: 2 },
		},
		{
			description: 'the polish %10 rule',
			languages: ['pl'],
			formByCount: { 0: 2, 1: 0, 2: 1, 5: 2, 12: 2, 22: 1, 25: 2, 102: 1 },
		},
		{
			description: 'the east slavic %10 rule including the 11–14 exceptions',
			languages: ['ru', 'uk', 'sr'],
			formByCount: { 0: 2, 1: 0, 2: 1, 5: 2, 11: 2, 12: 2, 14: 2, 21: 0, 22: 1, 25: 2, 111: 2 },
		},
		{
			description: 'the arabic six forms',
			languages: ['ar'],
			formByCount: { 0: 0, 1: 1, 2: 2, 3: 3, 10: 3, 11: 4, 99: 4, 100: 5, 103: 3 },
		},
	]

	for (const { description, languages, formByCount } of families) {
		for (const language of languages) {
			it(`should map counts to the documented CLDR form index for ${description} in '${language}'`, () => {
				const rule = CardinalPluralizationRulesByLanguage.get(language)!

				for (const [count, form] of Object.entries(formByCount)) {
					expect(rule(Number(count))).withContext(`${language} · ${count}`).toBe(form)
				}
			})
		}
	}
})