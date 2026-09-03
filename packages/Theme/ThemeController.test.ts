import { Component, component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Background } from './Background.js'
import { Theme } from './Theme.js'
import { ThemeController } from './ThemeController.js'

describe('ThemeController', () => {
	@component('test-theme-controller')
	class TestThemeController extends Component {
		readonly themeController = new ThemeController(this)
	}

	const fixture = new ComponentTestFixture<TestThemeController>(html`<test-theme-controller></test-theme-controller>`)

	const accentKey = 'Theme.Accent'
	const backgroundKey = 'Theme.Background'

	let originalAccentEntry: string | null
	let originalBackgroundEntry: string | null

	const restore = (key: string, entry: string | null) => {
		if (entry === null) {
			localStorage.removeItem(key)
		} else {
			localStorage.setItem(key, entry)
		}
	}

	beforeEach(() => {
		originalAccentEntry = localStorage.getItem(accentKey)
		originalBackgroundEntry = localStorage.getItem(backgroundKey)
	})

	afterEach(() => {
		restore(accentKey, originalAccentEntry)
		restore(backgroundKey, originalBackgroundEntry)
		document.documentElement.style.setProperty('--mo-color-accent-seed', Theme.accent.value!)
		Theme.background.changed.dispatch(Theme.background.value)
	})

	it('should request a host update when the accent changes', () => {
		const requestUpdate = spyOn(fixture.component, 'requestUpdate')

		Theme.accent.value = 'rgb(12, 34, 56)'

		expect(requestUpdate).toHaveBeenCalledTimes(1)
	})

	it('should request a host update when the background changes', () => {
		const requestUpdate = spyOn(fixture.component, 'requestUpdate')

		Theme.background.value = Background.Dark

		expect(requestUpdate).toHaveBeenCalledTimes(1)
	})

	it('should unsubscribe from both when the host disconnects', () => {
		fixture.component.remove()
		const requestUpdate = spyOn(fixture.component, 'requestUpdate')

		Theme.accent.value = 'rgb(12, 34, 56)'
		Theme.background.value = Background.Dark

		expect(requestUpdate).not.toHaveBeenCalled()
	})
})