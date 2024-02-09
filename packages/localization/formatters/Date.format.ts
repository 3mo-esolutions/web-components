import { extractFormatOptions, type FormatOptionsWithLanguage } from './OptionsWithLanguage.js'

type DateFormatOptions = FormatOptionsWithLanguage<Intl.DateTimeFormatOptions>

export function extractDateTimeFormatOptions(calendarId?: string, timeZoneId?: string, explicitOptions?: DateFormatOptions, defaultOptions?: Intl.DateTimeFormatOptions) {
	const [language, otherExplicitOptions] = extractFormatOptions(explicitOptions)
	return [language, {
		calendar: calendarId,
		timeZone: timeZoneId,
		...(otherExplicitOptions ?? defaultOptions)
	}] as const
}

const defaultOptions: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hourCycle: 'h23',
	timeZoneName: 'shortOffset'
}

Date.prototype.format = function (this: Date, ...options: DateFormatOptions) {
	const [language, opt] = extractDateTimeFormatOptions(this.calendarId, this.timeZoneId, options, defaultOptions)
	return Intl.DateTimeFormat(language, opt).format(this)
}

Date.prototype.formatToParts = function (this: Date, ...options: DateFormatOptions) {
	const [language, opt] = extractDateTimeFormatOptions(this.calendarId, this.timeZoneId, options, defaultOptions)
	return Intl.DateTimeFormat(language, opt).formatToParts(this)
}

declare global {
	interface Date {
		readonly calendarId?: string
		readonly timeZoneId?: string
		format(...options: DateFormatOptions): string
		formatToParts(...options: DateFormatOptions): Intl.DateTimeFormatPart[]
	}
}