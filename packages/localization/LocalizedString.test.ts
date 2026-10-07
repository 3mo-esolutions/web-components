import { LocalizedString } from './LocalizedString.js'
import { Localizer } from './index.js'
import { type LanguageCode } from './LanguageCode.js'

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
				'${count} Elemente',
			],
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
				'${count} elementos',
			],
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
				'پیام‌ها',
			],
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

	describe('plural forms', () => {
		const key = '${count:pluralityNumber} forms'
		const forms = ['0', '1', '2', '3', '4', '5']
		const formOf = (language: LanguageCode, count: number) => Number(LocalizedString.get(key, language, { count }).toString())

		it('should order the categories as the dictionaries do rather than as the engine reports them', () => {
			// Chrome reports 'uk' canonically while Firefox reports it alphabetically, so the index must not come from the engine's order.
			Localizer.dictionaries.add({ uk: { [key]: forms }, ar: { [key]: forms } })

			expect([1, 2, 5, 1.5].map(count => formOf('uk', count))).toEqual([0, 1, 2, 3])
			expect([0, 1, 2, 3, 11, 100].map(count => formOf('ar', count))).toEqual([0, 1, 2, 3, 4, 5])
		})

		it('should fall back to english for a language the engine has no data for', () => {
			// Only codes both engines agree they have no data for can be asserted on: Firefox ships root rules for 'qu', 'rw' and 'tt' while Chrome does not.
			Localizer.dictionaries.add({ la: { [key]: forms }, mdv: { [key]: forms } })

			for (const language of ['la', 'mdv'] as const) {
				expect([1, 2].map(count => formOf(language, count)), language).toEqual([0, 1])
			}
		})

		const families: Array<{ readonly description: string, readonly languages: Array<LanguageCode>, readonly formByCount: Record<number, number> }> = [
			{ description: 'a single form', languages: ['ja', 'zh', 'ko', 'th', 'vi', 'id'], formByCount: { 0: 0, 1: 0, 2: 0, 5: 0, 21: 0, 100: 0 } },
			{ description: 'n ≠ 1', languages: ['en', 'de', 'nl', 'sv'], formByCount: { 0: 1, 1: 0, 2: 1, 11: 1, 21: 1, 100: 1 } },
			{ description: 'n ≠ 1 with a separate form for millions', languages: ['es', 'it', 'ca'], formByCount: { 0: 2, 1: 0, 2: 2, 11: 2, 100: 2, 1_000_000: 1 } },
			{ description: 'n > 1 with a separate form for millions', languages: ['fr', 'pt'], formByCount: { 0: 0, 1: 0, 2: 2, 11: 2, 100: 2, 1_000_000: 1 } },
			{ description: 'n > 1', languages: ['fa'], formByCount: { 0: 0, 1: 0, 2: 1, 11: 1, 100: 1 } },
			{ description: '1 / 2–4 / other', languages: ['cs', 'sk'], formByCount: { 0: 3, 1: 0, 2: 1, 4: 1, 5: 3, 22: 3 } },
			{ description: 'the polish %10 rule', languages: ['pl'], formByCount: { 0: 2, 1: 0, 2: 1, 5: 2, 12: 2, 22: 1, 25: 2, 102: 1 } },
			{ description: 'the east slavic %10 rule including the 11–14 exceptions', languages: ['ru', 'uk', 'sr'], formByCount: { 0: 2, 1: 0, 2: 1, 5: 2, 11: 2, 12: 2, 14: 2, 21: 0, 22: 1, 25: 2, 111: 2 } },
			{ description: 'the arabic six forms', languages: ['ar'], formByCount: { 0: 0, 1: 1, 2: 2, 3: 3, 10: 3, 11: 4, 99: 4, 100: 5, 103: 3 } },
			{ description: 'a dual form', languages: ['he', 'se'], formByCount: { 0: 2, 1: 0, 2: 1, 3: 2, 11: 2, 101: 2 } },
			{ description: 'the welsh six forms', languages: ['cy'], formByCount: { 0: 0, 1: 1, 2: 2, 3: 3, 6: 4, 7: 5, 11: 5 } },
		]

		for (const { description, languages, formByCount } of families) {
			for (const language of languages) {
				it(`should map counts to the CLDR form index for ${description} in '${language}'`, () => {
					Localizer.dictionaries.add(language, { [key]: forms })

					for (const [count, form] of Object.entries(formByCount)) {
						expect(formOf(language, Number(count)), `${language} · ${count}`).toBe(form)
					}
				})
			}
		}
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
