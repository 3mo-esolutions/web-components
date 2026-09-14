import memoizeFormatConstructor from 'intl-format-cache'
import { extractFormatOptions, type FormatOptionsWithLanguage } from './OptionsWithLanguage.js'

type DateFormatOptions = FormatOptionsWithLanguage<Intl.DateTimeFormatOptions>

// @ts-ignore The default export is the function itself
const memoized = memoizeFormatConstructor(Intl.DateTimeFormat)

/** Constructing a formatter costs far more than using one, so they are kept and reused. */
export const getDateTimeFormatter = memoized as (language: string, options?: Intl.DateTimeFormatOptions) => Intl.DateTimeFormat

const getFormatter = getDateTimeFormatter

export function extractDateTimeFormatOptions(calendarId?: string, timeZoneId?: string, explicitOptions?: DateFormatOptions, defaultOptions?: Intl.DateTimeFormatOptions) {
	const [language, otherExplicitOptions] = extractFormatOptions(explicitOptions)
	return [language, {
		calendar: calendarId,
		timeZone: timeZoneId,
		...(otherExplicitOptions ?? defaultOptions)
	}] as const
}

const defaultOptions: Intl.DateTimeFormatOptions = {
	dateStyle: 'medium',
	timeStyle: 'medium',
}

Date.prototype.format = function (this: Date, ...options: DateFormatOptions) {
	const [language, opt] = extractDateTimeFormatOptions(this.calendarId, this.timeZoneId, options, defaultOptions)
	return getFormatter(language, opt).format(this)
}

Date.prototype.formatToParts = function (this: Date, ...options: DateFormatOptions) {
	const [language, opt] = extractDateTimeFormatOptions(this.calendarId, this.timeZoneId, options, defaultOptions)
	return getFormatter(language, opt).formatToParts(this)
}

declare global {
	interface Date {
		readonly calendarId?: string
		readonly timeZoneId?: string
		format(...options: DateFormatOptions): string
		formatToParts(...options: DateFormatOptions): Intl.DateTimeFormatPart[]
	}
}