import { Localizer } from './Localizer.js'
import { type LanguageCode } from './LanguageCode.js'
import { LocalizedString } from './LocalizedString.js'

type ExtractProperties<T extends LocalizableStringKey> =
	T extends `${string}${'${'}${infer P}${'}'}${infer Rest}` ? P | ExtractProperties<Rest> : never

type ExtractKey<TProperty extends string> =
	TProperty extends `${infer Key}:${string}` ? Key : TProperty

type ExtractType<T extends string> =
	T extends `${string}:${infer Type}:${string}`
		? GetMatchedType<Type>
		: T extends `${string}:${infer Type}`
			? GetMatchedType<Type>
			: GetMatchedType<''>

type GetMatchedType<T extends string> = T extends keyof LocalizationFormatterTypeMap
	? LocalizationFormatterTypeMap[T]
	: string

export interface LocalizationFormatterTypeMap {
	[LocalizedString.pluralityIdentityType]: number
	'string': string
	'number': number
	'Date': Date
	'': string
}

export type LocalizationParameters<T extends LocalizableStringKey> = {
	[P in ExtractProperties<T> as ExtractKey<P>]: ExtractType<P>
}

export type LocalizableStringKey = keyof LocalizableStringKeys | (string & {})

export class LocalizableString<Key extends LocalizableStringKey> {
	static readonly cache = new Map<string, LocalizableString<any>>()

	static get<Key extends LocalizableStringKey>(key: Key): LocalizableString<Key> {
		if (!LocalizableString.cache.has(key)) {
			LocalizableString.cache.set(key, new LocalizableString(key))
		}
		return LocalizableString.cache.get(key)!
	}

	static getAsString<Key extends LocalizableStringKey>(key: Key, parameters?: LocalizationParameters<Key>) {
		return LocalizableString.get(key)?.localize(parameters) as unknown as string
	}

	private constructor(readonly key: Key) { }

	localize(...parameters: [parameters?: LocalizationParameters<Key>] | [language: LanguageCode, parameters?: LocalizationParameters<Key>]): LocalizedString<Key> {
		const language = typeof parameters[0] === 'string' ? parameters[0] : Localizer.languages.current
		const params = (typeof parameters[0] === 'object' ? parameters[0] : parameters[1] ?? {}) as LocalizationParameters<Key>
		return LocalizedString.get(this.key, language, params)
	}
}

globalThis.t = LocalizableString.getAsString

declare global {
	// eslint-disable-next-line no-var
	var t: typeof LocalizableString.getAsString
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface LocalizableStringKeys { }
}