import { CardinalPluralizationRulesByLanguage } from './CardinalPluralizationRulesByLanguage.js'
import { Localizer } from './Localizer.js'
import { type LanguageCode, type LocalizableStringKey, type LocalizationFormatterTypeMap, type LocalizationParameters } from './index.js'

export class LocalizedString<Key extends LocalizableStringKey> {
	static readonly cache = new Map<string, LocalizedString<any>>()
	static readonly defaultLanguage = 'en'
	static readonly pluralityIdentityType = 'pluralityNumber'

	private static readonly matchedParametersCache = new Map<string, ReadonlyArray<{ readonly group: string, readonly key: string, type: keyof LocalizationFormatterTypeMap }>>()
	private static readonly regex = /\${(.+?)(?::(.+?))?}/g

	static get<Key extends LocalizableStringKey>(key: Key, language: LanguageCode, parameters: LocalizationParameters<Key>) {
		const sortedParameters = Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b))
		const cacheKey = `${key}:${language}:${JSON.stringify(sortedParameters)}`
		if (!LocalizedString.cache.has(cacheKey)) {
			LocalizedString.cache.set(cacheKey, new LocalizedString(key, language, parameters))
		}
		return LocalizedString.cache.get(cacheKey) as LocalizedString<Key>
	}

	private readonly matchedParameters: ReadonlyArray<{ readonly group: string, readonly key: string, type: keyof LocalizationFormatterTypeMap }>

	private _value?: string
	get value() { return this._value ??= this.localize() }

	private localize() {
		const languageDictionary = Localizer.dictionaries.get(this.language)

		if (this.language !== LocalizedString.defaultLanguage && !languageDictionary.has(this.key)) {
			/* eslint-disable-next-line no-console */
			console.warn(`[Localizer] No "${this.language}" localization found for "${this.key}".`)
		}

		const localizationOrLocalizations = languageDictionary.get(this.key) ?? this.key
		if (!Array.isArray(localizationOrLocalizations)) {
			return this._value = this.substituteVariables(localizationOrLocalizations)
		}
		const pluralityIndexParameterKey = this.matchedParameters.find(p => p.type === LocalizedString.pluralityIdentityType)?.key
		const pluralityValue = !pluralityIndexParameterKey ? 0 : (this.parameters as any)[pluralityIndexParameterKey] || 0
		const pluralityIndex = CardinalPluralizationRulesByLanguage.get(this.language)?.(pluralityValue) ?? 0
		return this._value = this.substituteVariables(localizationOrLocalizations[pluralityIndex] as string)
	}

	private substituteVariables(text: string) {
		return this.matchedParameters.reduce((acc, p) => {
			const parameterKey = p.key
			const match = this.matchedParameters.find(p => p.key === parameterKey)
			const parameterValue = (this.parameters as any)[parameterKey!]
			return !match?.group ? acc : acc
				.replace(match.group, `\${${match.key}}`)
				.replace(
					`\${${match.key}}`,
					typeof (parameterValue as any)?.format === 'function'
						? (parameterValue as any).format(this.language)
						: parameterValue
				)
		}, text)
	}

	private constructor(readonly key: Key, readonly language: LanguageCode, readonly parameters?: LocalizationParameters<Key>) {
		if (!LocalizedString.matchedParametersCache.has(this.key)) {
			LocalizedString.matchedParametersCache.set(this.key, [...this.key.matchAll(LocalizedString.regex)]
				.map(([group, key, type]) => ({
					group: group!,
					key: key!,
					type: type as keyof LocalizationFormatterTypeMap
				}))
			)
		}

		this.matchedParameters = LocalizedString.matchedParametersCache.get(this.key)!
	}

	[Symbol.toPrimitive]() {
		return this.value
	}

	toString() {
		return this.value
	}
}