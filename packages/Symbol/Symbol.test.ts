import { ComponentTestFixture } from '@a11d/lit-testing'
import { Symbol, SymbolVariant } from './Symbol.js'

describe('Symbol', () => {
	const fixture = new ComponentTestFixture<Symbol>('mo-symbol')

	const span = () => fixture.component.renderRoot.querySelector('span')!

	it('should render the symbol into the span element', async () => {
		const icon = fixture.component.icon = 'home'

		await fixture.update()

		expect(span().textContent).toBe(icon)
	})

	it('should adopt the static "defaultVariant"', async () => {
		const originalDefaultVariant = Symbol.defaultVariant
		expect(fixture.component.variant).toBe(originalDefaultVariant)

		try {
			Symbol.defaultVariant = SymbolVariant.Sharp
			await fixture.initialize()

			expect(fixture.component.variant).toBe(SymbolVariant.Sharp)
		} finally {
			Symbol.defaultVariant = originalDefaultVariant
		}
	})

	describe('variants', () => {
		Symbol['fontUrlByVariant'].forEach((font, variant) => {
			it(`should set the font-family and import the font for variant "${variant}"`, async () => {
				fixture.component.variant = variant

				await fixture.update()

				expect(getComputedStyle(span()).fontFamily).toContain(font.name)

				const importedFonts = [...document.head.querySelectorAll('style')]
					.map(style => style.textContent)
					.join('\n')
				expect(importedFonts).toContain(font.url)
			})
		})
	})

	describe('font variation settings', () => {
		it('should leave "font-variation-settings" unset while no axis is set', () => {
			expect(fixture.component.fill).toBeUndefined()
			expect(fixture.component.weight).toBeUndefined()
			expect(fixture.component.grade).toBeUndefined()
			expect(fixture.component.opticalScale).toBeUndefined()
			expect(getComputedStyle(span()).fontVariationSettings).toBe('normal')
		})

		const axes = [
			['fill', 'FILL', '1'],
			['weight', 'wght', '700'],
			['grade', 'GRAD', '200'],
			['opticalScale', 'opsz', '48'],
		] as const

		for (const [property, axis, value] of axes) {
			it(`should compose the "${axis}" axis from the "${property}" property`, async () => {
				fixture.component[property] = value

				await fixture.update()

				const settings = getComputedStyle(span()).fontVariationSettings
				expect(settings).toContain(axis)
				expect(settings).toContain(value)
				// Only the axis which is set takes part, so an unset axis keeps the font's own default.
				for (const [, otherAxis] of axes.filter(([otherProperty]) => otherProperty !== property)) {
					expect(settings).not.toContain(otherAxis)
				}
			})
		}

		it('should adopt the static axis defaults on new instances', async () => {
			const originalFill = Symbol.defaultFill
			const originalWeight = Symbol.defaultWeight
			const originalGrade = Symbol.defaultGrade
			const originalOpticalScale = Symbol.defaultOpticalScale

			try {
				Symbol.defaultFill = '1'
				Symbol.defaultWeight = '600'
				Symbol.defaultGrade = '25'
				Symbol.defaultOpticalScale = '40'
				await fixture.initialize()

				expect(fixture.component.fill).toBe('1')
				expect(fixture.component.weight).toBe('600')
				expect(fixture.component.grade).toBe('25')
				expect(fixture.component.opticalScale).toBe('40')

				const settings = getComputedStyle(span()).fontVariationSettings
				expect(settings).toContain('FILL')
				expect(settings).toContain('wght')
				expect(settings).toContain('GRAD')
				expect(settings).toContain('opsz')
			} finally {
				Symbol.defaultFill = originalFill
				Symbol.defaultWeight = originalWeight
				Symbol.defaultGrade = originalGrade
				Symbol.defaultOpticalScale = originalOpticalScale
			}
		})
	})
})