import { AccentStorage } from './Accent.js'
import { Theme } from './Theme.js'

describe('AccentStorage', () => {
	const storageKey = 'Theme.Accent'
	const seedProperty = '--mo-color-accent-seed'
	const defaultAccent = 'rgb(0, 119, 200)'

	const seed = () => document.documentElement.style.getPropertyValue(seedProperty)

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
		document.documentElement.style.setProperty(seedProperty, Theme.accent.value!)
	})

	it('should seed --mo-color-accent-seed on the document element with the default accent', () => {
		localStorage.removeItem(storageKey)
		document.documentElement.style.removeProperty(seedProperty)

		const storage = new AccentStorage()

		expect(storage.value).toBe(defaultAccent)
		expect(seed()).toBe(defaultAccent)
	})

	it('should update --mo-color-accent-seed when the accent changes', () => {
		Theme.accent.value = 'rgb(12, 34, 56)'

		expect(Theme.accent.value).toBe('rgb(12, 34, 56)')
		expect(seed()).toBe('rgb(12, 34, 56)')
	})

	it('should fall back to the default accent when cleared', () => {
		Theme.accent.value = 'rgb(12, 34, 56)'

		Theme.accent.value = undefined

		expect(localStorage.getItem(storageKey)).toBeNull()
		expect(Theme.accent.value).toBe(defaultAccent)
		expect(seed()).toBe(defaultAccent)
	})

	it('toColor() should return a Color equal to the accent value', () => {
		Theme.accent.value = 'rgb(12, 34, 56)'

		expect(Theme.accent.toColor()?.hex).toBe('#0C2238')
		expect(Theme.accent.toColor()?.rgb).toBe(Theme.accent.value)
	})
})