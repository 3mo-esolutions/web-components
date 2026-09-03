import { Background } from './Background.js'
import { Theme } from './Theme.js'

describe('BackgroundStorage', () => {
	const storageKey = 'Theme.Background'

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
		Theme.background.changed.dispatch(Theme.background.value)
	})

	describe('calculatedValue', () => {
		for (const background of [Background.Light, Background.Dark]) {
			it(`should return the explicitly chosen background when '${background}' is stored`, () => {
				Theme.background.value = background
				expect(Theme.background.calculatedValue).toBe(background)
			})
		}

		it('should follow prefers-color-scheme when unset', () => {
			Theme.background.value = undefined

			const preference = window.matchMedia('(prefers-color-scheme: dark)').matches ? Background.Dark : Background.Light
			expect(Theme.background.calculatedValue).toBe(preference)
		})
	})

	describe('color-scheme propagation', () => {
		for (const background of [Background.Light, Background.Dark]) {
			it(`should pin document color-scheme to '${background}' when it is chosen`, () => {
				Theme.background.value = background
				expect(document.documentElement.style.colorScheme).toBe(background)
			})
		}

		it('should release document color-scheme to "light dark" when the choice is cleared', () => {
			Theme.background.value = Background.Dark
			Theme.background.value = undefined

			expect(document.documentElement.style.colorScheme).toBe('light dark')
		})
	})

	it('should persist under the "Theme.Background" storage key', () => {
		Theme.background.value = Background.Dark
		expect(localStorage.getItem(storageKey)).toBe(JSON.stringify(Background.Dark))

		Theme.background.value = undefined
		expect(localStorage.getItem(storageKey)).toBeNull()
	})
})