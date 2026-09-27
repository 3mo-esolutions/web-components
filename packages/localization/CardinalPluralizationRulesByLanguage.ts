import { type LanguageCode } from './LanguageCode.js'

type PluralizationRuleFunction = (count: number) => number

/** The order the Unicode Common Locale Data Repository lists plural categories in. */
const categoryOrder = ['zero', 'one', 'two', 'few', 'many', 'other'] as const

/**
 * Provides cardinal pluralization rules based on the Unicode Common Locale Data Repository.
 * @see http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
 */
export class CardinalPluralizationRulesByLanguage {
	private static readonly rules = new Map<LanguageCode, PluralizationRuleFunction>()

	static getCategories(language: LanguageCode) {
		const { pluralCategories } = new Intl.PluralRules(CardinalPluralizationRulesByLanguage.resolve(language)).resolvedOptions()
		// `pluralCategories` is deliberately unordered, so it cannot be indexed into directly.
		return categoryOrder.filter(category => pluralCategories.includes(category))
	}

	static get(language: LanguageCode) {
		if (!CardinalPluralizationRulesByLanguage.rules.has(language)) {
			const rules = new Intl.PluralRules(CardinalPluralizationRulesByLanguage.resolve(language))
			const categories = CardinalPluralizationRulesByLanguage.getCategories(language)
			CardinalPluralizationRulesByLanguage.rules.set(language, count => categories.indexOf(rules.select(count)))
		}
		return CardinalPluralizationRulesByLanguage.rules.get(language)!
	}

	private static resolve(language: LanguageCode) {
		return Intl.PluralRules.supportedLocalesOf(language).length > 0 ? language : 'en'
	}
}