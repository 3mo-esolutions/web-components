import { Localizer } from './Localizer.js'
import { type LanguageCode } from './LanguageCode.js'

type Direction = 'ltr' | 'rtl'

/** Provides direction for a given language code. */
export class DirectionsByLanguage {
	private static readonly directions = new Map<LanguageCode, Direction>()

	static {
		DirectionsByLanguage.add('rtl', 'ar', 'hy', 'az', 'fa', 'he', 'ku', 'mdv', 'ur')
	}

	static {
		DirectionsByLanguage.updateAttributes()
		Localizer.languageChange.subscribe(() => DirectionsByLanguage.updateAttributes())
	}

	static get(language = Localizer.currentLanguage) {
		return DirectionsByLanguage.directions.get(language) ?? 'ltr'
	}

	static updateAttributes() {
		window?.document.body.setAttribute('lang', Localizer.currentLanguage)
		window?.document.body.setAttribute('dir', DirectionsByLanguage.get())
	}

	private static add(direction: Direction, ...languageCodes: Array<LanguageCode>) {
		languageCodes.forEach(languageCode => DirectionsByLanguage.directions.set(languageCode, direction))
	}
}