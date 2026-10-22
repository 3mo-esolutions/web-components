import { Localizer } from './Localizer.js'
import { type Locale } from './LanguageCode.js'
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

	localize(...parameters: [parameters?: LocalizationParameters<Key>] | [locale: Locale, parameters?: LocalizationParameters<Key>]): LocalizedString<Key> {
		const [first, second] = parameters
		const locale = typeof first === 'string' || first instanceof Intl.Locale ? first : undefined
		const params = ((locale === undefined ? first : second) ?? {}) as LocalizationParameters<Key>
		// The whole locale, region and keywords included: the string reads its dictionary by the language and formats in the locale.
		return LocalizedString.get(this.key, locale ?? Localizer.locales.current, params)
	}
}

globalThis.t = LocalizableString.getAsString

declare global {
	var t: typeof LocalizableString.getAsString
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface LocalizableStringKeys { }
}
