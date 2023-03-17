import { Localizer } from '../Localizer.js'
import type { OptionsWithLanguage } from './OptionsWithLanguage.js'

type NumberFormatOptions = OptionsWithLanguage<Intl.NumberFormatOptions>

Number.prototype.format = function(this: number, options?: NumberFormatOptions) {
	return Intl.NumberFormat(options?.language ?? Localizer.currentLanguage, {
		maximumFractionDigits: 16,
		minimumFractionDigits: 0,
		useGrouping: false,
		...options,
	}).format(this || 0)
}

declare global {
	interface Number {
		format(options?: NumberFormatOptions): string
	}
}