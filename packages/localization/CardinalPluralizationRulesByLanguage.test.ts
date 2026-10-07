import { CardinalPluralizationRulesByLanguage } from './CardinalPluralizationRulesByLanguage.js'
import { type LanguageCode } from './LanguageCode.js'

describe('CardinalPluralizationRulesByLanguage', () => {
	it('should order the categories as the repository does rather than as the engine reports them', () => {
		// Chrome reports 'uk' canonically while Firefox reports it alphabetically, so the index must not come from the engine's order.
		expect(CardinalPluralizationRulesByLanguage.getCategories('uk')).toEqual(['one', 'few', 'many', 'other'])
		expect(CardinalPluralizationRulesByLanguage.getCategories('ar')).toEqual(['zero', 'one', 'two', 'few', 'many', 'other'])
	})

	it('should fall back to english for a language the repository has no data for', () => {
		// Without the fallback these would follow whichever locale the runtime defaults to.
		// Only codes both engines agree they have no data for can be asserted on: Firefox ships root rules for 'qu', 'rw' and 'tt' while Chrome does not.
		for (const language of ['la', 'mdv'] as Array<LanguageCode>) {
			expect(CardinalPluralizationRulesByLanguage.getCategories(language)).toEqual(['one', 'other'])
			expect(CardinalPluralizationRulesByLanguage.get(language)(1)).toBe(0)
			expect(CardinalPluralizationRulesByLanguage.get(language)(2)).toBe(1)
		}
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
			languages: ['en', 'de', 'nl', 'sv'],
			formByCount: { 0: 1, 1: 0, 2: 1, 11: 1, 21: 1, 100: 1 },
		},
		{
			description: 'n ≠ 1 with a separate form for millions',
			languages: ['es', 'it', 'ca'],
			formByCount: { 0: 2, 1: 0, 2: 2, 11: 2, 100: 2, 1_000_000: 1 },
		},
		{
			description: 'n > 1 with a separate form for millions',
			languages: ['fr', 'pt'],
			formByCount: { 0: 0, 1: 0, 2: 2, 11: 2, 100: 2, 1_000_000: 1 },
		},
		{
			description: 'n > 1',
			languages: ['fa'],
			formByCount: { 0: 0, 1: 0, 2: 1, 11: 1, 100: 1 },
		},
		{
			description: '1 / 2–4 / other',
			languages: ['cs', 'sk'],
			formByCount: { 0: 3, 1: 0, 2: 1, 4: 1, 5: 3, 22: 3 },
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
		{
			description: 'a dual form',
			languages: ['he', 'se'],
			formByCount: { 0: 2, 1: 0, 2: 1, 3: 2, 11: 2, 101: 2 },
		},
		{
			description: 'the welsh six forms',
			languages: ['cy'],
			formByCount: { 0: 0, 1: 1, 2: 2, 3: 3, 6: 4, 7: 5, 11: 5 },
		},
	]

	for (const { description, languages, formByCount } of families) {
		for (const language of languages) {
			it(`should map counts to the documented CLDR form index for ${description} in '${language}'`, () => {
				const rule = CardinalPluralizationRulesByLanguage.get(language)

				for (const [count, form] of Object.entries(formByCount)) {
					expect(rule(Number(count)), `${language} · ${count}`).toBe(form)
				}
			})
		}
	}
})
