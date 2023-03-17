import { Localizer } from './Localizer.js'
import { LanguageCode } from './LanguageCode.js'

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
		DirectionsByLanguage.updateAttributes()
		Localizer.languageChange.subscribe(() => DirectionsByLanguage.updateAttributes())
	}

	static get(languageCode: LanguageCode) {
		return DirectionsByLanguage.directions.get(languageCode) ?? 'ltr'
	}

	static updateAttributes() {
		window.document.body.setAttribute('lang', Localizer.currentLanguage)
		window.document.body.setAttribute('dir', DirectionsByLanguage.get(Localizer.currentLanguage))
	}

	private static add(direction: Direction, ...languageCodes: Array<LanguageCode>) {
		languageCodes.forEach(languageCode => DirectionsByLanguage.directions.set(languageCode, direction))
	}
}