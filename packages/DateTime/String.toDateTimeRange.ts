import { Localizer, type LanguageCode } from '@3mo/localization'
import { DateTimeRange } from './DateTimeRange.js'

String.prototype.toDateTimeRange = function (this: string, language = Localizer.currentLanguage) {
	return DateTimeRange.parse(this, language)
}

declare global {
	interface String {
		toDateTimeRange(language?: LanguageCode): DateTimeRange | undefined
	}
}