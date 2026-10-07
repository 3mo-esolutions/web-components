import { Localizer } from './Localizer.js'

describe('Localizer', () => {
	describe('locales', () => {
		const storageKey = 'Localizer.Language'

		let originalEntry: string | null
		let originalSearch: string

		const mockPreferences = (...languages: Array<string>) => Object.defineProperty(navigator, 'languages', { get: () => languages, configurable: true })

		beforeEach(() => {
			originalEntry = localStorage.getItem(storageKey)
			originalSearch = window.location.search
		})

		afterEach(() => {
			if (originalEntry === null) {
				localStorage.removeItem(storageKey)
			} else {
				localStorage.setItem(storageKey, originalEntry)
			}
			history.replaceState(null, '', `${window.location.pathname}${originalSearch}${window.location.hash}`)
			delete (navigator as any).languages
			Localizer.locales.change.dispatch(Localizer.locales.current)
		})

		it('should prefer the lang URL parameter over storage and the browser', () => {
			localStorage.setItem(storageKey, JSON.stringify('fr'))
			history.replaceState(null, '', `${window.location.pathname}?lang=de`)

			expect(Localizer.locales.current.language).toBe('de')
		})

		it('should fall back from storage to the browser\'s first language to "en"', () => {
			localStorage.setItem(storageKey, JSON.stringify('fr'))
			expect(Localizer.locales.current.language).toBe('fr')

			localStorage.removeItem(storageKey)
			mockPreferences('pt-BR', 'en-US')
			expect(Localizer.locales.current.baseName).toBe('pt-BR')

			mockPreferences()
			expect(Localizer.locales.current.baseName).toBe('en')
		})

		it('should adopt the region of the browser language matching a selection without one', () => {
			mockPreferences('en-US', 'de-CH')

			localStorage.setItem(storageKey, JSON.stringify('de'))
			expect(Localizer.locales.current.baseName).toBe('de-CH')

			localStorage.setItem(storageKey, JSON.stringify('fr'))
			expect(Localizer.locales.current.baseName).toBe('fr')

			localStorage.setItem(storageKey, JSON.stringify('de-AT'))
			expect(Localizer.locales.current.baseName).toBe('de-AT')
		})

		it('should resolve a tag which is not a locale to "en"', () => {
			localStorage.setItem(storageKey, JSON.stringify('not a tag'))

			expect(Localizer.locales.current.language).toBe('en')
		})

		it('should persist an assigned tag or locale and dispatch the locale in effect', () => {
			const handler = vi.fn()
			Localizer.locales.change.subscribe(handler)

			try {
				Localizer.locales.current = 'de'
				expect(localStorage.getItem(storageKey)).toBe(JSON.stringify('de'))
				expect(handler).toHaveBeenLastCalledWith(expect.objectContaining({ language: 'de' }))

				Localizer.locales.current = new Intl.Locale('fa-IR')
				expect(localStorage.getItem(storageKey)).toBe(JSON.stringify('fa-IR'))
				expect(handler).toHaveBeenLastCalledWith(expect.objectContaining({ baseName: 'fa-IR' }))
			} finally {
				Localizer.locales.change.unsubscribe(handler)
			}
		})

		it('should keep the deprecated languages API in step', () => {
			const handler = vi.fn()
			Localizer.languages.change.subscribe(handler)

			try {
				Localizer.languages.current = 'de'
				expect(Localizer.locales.current.language).toBe('de')
				expect(Localizer.languages.current).toBe('de')
				expect(handler).toHaveBeenCalledExactlyOnceWith('de')
			} finally {
				Localizer.languages.change.unsubscribe(handler)
			}
		})
	})

	describe('dictionaries', () => {
		it('should merge added entries into an existing language dictionary instead of replacing it', () => {
			Localizer.dictionaries.add('la', { 'Localizer.test.merge.first': 'primus' })
			Localizer.dictionaries.add('la', { 'Localizer.test.merge.second': 'secundus' })

			const dictionary = Localizer.dictionaries.get('la')

			expect(dictionary.get('Localizer.test.merge.first')).toBe('primus')
			expect(dictionary.get('Localizer.test.merge.second')).toBe('secundus')
		})

		it('should accept both Map and plain-object dictionaries', () => {
			Localizer.dictionaries.add('eo', new Map<string, string | Array<string>>([['Localizer.test.map', 'mapo']]))
			Localizer.dictionaries.add('eo', { 'Localizer.test.object': 'objekto' })

			const dictionary = Localizer.dictionaries.get('eo')

			expect(dictionary.get('Localizer.test.map')).toBe('mapo')
			expect(dictionary.get('Localizer.test.object')).toBe('objekto')
		})

		it('should distribute the by-language record overload', () => {
			Localizer.dictionaries.add({
				gn: { 'Localizer.test.record': 'guarani' },
				haw: { 'Localizer.test.record': 'hawaiian' },
			})

			expect(Localizer.dictionaries.get('gn').get('Localizer.test.record')).toBe('guarani')
			expect(Localizer.dictionaries.get('haw').get('Localizer.test.record')).toBe('hawaiian')
		})

		it('should return an empty dictionary for an unknown language', () => {
			expect(Localizer.dictionaries.get('iu').size).toBe(0)
		})
	})
})
