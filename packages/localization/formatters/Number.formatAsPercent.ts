import { extractFormatOptions, type FormatOptionsWithLanguage } from './OptionsWithLanguage.js'

type FormatAsPercentOptions = FormatOptionsWithLanguage<Omit<Intl.NumberFormatOptions, 'style' | 'unit' | 'unitDisplay' | 'currency' | 'currencyDisplay' | 'currencySign'>>

Number.prototype.formatAsPercent = function (this: number, ...options: FormatAsPercentOptions) {
	const [language, explicitOptions] = extractFormatOptions(options)
	return Intl.NumberFormat(language, {
		style: 'percent',
		useGrouping: false,
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
		...explicitOptions,
	}).format(this / 100 || 0)
}

declare global {
	interface Number {
		formatAsPercent(...options: FormatAsPercentOptions): string
	}
}