import { extractDateTimeOptions } from './DateTime.format.js'
import type { OptionsWithLanguage } from './OptionsWithLanguage.js'

type DateFormatOptions = OptionsWithLanguage<Intl.DateTimeFormatOptions>

Date.prototype.formatAsDate = function (this: Date, options?: DateFormatOptions) {
	const [language, otherOptions] = extractDateTimeOptions(options)
	return Intl.DateTimeFormat(language, otherOptions ?? {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(this)
}

declare global {
	interface Date {
		formatAsDate(options?: DateFormatOptions): string
	}
}