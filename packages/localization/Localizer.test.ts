import { type LanguageCode } from './LanguageCode.js'
import { Localizer } from './Localizer.js'

describe('Localizer', () => {
	describe('languages', () => {
		const storageKey = 'Localizer.Language'

		let originalEntry: string | null
		let originalSearch: string

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
			delete (navigator as Partial<Navigator>).language
			Localizer.languages.change.dispatch(Localizer.languages.current)
		})

		it('should prefer the lang URL parameter over storage and navigator', () => {
			localStorage.setItem(storageKey, JSON.stringify('fr'))
			history.replaceState(null, '', `${window.location.pathname}?lang=de`)

			expect(Localizer.languages.current).toBe('de')
		})

		it('should fall back from storage to the navigator language to "en"', () => {
			localStorage.setItem(storageKey, JSON.stringify('fr'))
			expect(Localizer.languages.current).toBe('fr')

			localStorage.removeItem(storageKey)
			expect(Localizer.languages.current).toBe(navigator.language.split('-')[0] as LanguageCode)

			Object.defineProperty(navigator, 'language', { get: () => '', configurable: true })
			expect(Localizer.languages.current).toBe('en')
		})

		it('should persist an assigned language and dispatch a change event to subscribers', () => {
			const handler = jasmine.createSpy('handler')
			Localizer.languages.change.subscribe(handler)

			try {
				Localizer.languages.current = 'de'
			} finally {
				Localizer.languages.change.unsubscribe(handler)
			}

			expect(localStorage.getItem(storageKey)).toBe(JSON.stringify('de'))
			expect(handler).toHaveBeenCalledOnceWith('de')
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