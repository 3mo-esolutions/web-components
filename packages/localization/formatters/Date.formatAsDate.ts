import { extractDateTimeFormatOptions } from './Date.format.js'
import type { OptionsWithLanguage } from './OptionsWithLanguage.js'

type DateFormatOptions = OptionsWithLanguage<Intl.DateTimeFormatOptions>

Date.prototype.formatAsDate = function (this: Date, options?: DateFormatOptions) {
	const [language, opt] = extractDateTimeFormatOptions(this.calendarId, this.timeZoneId, options, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})
	return Intl.DateTimeFormat(language, opt).format(this)
}

declare global {
	interface Date {
		formatAsDate(options?: DateFormatOptions): string
	}
}