import { Localizer } from './Localizer.js'
import { CardinalPluralizationRulesByLanguage } from './CardinalPluralizationRulesByLanguage.js'

type ExtractProperties<T extends string> =
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

interface LocalizationFormatterTypeMap {
	[LocalizableString.pluralityIdentityType]: number
	'string': string
	'number': number
	'Date': Date
	'': string
}

type LocalizationParameters<T extends string> = {
	[P in ExtractProperties<T> as ExtractKey<P>]: ExtractType<P>
}

export class LocalizableString<Key extends string> {
	static readonly defaultLanguage = 'en'
	static readonly pluralityIdentityType = 'pluralityNumber'
	private static readonly regex = /\${(.+?)(?::(.+?))?}/g

	static get<Key extends string>(key: Key, parameters?: LocalizationParameters<Key>) {
		return new LocalizableString<Key>(key, parameters)
	}

	static getAsString<Key extends string>(key: Key, parameters?: LocalizationParameters<Key>) {
		return LocalizableString.get(key, parameters) as unknown as string
	}

	private constructor(readonly key: Key, readonly parameters?: LocalizationParameters<Key>) { }

	[Symbol.toPrimitive]() {
		return this.localize()
	}

	toString(...parameters: Parameters<typeof this.localize>) {
		return this.localize(...parameters)
	}

	localize(language = Localizer.languages.current, parameters = this.parameters) {
		const languageDictionary = Localizer.dictionaries.get(language)

		if (language !== LocalizableString.defaultLanguage && !languageDictionary.has(language)) {
			/* eslint-disable-next-line no-console */
			console.warn(`[Localizer] No "${language}" localization found for "${this.key}".`)
		}

		const matchedParameters = [...this.key.matchAll(LocalizableString.regex)]
			.map(([group, key, type]) => ({ group, key, type }))

		const replace = (text: string, parameterKey: string, parameterValue: string) => {
			const match = matchedParameters.find(p => p.key === parameterKey)
			return !match?.group ? text : text
				.replace(match.group, `\${${match.key}}`)
				.replace(
					`\${${match.key}}`,
					typeof (parameterValue as any)?.format === 'function'
						? (parameterValue as any).format(language)
						: parameterValue
				)
		}

		const replaceAll = (text: string) => {
			return matchedParameters.reduce((acc, p) => replace(acc, p.key!, (parameters as any)[p.key!]), text)
		}

		const localizationOrLocalizations = languageDictionary.get(this.key) ?? this.key
		if (!Array.isArray(localizationOrLocalizations)) {
			return replaceAll(localizationOrLocalizations)
		}
		const pluralityIndexParameterKey = matchedParameters.find(p => p.type === LocalizableString.pluralityIdentityType)?.key
		const pluralityValue = !pluralityIndexParameterKey ? 0 : (parameters as any)[pluralityIndexParameterKey] || 0
		const pluralityIndex = CardinalPluralizationRulesByLanguage.get(language)?.(pluralityValue) ?? 0
		return replaceAll(localizationOrLocalizations[pluralityIndex] as string)
	}
}

globalThis.t = LocalizableString.getAsString

declare global {
	// eslint-disable-next-line no-var
	var t: typeof LocalizableString.getAsString

	// namespace LocalizableString {
	// 	type LocalizationProvider<K extends keyof LocalizationParametersMap> = (...args: Localizer.LocalizationParametersMap[K]) => string

	// 	type Localization = {
	// 		[K in keyof LocalizationParametersMap]: string | LocalizationProvider<K>
	// 	}

	// 	interface LocalizationParametersMap { }
	// }
}