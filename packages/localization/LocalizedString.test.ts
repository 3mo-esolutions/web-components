import { LocalizedString } from './LocalizedString.js'
import { Localizer } from './index.js'


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
		vi.spyOn(console, 'warn').mockReturnValue(undefined)

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

	it('should collapse the trailing categories onto the last form when a dictionary provides fewer forms than the language distinguishes', () => {
		const key = '${count:pluralityNumber} elements'
		// Spanish distinguishes 'one', 'many' and 'other', but only the first and the last are reachable with a count below a million.
		Localizer.dictionaries.add('es', {
			[key]: [
				'Un elemento',
				'${count} elementos'
			]
		})

		expect(LocalizedString.get(key, 'es', { count: 0 }).toString()).toBe('0 elementos')
		expect(LocalizedString.get(key, 'es', { count: 1 }).toString()).toBe('Un elemento')
		expect(LocalizedString.get(key, 'es', { count: 2 }).toString()).toBe('2 elementos')
	})

	it('should select the singular form for a count of zero in languages whose singular covers it', () => {
		const key = '${count:pluralityNumber} messages'
		// Persian counts zero with the singular, unlike German.
		Localizer.dictionaries.add('fa', {
			[key]: [
				'پیام',
				'پیام‌ها'
			]
		})

		expect(LocalizedString.get(key, 'fa', { count: 0 }).toString()).toBe('پیام')
		expect(LocalizedString.get(key, 'fa', { count: 1 }).toString()).toBe('پیام')
		expect(LocalizedString.get(key, 'fa', { count: 2 }).toString()).toBe('پیام‌ها')
	})

	it('should fallback to key if localization is not available', () => {
		const key = 'nonExistentKey'
		const ls = LocalizedString.get(key, 'de', {})
		expect(ls.value).toBe(key)
	})

	it('should fall back to the source language\'s dictionary with its plural rules when the language has no localization', () => {
		vi.spyOn(console, 'warn').mockReturnValue(undefined)
		const key = '${count:pluralityNumber} fallback items'
		Localizer.dictionaries.add('en', {
			'✂Fallback': 'F',
			[key]: ['One item', '${count} items'],
		})

		expect(LocalizedString.get('✂Fallback', 'ar', {}).value).toBe('F')
		expect(LocalizedString.get(key, 'ar', { count: 0 }).value).toBe('0 items')
		expect(LocalizedString.get(key, 'ar', { count: 1 }).value).toBe('One item')
	})

	it('should format parameters if format() method is available', () => {
		const key = 'Formatted number ${number:number} and date ${date:Date}'
		Localizer.dictionaries.add('de', { [key]: 'Formatierte Nummer ${number} und Datum ${date}' })

		const date = new Date('2024-08-27T21:49:13Z')
		const number = 520.11
		const ls = LocalizedString.get(key, 'de', { number, date })

		expect(ls.toString()).toContain('Formatierte Nummer 520,11 und Datum 27.08.2024') // followed by "21:49:13 GMT GMT" or other timezone where the test is run
	})

	describe('JSON serialization', () => {
		it('should serialize to JSON as string', () => {
			Localizer.dictionaries.add('de', { 'Hello': 'Hallo' })
			const ls = LocalizedString.get('Hello', 'de', {})
			expect(ls.toJSON()).toBe('Hallo')
			expect(JSON.stringify(ls)).toBe('"Hallo"')
			expect(JSON.stringify({ greeting: ls })).toBe('{"greeting":"Hallo"}')
		})
	})
})