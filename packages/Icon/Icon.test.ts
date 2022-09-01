import { ComponentTestFixture } from '../../test/index.js'
import { Icon, IconVariant } from './Icon.js'

describe(Icon.name, () => {
	const fixture = new ComponentTestFixture(() => document.createElement('mo-icon'))

	it('should have a default font-size of 24px', () => {
		expect(getComputedStyle(fixture.component).fontSize).toBe('24px')
	})

	it('should have a default display of inline-grid', () => {
		expect(getComputedStyle(fixture.component).display).toBe('inline-grid')
	})

	it('should have the default variant', async () => {
		const originalDefaultVariant = Icon.defaultVariant
		expect(fixture.component.variant).toBe(originalDefaultVariant)

		Icon.defaultVariant = IconVariant.Outlined
		await fixture.initialize()

		expect(fixture.component.variant).toBe(IconVariant.Outlined)
		Icon.defaultVariant = originalDefaultVariant
	})

	it('should render the icon into the span element', async () => {
		const icon = fixture.component.icon = 'favorite'
		await fixture.update()
		expect(fixture.component.renderRoot.querySelector('span')?.textContent).toBe(icon)
	})

	Icon.fontsByVariant.forEach((font, variant) => {
		it(`should set the font-family to "${font.name}" and load the font automatically when the variant is set to "${variant}"`, async () => {
			fixture.component.variant = variant
			await fixture.update()
			expect(getComputedStyle(fixture.component.renderRoot.querySelector('span')!).fontFamily).toContain(font.name)

			const fontStyleSheet = document.head.querySelector('style')
			expect(fontStyleSheet?.textContent).toContain(font.url)
		})
	})
})