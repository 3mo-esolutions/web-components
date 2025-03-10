import { extractDateTimeFormatOptions } from './Date.format.js'
import type { FormatOptionsWithLanguage } from './OptionsWithLanguage.js'

type DateFormatOptions = FormatOptionsWithLanguage<
	Omit<Intl.DateTimeFormatOptions, 'timeStyle' | 'hourCycle' | 'hour12' | 'dayPeriod' | 'hour' | 'minute' | 'second'>
>

Date.prototype.formatAsDate = function (this: Date, ...options: DateFormatOptions) {
	const [language, opt] = extractDateTimeFormatOptions(this.calendarId, this.timeZoneId, options, { dateStyle: 'medium' })
	return Intl.DateTimeFormat(language, opt).format(this)
}

declare global {
	interface Date {
		formatAsDate(...options: DateFormatOptions): string
	}
}