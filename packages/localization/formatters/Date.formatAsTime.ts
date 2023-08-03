import { extractDateTimeFormatOptions } from './Date.format.js'
import type { OptionsWithLanguage } from './OptionsWithLanguage.js'

type DateFormatOptions = OptionsWithLanguage<Intl.DateTimeFormatOptions>

Date.prototype.formatAsTime = function (this: Date, options?: DateFormatOptions) {
	const [language, opt] = extractDateTimeFormatOptions(this.calendarId, this.timeZoneId, options, {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23',
		timeZoneName: 'shortOffset'
	})
	return Intl.DateTimeFormat(language, opt).format(this)
}

declare global {
	interface Date {
		formatAsTime(options?: DateFormatOptions): string
	}
}