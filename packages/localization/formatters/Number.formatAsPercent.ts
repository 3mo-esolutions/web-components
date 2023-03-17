import { Localizer } from '../Localizer.js'
import type { OptionsWithLanguage } from './OptionsWithLanguage.js'

type FormatAsPercentOptions = OptionsWithLanguage<Omit<Intl.NumberFormatOptions, 'style' | 'unit' | 'unitDisplay' | 'currency' | 'currencyDisplay' | 'currencySign'>>

Number.prototype.formatAsPercent = function (this: number, options?: FormatAsPercentOptions) {
	return Intl.NumberFormat(options?.language ?? Localizer.currentLanguage, {
		style: 'percent',
		useGrouping: false,
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
		...options,
	}).format(this / 100 || 0)
}

declare global {
	interface Number {
		formatAsPercent(options?: FormatAsPercentOptions): string
	}
}