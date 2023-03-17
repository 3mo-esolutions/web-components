import { LanguageCode } from '../LanguageCode.js'

export type OptionsWithLanguage<T> = T & {
	readonly language?: LanguageCode
}