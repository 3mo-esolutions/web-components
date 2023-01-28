import { Localizer } from './Localizer.js'

type Direction = 'ltr' | 'rtl'

/** Provides direction for a given language code. */
export class DirectionsByLanguage {
	private static readonly directions = new Map<LanguageCode, Direction>()

	static {
		DirectionsByLanguage.add('rtl',
			LanguageCode.Arabic,
			LanguageCode.Armenian,
			LanguageCode.Azerbaijani,
			LanguageCode.Farsi,
			LanguageCode.Hebrew,
			LanguageCode.Kurdish,
			LanguageCode.Maldivian,
			LanguageCode.Urdu,
		)
	}

	static {
		DirectionsByLanguage.updateLanguage()
	}

	static get(languageCode: LanguageCode) {
		return DirectionsByLanguage.directions.get(languageCode) ?? 'ltr'
	}

	private static updateLanguage() {
		window.document.body.setAttribute('lang', Localizer.currentLanguage)
		window.document.body.setAttribute('dir', DirectionsByLanguage.get(Localizer.currentLanguage))
	}

	private static add(direction: Direction, ...languageCodes: Array<LanguageCode>) {
		languageCodes.forEach(languageCode => DirectionsByLanguage.directions.set(languageCode, direction))
	}
}