import { Localizer } from '../Localizer.js'
import { Currency, CurrencyCode } from './Currency.js'
import type { OptionsWithLanguage } from './OptionsWithLanguage.js'

type FormatAsCurrencyOptions = OptionsWithLanguage<Omit<Intl.NumberFormatOptions, 'style' | 'currency' | 'unit' | 'unitDisplay'>>

Number.prototype.formatAsCurrency = function (this: number, ...args:
	| [currency: Currency, options?: FormatAsCurrencyOptions]
	| [currencyCode: string, options?: FormatAsCurrencyOptions]
	| [options?: FormatAsCurrencyOptions]
) {
	const hasCurrency = args[0] instanceof Currency || typeof args[0] === 'string'
	const [currencyOrCode, options] = [
		hasCurrency ? args[0] as Currency | string : undefined,
		hasCurrency ? args[1] : args[0] as FormatAsCurrencyOptions | undefined,
	]

	const currency = !currencyOrCode ? undefined : currencyOrCode instanceof Currency ? currencyOrCode : new Currency(currencyOrCode as CurrencyCode)

	return Intl.NumberFormat(options?.language ?? Localizer.currentLanguage, {
		style: currency ? 'currency' : 'decimal',
		currency: currency?.code,
		useGrouping: true,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		...options,
	}).format(this || 0)
}

declare global {
	interface Number {
		formatAsCurrency(options?: FormatAsCurrencyOptions): string
		formatAsCurrency(currency: Currency, options?: FormatAsCurrencyOptions): string
		formatAsCurrency(currencyCode: string, options?: FormatAsCurrencyOptions): string
	}
}