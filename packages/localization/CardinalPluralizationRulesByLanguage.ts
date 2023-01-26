type PluralizationRuleFunction = (count: number) => number

/**
 * Provides cardinal pluralization rules based on the Unicode Common Locale Data Repository.
 * @see http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
 */
export class CardinalPluralizationRulesByLanguage {
	private static readonly rules = new Map<LanguageCode, PluralizationRuleFunction>()

	static {
		CardinalPluralizationRulesByLanguage.add(() => 0,
			LanguageCode.Aymara,
			LanguageCode.Tibetan,
			LanguageCode.Chiga,
			LanguageCode.Dzongkha,
			LanguageCode.Indonesian,
			LanguageCode.Japanese,
			LanguageCode.Georgian,
			LanguageCode.Kazakh,
			LanguageCode.Cambodian,
			LanguageCode.Korean,
			LanguageCode.Kirghiz,
			LanguageCode.Lao,
			LanguageCode.Malay,
			LanguageCode.Burmese,
			LanguageCode.Sundanese,
			LanguageCode.Thai,
			LanguageCode.Tatar,
			LanguageCode.Uighur,
			LanguageCode.Vietnamese,
			LanguageCode.Chinese,
		)
		CardinalPluralizationRulesByLanguage.add(n => n > 1 ? 1 : 0,
			LanguageCode.Akan,
			LanguageCode.Amharic,
			LanguageCode.Breton,
			LanguageCode.Filipino,
			LanguageCode.Farsi,
			LanguageCode.French,
			LanguageCode.Gujarati,
			LanguageCode.Lingala,
			LanguageCode.Morisyen,
			LanguageCode.Malagasy,
			LanguageCode.Portuguese,
			LanguageCode.Tajiki,
			LanguageCode.Tigrinya,
			LanguageCode.Turkish,
			LanguageCode.Uzbek,
		)
		CardinalPluralizationRulesByLanguage.add(n => n !== 1 ? 1 : 0,
			LanguageCode.Afrikaans,
			LanguageCode.Assamese,
			LanguageCode.Azerbaijani,
			LanguageCode.Bulgarian,
			LanguageCode.Bengali,
			LanguageCode.Bodo,
			LanguageCode.Catalan,
			LanguageCode.Danish,
			LanguageCode.German,
			LanguageCode.Greek,
			LanguageCode.English,
			LanguageCode.Esperanto,
			LanguageCode.Spanish,
			LanguageCode.Estonian,
			LanguageCode.Basque,
			LanguageCode.Peul,
			LanguageCode.Finnish,
			LanguageCode.Faroese,
			LanguageCode.Galician,
			LanguageCode.Gujarati,
			LanguageCode.Hausa,
			LanguageCode.Hindi,
			LanguageCode.Hungarian,
			LanguageCode.Armenian,
			LanguageCode.Italian,
			LanguageCode.Kalenjin,
			LanguageCode.Kannada,
			LanguageCode.Kurdish,
			LanguageCode.Luxembourgish,
			LanguageCode.Malayalam,
			LanguageCode.Mongolian,
			LanguageCode.Marathi,
			LanguageCode.Norwegian,
			LanguageCode.Nepali,
			LanguageCode.Dutch,
			LanguageCode.Nynorsk,
			LanguageCode.Oriya,
			LanguageCode.Punjabi,
			LanguageCode.Pashto,
			LanguageCode.Portuguese,
			LanguageCode.RaetoRomance,
			LanguageCode.Kinyarwanda,
			LanguageCode.Sindhi,
			LanguageCode.Sami,
			LanguageCode.Sinhalese,
			LanguageCode.Somali,
			LanguageCode.Albanian,
			LanguageCode.Swedish,
			LanguageCode.Swahili,
			LanguageCode.Tamil,
			LanguageCode.Telugu,
			LanguageCode.Turkmen,
			LanguageCode.Urdu,
			LanguageCode.Yoruba,
		)
		CardinalPluralizationRulesByLanguage.add(n => n % 10 !== 1 || n % 100 === 11 ? 1 : 0, LanguageCode.Icelandic)
		CardinalPluralizationRulesByLanguage.add(n => n !== 0 ? 1 : 0, LanguageCode.Javanese)
		CardinalPluralizationRulesByLanguage.add(n => n === 1 || n % 10 === 1 ? 0 : 1, LanguageCode.Macedonian)
		CardinalPluralizationRulesByLanguage.add(n => n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2,
			LanguageCode.Belarusian,
			LanguageCode.Bosnian,
			LanguageCode.Croatian,
			LanguageCode.Lithuanian,
		)
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2, LanguageCode.Czech)
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2, LanguageCode.Polish)
		CardinalPluralizationRulesByLanguage.add(n => n % 10 === 1 && n % 100 !== 11 ? 0 : n !== 0 ? 1 : 2, LanguageCode.Latvian)
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : (n === 0 || (n % 100 > 0 && n % 100 < 20) ? 1 : 2), LanguageCode.Romanian)
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : (n === 2) ? 1 : (n !== 8 && n !== 11) ? 2 : 3, LanguageCode.Welsh)
		CardinalPluralizationRulesByLanguage.add(n => (n === 1 || n === 11) ? 0 : (n === 2 || n === 12) ? 1 : (n > 2 && n < 20) ? 2 : 3, LanguageCode.Scottish)
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : n === 2 ? 1 : n === 3 ? 2 : 3, LanguageCode.Cornish)
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : n === 0 || (n % 100 > 1 && n % 100 < 11) ? 1 : (n % 100 > 10 && n % 100 < 20) ? 2 : 3, LanguageCode.Maltese)
		CardinalPluralizationRulesByLanguage.add(n => n % 100 === 1 ? 1 : n % 100 === 2 ? 2 : n % 100 === 3 || n % 100 === 4 ? 3 : 0, LanguageCode.Slovenian)
		CardinalPluralizationRulesByLanguage.add(n => n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2,
			LanguageCode.Russian,
			LanguageCode.Serbian,
			LanguageCode.Ukrainian,
		)
		CardinalPluralizationRulesByLanguage.add(n => (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2, LanguageCode.Slovak)
		CardinalPluralizationRulesByLanguage.add(n => n === 1 ? 0 : n === 2 ? 1 : (n > 2 && n < 7) ? 2 : (n > 6 && n < 11) ? 3 : 4, LanguageCode.Irish)
		CardinalPluralizationRulesByLanguage.add(n => n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5, LanguageCode.Arabic)
	}

	static get(languageCode: LanguageCode) {
		return CardinalPluralizationRulesByLanguage.rules.get(languageCode)
	}

	private static add(rule: PluralizationRuleFunction, ...languageCodes: Array<LanguageCode>) {
		languageCodes.forEach(languageCode => CardinalPluralizationRulesByLanguage.rules.set(languageCode, rule))
	}
}