import { html, render, type RootPart } from '@a11d/lit'
import { fakeScreenSizeMedia } from './fakeScreenSizeMedia.test.js'
import { dependsOnScreenSize, ScreenSize } from './dependsOnScreenSize.js'

describe('dependsOnScreenSize', () => {
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

	const definitionsFor = (...screenSizes: Array<ScreenSize>) => ({
		[ScreenSize.Mobile]: screenSizes.includes(ScreenSize.Mobile) ? 'mobile value' : undefined,
		[ScreenSize.Tablet]: screenSizes.includes(ScreenSize.Tablet) ? 'tablet value' : undefined,
		[ScreenSize.Desktop]: screenSizes.includes(ScreenSize.Desktop) ? 'desktop value' : undefined,
	})

	const renderDefinitions = (definitions: ReturnType<typeof definitionsFor>) => {
		part = render(html`<div>${dependsOnScreenSize(definitions)}</div>`, container)
		return container.textContent?.trim()
	}

	for (const screenSize of Object.values(ScreenSize)) {
		it(`should render the value defined for the matching screen size - ${screenSize}`, () => {
			media.match(screenSize)

			expect(renderDefinitions(definitionsFor(ScreenSize.Mobile, ScreenSize.Tablet, ScreenSize.Desktop)))
				.toBe(`${screenSize} value`)
		})
	}

	const fallbacks = [
		{ matching: ScreenSize.Mobile, defined: ScreenSize.Tablet },
		{ matching: ScreenSize.Mobile, defined: ScreenSize.Desktop },
		{ matching: ScreenSize.Tablet, defined: ScreenSize.Desktop },
	]

	for (const { matching, defined } of fallbacks) {
		it(`should fall back to the next larger screen size when the matching one is not defined - ${matching} to ${defined}`, () => {
			media.match(matching)

			expect(renderDefinitions(definitionsFor(defined))).toBe(`${defined} value`)
		})
	}

	it('should re-render when the matching media query changes', () => {
		media.match(ScreenSize.Mobile)
		expect(renderDefinitions(definitionsFor(ScreenSize.Mobile, ScreenSize.Desktop))).toBe('mobile value')

		media.match(ScreenSize.Desktop)
		media[ScreenSize.Mobile].change(false)

		expect(container.textContent?.trim()).toBe('desktop value')
	})

	it('should stop listening for media changes when the directive is disconnected', () => {
		media.match(ScreenSize.Mobile)
		renderDefinitions(definitionsFor(ScreenSize.Mobile, ScreenSize.Desktop))

		part!.setConnected(false)

		media.match(ScreenSize.Desktop)
		media[ScreenSize.Mobile].change(false)

		expect(container.textContent?.trim()).toBe('mobile value')
	})
})