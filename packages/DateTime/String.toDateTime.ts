import { Localizer, type Locale } from '@3mo/localization'
import { DateTime } from './DateTime.js'

String.prototype.toDateTime = function (this: string, language: Locale = Localizer.locales.current) {
	return DateTime.parseAsDateTime(this, language)
}

declare global {
	interface String {
		toDateTime(language?: Locale): DateTime | undefined
	}
}
