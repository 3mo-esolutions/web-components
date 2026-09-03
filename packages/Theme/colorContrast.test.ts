import { colorContrast } from './colorContrast.js'

describe('colorContrast()', () => {
	/**
	 * Depending on `contrast-color()` support, either branch of `colorContrast()` computes to
	 * `rgb(r, g, b)` or to `color(srgb r g b)` — normalise both to 0…1 channels.
	 */
	const channelsOf = (computedColor: string) => {
		const scale = computedColor.startsWith('color(') ? 1 : 255
		return (computedColor.match(/[\d.]+/g) ?? []).slice(0, 3).map(channel => Number(channel) / scale)
	}

	const resolve = (color: string, customProperties?: Record<string, string>) => {
		const element = document.createElement('div')
		for (const [property, value] of Object.entries(customProperties ?? {})) {
			element.style.setProperty(property, value)
		}
		element.style.color = colorContrast(color).cssText
		document.body.appendChild(element)
		try {
			return channelsOf(getComputedStyle(element).color)
		} finally {
			element.remove()
		}
	}

	it('should compute black text over light colors and white text over dark colors', () => {
		expect(resolve('white')).toEqual([0, 0, 0])
		expect(resolve('rgb(240, 240, 240)')).toEqual([0, 0, 0])
		expect(resolve('black')).toEqual([1, 1, 1])
		expect(resolve('rgb(20, 20, 20)')).toEqual([1, 1, 1])
	})

	it('should resolve custom-property color inputs at the use site', () => {
		expect(resolve('var(--some-color)', { '--some-color': 'white' })).toEqual([0, 0, 0])
		expect(resolve('var(--some-color)', { '--some-color': 'black' })).toEqual([1, 1, 1])
	})
})