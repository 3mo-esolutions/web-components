import { Currency, type CurrencyCode } from './Currency.js'
import { extractFormatOptions, type FormatOptionsWithLanguage } from './OptionsWithLanguage.js'

type FormatAsCurrencyOptions = FormatOptionsWithLanguage<Omit<Intl.NumberFormatOptions, 'style' | 'currency' | 'unit' | 'unitDisplay'>>

Number.prototype.formatAsCurrency = function (this: number, ...[currencyOrCode, ...options]:
	| [currency: Currency, ...options: FormatAsCurrencyOptions]
	| [currencyCode: string | undefined, ...options: FormatAsCurrencyOptions]
) {
	const currency = !currencyOrCode ? undefined : currencyOrCode instanceof Currency ? currencyOrCode : new Currency(currencyOrCode as CurrencyCode)
	const [language, explicitOptions] = extractFormatOptions(options)
	return this.format(language, {
		useGrouping: true,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		...explicitOptions,
		style: currency ? 'currency' : 'decimal',
		currency: currency?.code,
	})
}

declare global {
	interface Number {
		formatAsCurrency(currencyCode: string | undefined, ...options: FormatAsCurrencyOptions): string
		formatAsCurrency(currency: Currency, ...options: FormatAsCurrencyOptions): string
	}
}