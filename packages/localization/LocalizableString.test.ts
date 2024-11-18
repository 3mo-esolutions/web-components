import { LocalizableString } from './LocalizableString'
import { Localizer } from '.'

describe('LocalizableString', () => {
	it('should cache instances', () => {
		const key = 'greeting'
		const firstInstance = LocalizableString.get(key)
		const secondInstance = LocalizableString.get(key)

		expect(firstInstance).toBe(secondInstance)
	})

	it('should support an overload for explicit language', () => {
		const key = 'Hello'
		Localizer.dictionaries.add('de', { [key]: 'Hallo' })
		const instance = LocalizableString.get(key)

		const en = instance.localize('en')
		const de = instance.localize('de')

		expect(en).not.toBe(de)
		expect(en.value).toBe('Hello')
		expect(de.value).toBe('Hallo')
	})

	it('should convert to string implicitly', () => {
		const key = 'simple'
		Localizer.dictionaries.add(Localizer.languages.current, { [key]: 'Just a simple string' })

		const ls = LocalizableString.getAsString(key)

		// Implicit string conversion
		expect(`${ls}`).toBe('Just a simple string')
	})
})