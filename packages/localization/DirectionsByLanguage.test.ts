import { DirectionsByLanguage } from './DirectionsByLanguage.js'
import { type LanguageCode } from './LanguageCode.js'
import { Localizer } from './Localizer.js'

describe('DirectionsByLanguage', () => {
	const storageKey = 'Localizer.Language'

	const rightToLeftLanguages: Array<LanguageCode> = ['ar', 'hy', 'az', 'fa', 'he', 'ku', 'mdv', 'ur']
	const leftToRightLanguages: Array<LanguageCode> = ['en', 'de', 'fr', 'es', 'ru', 'zh', 'ja', 'hi']

	let originalEntry: string | null

	beforeEach(() => {
		originalEntry = localStorage.getItem(storageKey)
	})

	afterEach(() => {
		if (originalEntry === null) {
			localStorage.removeItem(storageKey)
		} else {
			localStorage.setItem(storageKey, originalEntry)
		}
		Localizer.languages.change.dispatch(Localizer.languages.current)
	})

	it('should return rtl for right-to-left languages', () => {
		for (const language of rightToLeftLanguages) {
			expect(DirectionsByLanguage.get(language)).withContext(language).toBe('rtl')
		}
	})

	it('should default to ltr for unknown and left-to-right languages', () => {
		for (const language of leftToRightLanguages) {
			expect(DirectionsByLanguage.get(language)).withContext(language).toBe('ltr')
		}
		expect(DirectionsByLanguage.get('zz' as LanguageCode)).toBe('ltr')
	})

	it('should stamp lang and dir attributes on document.body when the language changes', () => {
		Localizer.languages.current = 'fa'

		expect(document.body.getAttribute('lang')).toBe('fa')
		expect(document.body.getAttribute('dir')).toBe('rtl')

		Localizer.languages.current = 'de'

		expect(document.body.getAttribute('lang')).toBe('de')
		expect(document.body.getAttribute('dir')).toBe('ltr')
	})
})