import { Localizer } from '../Localizer.js'
import { extractFormatOptions, type FormatOptionsWithLanguage } from './OptionsWithLanguage.js'

type NumberFormatOptions = FormatOptionsWithLanguage<Intl.NumberFormatOptions>

Number.prototype.format = function (this: number, ...options: NumberFormatOptions) {
	const [language, explicitOptions] = extractFormatOptions(options)
	return Intl.NumberFormat(language ?? Localizer.languages.current, {
		maximumFractionDigits: 16,
		minimumFractionDigits: 0,
		useGrouping: false,
		...explicitOptions,
	}).format(this || 0)
}

declare global {
	interface Number {
		format(...options: NumberFormatOptions): string
	}
}