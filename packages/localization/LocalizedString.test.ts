import { LocalizedString } from './LocalizedString'
import { Localizer } from '.'


describe('LocalizedString', () => {
	describe('caching', () => {
		it('should cache same instances', () => {
			const key = 'greeting ${firstName:string} ${lastName:string}'
			const firstInstance = LocalizedString.get(key, 'de', { firstName: 'John', lastName: 'Doe' })
			const secondInstance = LocalizedString.get(key, 'de', { lastName: 'Doe', firstName: 'John' })
			expect(firstInstance).toBe(secondInstance)
		})

		it('should not cache instances with different keys', () => {
			const firstInstance = LocalizedString.get('greeting', 'de', {})
			const secondInstance = LocalizedString.get('farewell', 'de', {})
			expect(firstInstance).not.toBe(secondInstance as any)
		})

		it('should not cache instanced with different languages', () => {
			const key = 'greeting'
			const firstInstance = LocalizedString.get(key, 'de', {})
			const secondInstance = LocalizedString.get(key, 'en', {})
			expect(firstInstance).not.toBe(secondInstance)
		})

		it('should not cache instances with different parameters', () => {
			const key = 'greeting ${name:string}'
			const firstInstance = LocalizedString.get(key, 'de', { name: 'John' })
			const secondInstance = LocalizedString.get(key, 'de', { name: 'Jane' })
			expect(firstInstance).not.toBe(secondInstance)
		})
	})

	it('should replace parameters in the string', () => {
		Localizer.dictionaries.add('de', { 'Hello, ${name:string}!': 'Hallo, ${name}!' })

		const ls = LocalizedString.get('Hello, ${name:string}!', 'de', { name: 'John' })

		expect(ls.toString()).toBe('Hallo, John!')
	})

	it('should handle missing localization gracefully', () => {
		spyOn(console, 'warn')

		const key = 'Missing key'

		const ls = LocalizedString.get(key, 'de', {})

		expect(ls.toString()).toBe(key)
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

		expect(LocalizedString.get(key, 'de', { count: 0 }).toString()).toBe('0 Elemente')
		expect(LocalizedString.get(key, 'de', { count: 1 }).toString()).toBe('Ein Element')
		expect(LocalizedString.get(key, 'de', { count: 2 }).toString()).toBe('2 Elemente')
	})

	it('should fallback to key if localization is not available', () => {
		const key = 'nonExistentKey'
		const ls = LocalizedString.get(key, 'de', {})
		expect(ls.value).toBe(key)
	})

	it('should format parameters if format() method is available', () => {
		const key = 'Formatted number ${number:number} and date ${date:Date}'
		Localizer.dictionaries.add('de', { [key]: 'Formatierte Nummer ${number} und Datum ${date}' })

		const date = new Date('2024-08-27T21:49:13Z')
		const number = 520.11
		const ls = LocalizedString.get(key, 'de', { number, date })

		expect(ls.toString()).toContain('Formatierte Nummer 520,11 und Datum 27.08.2024') // followed by "21:49:13 GMT GMT" or other timezone where the test is run
	})
})