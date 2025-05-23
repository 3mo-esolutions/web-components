import { extractFormatOptions, type FormatOptionsWithLanguage } from './OptionsWithLanguage.js'

type FormatAsPercentOptions = FormatOptionsWithLanguage<Omit<Intl.NumberFormatOptions, 'style' | 'unit' | 'unitDisplay' | 'currency' | 'currencyDisplay' | 'currencySign'>>

Number.prototype.formatAsPercent = function (this: number, ...options: FormatAsPercentOptions) {
	const [language, explicitOptions] = extractFormatOptions(options)
	return (this / 100).format(language, {
		useGrouping: false,
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
		...explicitOptions,
		style: 'percent',
	})
}

declare global {
	interface Number {
		formatAsPercent(...options: FormatAsPercentOptions): string
	}
}