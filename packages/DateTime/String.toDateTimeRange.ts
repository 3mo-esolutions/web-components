import { Localizer, type Locale } from '@3mo/localization'
import { DateTimeRange } from './DateTimeRange.js'

String.prototype.toDateTimeRange = function (this: string, language: Locale = Localizer.locales.current) {
	return DateTimeRange.parse(this, language)
}

declare global {
	interface String {
		toDateTimeRange(language?: Locale): DateTimeRange | undefined
	}
}
