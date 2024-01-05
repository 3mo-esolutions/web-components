import { event } from '@a11d/lit'
import { LocalStorage } from '@a11d/local-storage'
import { CardinalPluralizationRulesByLanguage } from './CardinalPluralizationRulesByLanguage.js'
import { LanguageCode } from './LanguageCode.js'

type Dictionary = Map<string, string | Array<string>>

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
	[Localizer.pluralityIdentityType]: number
	'string': string
	'number': number
	'Date': Date
	'': string
}

type LocalizationParameters<T extends string> = {
	[P in ExtractProperties<T> as ExtractKey<P>]: ExtractType<P>
}

export class Localizer {
	static readonly defaultLanguage = 'en'
	static readonly pluralityIdentityType = 'pluralityNumber'

	@event() static readonly languageChange: EventDispatcher<LanguageCode>

	static get currentLanguage() {
		return window?.location.search.split('lang=')[1]?.split('&')[0] as LanguageCode | undefined
			|| Localizer.languageCodeStorage.value
			|| navigator?.language.split('-')[0] as LanguageCode | undefined
			|| 'en'
	}

	static set currentLanguage(value) {
		Localizer.languageCodeStorage.value = value
		Localizer.languageChange.dispatch(value)
	}

	private static readonly languageCodeStorage = new LocalStorage<LanguageCode | undefined>('Localizer.Language', undefined)
	private static readonly dictionariesByLanguageCode = new Map<LanguageCode, Dictionary>()

	private static readonly regex = /\${(.+?)(?::(.+?))?}/g

	static register(languageCode: LanguageCode, dictionary: Dictionary | Record<string, string | Array<string>>) {
		const d = typeof dictionary === 'object' ? new Map(Object.entries(dictionary)) : dictionary
		const existingDictionary = Localizer.dictionariesByLanguageCode.get(languageCode)
		const newDictionary = new Map([...(existingDictionary ?? []), ...d])
		Localizer.dictionariesByLanguageCode.set(languageCode, newDictionary)
	}

	static get currentLanguageDictionary() {
		return Localizer.dictionariesByLanguageCode.get(Localizer.currentLanguage)
	}

	static localize<T extends string>(key: T, parameters?: LocalizationParameters<T>) {
		if (Localizer.currentLanguage !== Localizer.defaultLanguage && !Localizer.currentLanguageDictionary?.has(key)) {
			/* eslint-disable-next-line no-console */
			console.warn(`[Localizer] No "${Localizer.currentLanguage}" localization found for "${key}".`)
		}

		return Localizer.getLocalization(key, parameters)
	}

	static matchLocalizationParameters(key: string) {
		return [...key.matchAll(Localizer.regex)]
			.map(([group, key, type]) => ({ group, key, type }))
	}

	static getLocalization<T extends string>(key: T, parameters?: LocalizationParameters<T>) {
		const matchedParameters = Localizer.matchLocalizationParameters(key)

		const replace = (text: string, parameterKey: string, parameterValue: string) => {
			const match = matchedParameters.find(p => p.key === parameterKey)
			return !match?.group ? text : text.replace(match.group, parameterValue).replace(
				`\${${match.key}}`,
				typeof (parameterValue as any)?.format === 'function'
					? (parameterValue as any).format()
					: parameterValue,
			)
		}

		const replaceAll = (text: string) => {
			return matchedParameters.reduce((acc, p) => replace(acc, p.key!, (parameters as any)[p.key!]), text)
		}

		const localizationOrLocalizations = Localizer.currentLanguageDictionary?.get(key) ?? key
		if (!Array.isArray(localizationOrLocalizations)) {
			return replaceAll(localizationOrLocalizations)
		}
		const pluralityIndexParameterKey = matchedParameters.find(p => p.type === Localizer.pluralityIdentityType)?.key
		const pluralityValue = !pluralityIndexParameterKey ? 0 : (parameters as any)[pluralityIndexParameterKey] || 0
		const pluralityIndex = CardinalPluralizationRulesByLanguage.get(Localizer.currentLanguage)?.(pluralityValue) ?? 0
		return replaceAll(localizationOrLocalizations[pluralityIndex] as string)
	}

	static getLocalizationParameter(key: string, parameter: string) {
		Localizer.matchLocalizationParameters(key).find(p => p.key === parameter)
	}
}

globalThis.t = Localizer.localize

declare global {
	// eslint-disable-next-line no-var
	var t: typeof Localizer.localize

	// namespace Localizer {
	// 	type LocalizationProvider<K extends keyof LocalizationParametersMap> = (...args: Localizer.LocalizationParametersMap[K]) => string

	// 	type Localization = {
	// 		[K in keyof LocalizationParametersMap]: string | LocalizationProvider<K>
	// 	}

	// 	interface LocalizationParametersMap { }
	// }
}