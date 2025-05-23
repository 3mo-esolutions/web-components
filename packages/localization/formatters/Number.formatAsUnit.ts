import { extractFormatOptions, type FormatOptionsWithLanguage } from './OptionsWithLanguage.js'

type FormatAsUnitOptions = FormatOptionsWithLanguage<Omit<Intl.NumberFormatOptions, 'style' | 'currency' | 'currencyDisplay' | 'currencySign'>>

Number.prototype.formatAsUnit = function (this: number, unit: Unit, ...options: FormatAsUnitOptions) {
	const [language, explicitOptions] = extractFormatOptions(options)
	return this.format(language, {
		useGrouping: true,
		...explicitOptions,
		style: 'unit',
		unit
	})
}

type SingleUnit =
	| 'acre'
	| 'bit'
	| 'byte'
	| 'celsius'
	| 'centimeter'
	| 'day'
	| 'degree'
	| 'fahrenheit'
	| 'fluid-ounce'
	| 'foot'
	| 'gallon'
	| 'gigabit'
	| 'gigabyte'
	| 'gram'
	| 'hectare'
	| 'hour'
	| 'inch'
	| 'kilobit'
	| 'kilobyte'
	| 'kilogram'
	| 'kilometer'
	| 'liter'
	| 'megabit'
	| 'megabyte'
	| 'meter'
	| 'mile'
	| 'mile-scandinavian'
	| 'milliliter'
	| 'millimeter'
	| 'millisecond'
	| 'minute'
	| 'month'
	| 'ounce'
	| 'percent'
	| 'petabyte'
	| 'pound'
	| 'second'
	| 'stone'
	| 'terabit'
	| 'terabyte'
	| 'week'
	| 'yard'
	| 'year'

declare global {
	interface Number {
		formatAsUnit(unit: Unit, ...options: FormatAsUnitOptions): string
	}

	type Unit = SingleUnit | `${SingleUnit}-per-${SingleUnit}`
}