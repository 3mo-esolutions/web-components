import { type Locale } from '../LanguageCode.js'
import { Localizer } from '../Localizer.js'

export type FormatOptionsWithLanguage<T> =
	| [options?: T & { readonly language?: Locale }]
	| [language: Locale, options?: T]

export function extractFormatOptions<T>(options: FormatOptionsWithLanguage<T> | undefined): [language: string, explicitOptions?: T | undefined] {
	let language: Locale | undefined
	let explicitOptions: T | undefined

	if (options?.length === 1) {
		if (typeof options[0] === 'string' || options[0] instanceof Intl.Locale) {
			language = options[0]
		} else {
			explicitOptions = { ...options[0] } as T
			if (options[0] && 'language' in options[0]) {
				language = options[0].language
				delete (explicitOptions as any).language
			}
		}
	}

	if (options?.length === 2) {
		[language, explicitOptions] = options
	}

	return [
		// A tag rather than an `Intl.Locale`, as the formatters are cached by it.
		String(language ?? Localizer.locales.current),
		Object.keys(explicitOptions ?? {}).length === 0 ? undefined : explicitOptions,
	]
}
