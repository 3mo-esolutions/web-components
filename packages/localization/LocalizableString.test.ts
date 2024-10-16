import { LocalizableString } from './LocalizableString'
import { Localizer } from './Localizer'

describe('LocalizableString', () => {
	xit('should cache instances', () => {
		const key = 'greeting'
		const firstInstance = LocalizableString.get(key)
		const secondInstance = LocalizableString.get(key)

		expect(firstInstance).toBe(secondInstance)
	})

	it('should replace parameters in the string', () => {
		Localizer.dictionaries.add('de', { 'Hello, ${name:string}!': 'Hallo, ${name}!' })

		const ls = LocalizableString.get('Hello, ${name:string}!', { name: 'John' })

		expect(ls.localize('de')).toBe('Hallo, John!')
	})

	it('should handle missing localization gracefully', () => {
		spyOn(console, 'warn')

		const key = 'Missing key'

		const ls = LocalizableString.get(key)

		expect(ls.localize('de')).toBe(key)
		// eslint-disable-next-line no-console
		expect(console.warn).toHaveBeenCalledWith(`[Localizer] No "${'de'}" localization found for "${key}".`)
	})

	it('should handle pluralization correctly using existing rules', () => {
		const key = '${count:pluralityNumber} items'
		Localizer.dictionaries.add('de', {
			[key]: [
				'Ein Element',
				'${count} Elemente'
			]
		})

		expect(LocalizableString.get(key, { count: 0 }).localize('de')).toBe('0 Elemente')
		expect(LocalizableString.get(key, { count: 1 }).localize('de')).toBe('Ein Element')
		expect(LocalizableString.get(key, { count: 2 }).localize('de')).toBe('2 Elemente')
	})

	it('should convert to string implicitly', () => {
		const key = 'simple'
		Localizer.dictionaries.add(Localizer.languages.current, { [key]: 'Just a simple string' })

		const ls = LocalizableString.getAsString(key)

		// Implicit string conversion
		expect(`${ls}`).toBe('Just a simple string')
	})

	it('should fallback to key if localization is not available', () => {
		const key = 'nonExistentKey'
		const ls = LocalizableString.get(key)
		expect(ls.localize('de')).toBe(key)
	})

	it('should format parameters if format() method is available', () => {
		const key = 'Formatted number ${number:number} and date ${date:Date}'
		Localizer.dictionaries.add('de', { [key]: 'Formatierte Nummer ${number} und Datum ${date}' })

		const date = new Date('2024-08-27T21:49:13Z')
		const number = 520.11
		const ls = LocalizableString.get(key, { number, date })

		expect(ls.localize('de', { number, date })).toContain('Formatierte Nummer 520,11 und Datum 27.08.2024') // followed by "21:49:13 GMT GMT" or other timezone where the test is run
	})
})