import { type LanguageCode } from '../LanguageCode.js'
import { Localizer } from '../Localizer.js'

export type FormatOptionsWithLanguage<T> =
	| [options?: T & { readonly language?: LanguageCode }]
	| [language: LanguageCode, options?: T]

export function extractFormatOptions<T>(options: FormatOptionsWithLanguage<T> | undefined): [language?: LanguageCode, explicitOptions?: T | undefined] {
	const defaultLanguage = Localizer.currentLanguage
	let language: LanguageCode | undefined
	let explicitOptions: T | undefined

	if (options?.length === 1) {
		if (typeof options[0] === 'string') {
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
		language ?? defaultLanguage,
		Object.keys(explicitOptions ?? {}).length === 0 ? undefined : explicitOptions
	]
}