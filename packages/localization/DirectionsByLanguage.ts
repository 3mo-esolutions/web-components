import './polyfills/Intl.Locale.js'
import { Localizer } from './Localizer.js'
import { type LanguageCode } from './LanguageCode.js'

/** Provides direction for a given language code. */
export class DirectionsByLanguage {
	static {
		DirectionsByLanguage.updateAttributes()
		Localizer.languages.change.subscribe(() => DirectionsByLanguage.updateAttributes())
	}

	static get(language: LanguageCode = Localizer.languages.current) {
		try {
			return new Intl.Locale(language).getTextInfo().direction ?? 'ltr'
		} catch {
			return 'ltr' as const
		}
	}

	static updateAttributes() {
		window?.document.body.setAttribute('lang', Localizer.languages.current)
		window?.document.body.setAttribute('dir', DirectionsByLanguage.get())
	}
}
