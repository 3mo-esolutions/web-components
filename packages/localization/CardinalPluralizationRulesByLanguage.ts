import { type LanguageCode } from './LanguageCode.js'

type PluralizationRuleFunction = (count: number) => number

/**
 * Provides cardinal pluralization rules based on the Unicode Common Locale Data Repository.
 * @see http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
 */
export class CardinalPluralizationRulesByLanguage {
	private static readonly rules = new Map<LanguageCode, PluralizationRuleFunction>()

	static {
		CardinalPluralizationRulesByLanguage.add(() => 0, 'ay', 'bo', 'cgg', 'dz', 'id', 'ja', 'ka', 'kk', 'km', 'ko', 'ky', 'lo', 'ms', 'my', 'su', 'th', 'tt', 'ug', 'vi', 'zh')
		CardinalPluralizationRulesByLanguage.add(n => n > 1 ? 1 : 0, 'ak', 'am', 'br', 'fil', 'fa', 'fr', 'gu', 'ln', 'mfe', 'mg', 'pt', 'tg', 'ti', 'tr', 'uz')
		CardinalPluralizationRulesByLanguage.add(n => n !== 1 ? 1 : 0,
			'af', 'as', 'az', 'bg', 'bn', 'brx', 'ca', 'da', 'de', 'el', 'en', 'eo', 'es', 'et', 'eu', 'ff', 'fi', 'fo', 'gl', 'gu', 'ha', 'hi', 'hu', 'hy', 'it', 'kln', 'kn',
			'ku', 'lb', 'ml', 'mn', 'mr', 'nb', 'ne', 'nl', 'nn', 'or', 'pa', 'ps', 'pt', 'rm', 'rw', 'sd', 'se', 'si', 'so', 'sq', 'sv', 'sw', 'ta', 'te', 'tk', 'ur', 'yo'
		)
		CardinalPluralizationRulesByLanguage.add(n => n % 10 !== 1 || n % 100 === 11 ? 1 : 0, 'is')
		CardinalPluralizationRulesByLanguage.add(n => n !== 0 ? 1 : 0, 'jv')
		CardinalPluralizationRulesByLanguage.add(n => n === 1 || n % 10 === 1 ? 0 : 1, 'mk')
		CardinalPluralizationRulesByLanguage.add(n => n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2, 'be', 'bs', 'hr', 'lt')
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2, 'cs')
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2, 'pl')
		CardinalPluralizationRulesByLanguage.add(n => n % 10 === 1 && n % 100 !== 11 ? 0 : n !== 0 ? 1 : 2, 'lv')
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : (n === 0 || (n % 100 > 0 && n % 100 < 20) ? 1 : 2), 'ro')
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : (n === 2) ? 1 : (n !== 8 && n !== 11) ? 2 : 3, 'cy')
		CardinalPluralizationRulesByLanguage.add(n => (n === 1 || n === 11) ? 0 : (n === 2 || n === 12) ? 1 : (n > 2 && n < 20) ? 2 : 3, 'gd')
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : n === 2 ? 1 : n === 3 ? 2 : 3, 'kw')
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : n === 0 || (n % 100 > 1 && n % 100 < 11) ? 1 : (n % 100 > 10 && n % 100 < 20) ? 2 : 3, 'mt')
		CardinalPluralizationRulesByLanguage.add(n => n % 100 === 1 ? 1 : n % 100 === 2 ? 2 : n % 100 === 3 || n % 100 === 4 ? 3 : 0, 'sl')
		CardinalPluralizationRulesByLanguage.add(n => n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2, 'ru', 'sr', 'uk')
		CardinalPluralizationRulesByLanguage.add(n => (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2, 'sk')
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : n === 2 ? 1 : (n > 2 && n < 7) ? 2 : (n > 6 && n < 11) ? 3 : 4, 'ga')
		CardinalPluralizationRulesByLanguage.add(n => n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5, 'ar')
	}

	static get(languageCode: LanguageCode) {
		return CardinalPluralizationRulesByLanguage.rules.get(languageCode)
	}

	private static add(rule: PluralizationRuleFunction, ...languageCodes: Array<LanguageCode>) {
		languageCodes.forEach(languageCode => CardinalPluralizationRulesByLanguage.rules.set(languageCode, rule))
	}
}