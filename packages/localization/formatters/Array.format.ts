import { extractFormatOptions, type FormatOptionsWithLanguage } from './OptionsWithLanguage.js'

function prepareFormatting(array: Array<unknown>, options: FormatOptionsWithLanguage<Intl.ListFormatOptions>): readonly [stringArray: Array<string>, listFormatter: Intl.ListFormat] {
	const stringArray = array
		.map(e => e?.toString())
		.filter(e => typeof e === 'string') as Array<string>
	const extractedOptions = extractFormatOptions(options)
	const listFormatter = new Intl.ListFormat(...extractedOptions)
	return [stringArray, listFormatter] as const
}

Array.prototype.format = function (...options: FormatOptionsWithLanguage<Intl.ListFormatOptions>) {
	const [stringArray, listFormatter] = prepareFormatting(this, options)
	return listFormatter.format(stringArray)
}

Array.prototype.formatToParts = function (...options: FormatOptionsWithLanguage<Intl.ListFormatOptions>) {
	const [stringArray, listFormatter] = prepareFormatting(this, options)
	return listFormatter.formatToParts(stringArray)
}

type TypedOptions = FormatOptionsWithLanguage<Omit<Intl.ListFormatOptions, 'type'>>

Array.prototype.formatAsConjunction = function <T>(this: Array<T>, ...options: TypedOptions) {
	const [language, explicitOptions] = extractFormatOptions(options)
	return this.format({ language, ...explicitOptions, type: 'conjunction' })
}

Array.prototype.formatAsDisjunction = function <T>(this: Array<T>, ...options: TypedOptions) {
	const [language, explicitOptions] = extractFormatOptions(options)
	return this.format({ language, ...explicitOptions, type: 'disjunction' })
}

Array.prototype.formatAsUnit = function <T>(this: Array<T>, ...options: TypedOptions) {
	const [language, explicitOptions] = extractFormatOptions(options)
	return this.format({ language, ...explicitOptions, type: 'unit' })
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface Array<T> {
		format(...options: FormatOptionsWithLanguage<Intl.ListFormatOptions>): string
		formatToParts(...options: FormatOptionsWithLanguage<Intl.ListFormatOptions>): ReturnType<Intl.ListFormat['formatToParts']>
		formatAsConjunction(...options: TypedOptions): string
		formatAsDisjunction(...options: TypedOptions): string
		formatAsUnit(...options: TypedOptions): string
	}
}