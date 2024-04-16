import { Localizer, type LanguageCode } from '@3mo/localization'
import { DateTime } from './DateTime.js'

String.prototype.toDateTime = function (this: string, language = Localizer.currentLanguage) {
	return DateTime.parseAsDateTime(this, language)
}

declare global {
	interface String {
		toDateTime(language?: LanguageCode): DateTime | undefined
	}
}