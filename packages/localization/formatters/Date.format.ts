import { Localizer } from '../Localizer.js'
import type { OptionsWithLanguage } from './OptionsWithLanguage.js'

type DateFormatOptions = OptionsWithLanguage<Intl.DateTimeFormatOptions>

export function extractDateTimeOptions(options?: DateFormatOptions) {
	const { language, ...otherOptions } = options ?? {}
	const isEmpty = Object.keys(otherOptions).length === 0
	return [language ?? Localizer.currentLanguage, isEmpty ? undefined : otherOptions] as const
}

function getFormatter(options?: DateFormatOptions) {
	const [language, otherOptions] = extractDateTimeOptions(options)
	return Intl.DateTimeFormat(language, otherOptions ?? {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		timeZoneName: 'shortOffset'
	})
}

Date.prototype.format = function (this: Date, options?: DateFormatOptions) {
	return getFormatter(options).format(this)
}

Date.prototype.formatToParts = function (this: Date, options?: DateFormatOptions) {
	return getFormatter(options).formatToParts(this)
}

declare global {
	interface Date {
		format(options?: DateFormatOptions): string
		formatToParts(options?: DateFormatOptions): Intl.DateTimeFormatPart[]
	}
}