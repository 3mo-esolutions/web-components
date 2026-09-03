import { html, render, type RootPart } from '@a11d/lit'
import { fakeScreenSizeMedia } from './fakeScreenSizeMedia.test.js'
import { ScreenSize } from './dependsOnScreenSize.js'
import { hideOnScreenSize } from './hideOnScreenSize.js'

describe('hideOnScreenSize', () => {
	const media = fakeScreenSizeMedia()

	let container: HTMLDivElement
	let part: RootPart | undefined

	beforeEach(() => {
		container = document.createElement('div')
		document.body.appendChild(container)
	})

	afterEach(() => {
		part?.setConnected(false)
		part = undefined
		container.remove()
	})

	const renderElement = () => {
		part = render(html`<span ${hideOnScreenSize('mobile', 'tablet')}>Content</span>`, container)
		return container.querySelector('span')!
	}

	it('should hide the element when one of the given screen sizes matches', () => {
		media.match(ScreenSize.Tablet)

		const element = renderElement()

		expect(element.style.display).toBe('none')
		expect(getComputedStyle(element).display).toBe('none')
	})

	it('should show the element again when no given screen size matches', () => {
		media.match(ScreenSize.Desktop)

		const element = renderElement()

		expect(element.style.display).toBe('')
		expect(getComputedStyle(element).display).not.toBe('none')
	})

	it('should react to media query changes', () => {
		media.match(ScreenSize.Desktop)
		const element = renderElement()
		expect(element.style.display).toBe('')

		media.match(ScreenSize.Mobile)
		media[ScreenSize.Mobile].change(true)

		expect(element.style.display).toBe('none')
	})
})