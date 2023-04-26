import { extractDateTimeOptions } from './Date.format.js'
import type { OptionsWithLanguage } from './OptionsWithLanguage.js'

type DateFormatOptions = OptionsWithLanguage<Intl.DateTimeFormatOptions>

Date.prototype.formatAsTime = function (this: Date, options?: DateFormatOptions) {
	const [language, otherOptions] = extractDateTimeOptions(options)
	return Intl.DateTimeFormat(language, otherOptions ?? {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		timeZoneName: 'shortOffset'
	}).format(this)
}

declare global {
	interface Date {
		formatAsTime(options?: DateFormatOptions): string
	}
}