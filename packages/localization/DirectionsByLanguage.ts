import './polyfills/Intl.Locale.js'
import { Localizer } from './Localizer.js'
import { type Locale } from './LanguageCode.js'

/** Provides direction for a given language code. */
export class DirectionsByLanguage {
	static {
		DirectionsByLanguage.updateAttributes()
		Localizer.locales.change.subscribe(() => DirectionsByLanguage.updateAttributes())
	}

	static get(locale: Locale = Localizer.locales.current) {
		try {
			return new Intl.Locale(locale).getTextInfo().direction ?? 'ltr'
		} catch {
			return 'ltr' as const
		}
	}

	static updateAttributes() {
		window?.document.body.setAttribute('lang', Localizer.locales.current.baseName)
		window?.document.body.setAttribute('dir', DirectionsByLanguage.get())
	}
}
