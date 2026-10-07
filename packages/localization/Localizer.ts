import './polyfills/Intl.Locale.js'
import { PureEventDispatcher } from '@a11d/lit'
import { LocalStorage } from '@a11d/local-storage'
import { type LanguageCode, type Locale } from './LanguageCode.js'

class Locales {
	private readonly storage = new LocalStorage<string | undefined>('Localizer.Language', undefined)
	private resolved?: { readonly tag: string, readonly locale: Intl.Locale }

	/** Dispatched with the locale in effect after one is assigned. */
	readonly change = new PureEventDispatcher<Intl.Locale>()

	/**
	 * The locale the application runs in: the one selected through the `lang` URL parameter or assigned here,
	 * otherwise the browser's. A selection that names no region adopts the one of the browser's matching language.
	 */
	get current(): Intl.Locale {
		const tag = this.tag
		if (this.resolved?.tag !== tag) {
			this.resolved = { tag, locale: Locales.resolve(tag) }
		}
		return this.resolved.locale
	}

	set current(value: Locale) {
		this.storage.value = String(new Intl.Locale(value))
		this.change.dispatch(this.current)
	}

	private get tag() {
		const preferences = navigator?.languages ?? []
		const tag = window?.location.search.split('lang=')[1]?.split('&')[0] || this.storage.value || preferences[0] || 'en'
		return tag.includes('-') ? tag : preferences.find(preference => preference.startsWith(`${tag}-`)) ?? tag
	}

	private static resolve(tag: string) {
		try {
			return new Intl.Locale(tag)
		} catch {
			return new Intl.Locale('en')
		}
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
	static readonly locales = new Locales()
	static readonly dictionaries = new Dictionaries()

	/** @deprecated Use `Localizer.locales`. */
	static readonly languages = {
		change: new PureEventDispatcher<LanguageCode>(),
		get current() {
			return Localizer.locales.current.language as LanguageCode
		},
		set current(value: LanguageCode) {
			Localizer.locales.current = value
		},
	}

	static {
		Localizer.locales.change.subscribe(locale => Localizer.languages.change.dispatch(locale.language as LanguageCode))
	}
}

globalThis.Localizer = Localizer

declare global {
	var Localizer: typeof import('./Localizer.js').Localizer
}
