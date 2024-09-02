import { PureEventDispatcher } from '@a11d/lit'
import { LocalStorage } from '@a11d/local-storage'
import { type LanguageCode } from './LanguageCode.js'

class Languages {
	readonly change = new PureEventDispatcher<LanguageCode>()

	private readonly storage = new LocalStorage<LanguageCode | undefined>('Localizer.Language', undefined)

	get current() {
		return window?.location.search.split('lang=')[1]?.split('&')[0] as LanguageCode | undefined
			|| this.storage.value
			|| navigator?.language.split('-')[0] as LanguageCode | undefined
			|| 'en'
	}

	set current(value: LanguageCode) {
		this.storage.value = value
		this.change.dispatch(value)
	}
}

type Dictionary = Map<string, string | Array<string>>
type DictionaryLike = Dictionary | Record<string, string | Array<string>>
type AddParameters =
	| [language: LanguageCode, dictionary: DictionaryLike]
	| [dictionariesByLanguage: Partial<Record<LanguageCode, DictionaryLike>>]
class Dictionaries {
	private readonly byLanguageCode = new Map<LanguageCode, Dictionary>()

	get(languageCode: LanguageCode) {
		return this.byLanguageCode.get(languageCode) ?? new Map()
	}

	add(...parameters: AddParameters) {
		if (typeof parameters[0] === 'object') {
			const [dictionariesByLanguage] = parameters as [Record<LanguageCode, DictionaryLike>]
			for (const [languageCode, dictionary] of Object.entries(dictionariesByLanguage)) {
				this.add(languageCode as LanguageCode, dictionary)
			}
			return
		}
		const [languageCode, dictionary] = parameters as [LanguageCode, DictionaryLike]
		const d = dictionary instanceof Map ? dictionary : new Map(Object.entries(dictionary))
		const existingDictionary = this.byLanguageCode.get(languageCode)
		const newDictionary = new Map([...(existingDictionary ?? []), ...d])
		this.byLanguageCode.set(languageCode, newDictionary)
	}
}

export class Localizer {
	static readonly languages = new Languages()
	static readonly dictionaries = new Dictionaries()
}

globalThis.Localizer = Localizer

declare global {
	var Localizer: import('./Localizer.js').Localizer
}