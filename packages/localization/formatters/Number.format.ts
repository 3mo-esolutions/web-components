import memoizeFormatConstructor from 'intl-format-cache'
import { Localizer } from '../Localizer.js'
import { extractFormatOptions, type FormatOptionsWithLanguage } from './OptionsWithLanguage.js'

type NumberFormatOptions = FormatOptionsWithLanguage<Intl.NumberFormatOptions>

// @ts-ignore The default export is the function itself
const getFormatter = memoizeFormatConstructor(Intl.NumberFormat)

Number.prototype.format = function (this: number, ...options: NumberFormatOptions) {
	const [language, explicitOptions] = extractFormatOptions(options)
	return getFormatter(language ?? Localizer.languages.current, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 16,
		useGrouping: false,
		...explicitOptions,
	}).format(this || 0)
}

declare global {
	interface Number {
		format(...options: NumberFormatOptions): string
	}
}