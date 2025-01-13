import { extractDateTimeFormatOptions } from './Date.format.js'
import type { FormatOptionsWithLanguage } from './OptionsWithLanguage.js'

type DateFormatOptions = FormatOptionsWithLanguage<Intl.DateTimeFormatOptions>

Date.prototype.formatAsTime = function (this: Date, ...options: DateFormatOptions) {
	const [language, opt] = extractDateTimeFormatOptions(this.calendarId, this.timeZoneId, options, { timeStyle: 'medium' })
	return Intl.DateTimeFormat(language, opt).format(this)
}

declare global {
	interface Date {
		formatAsTime(...options: DateFormatOptions): string
	}
}