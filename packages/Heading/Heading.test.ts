import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Heading, HeadingTypography } from './Heading.js'

describe('Heading', () => {
	const fixture = new ComponentTestFixture<Heading>(html`<mo-heading>Heading Text</mo-heading>`)

	it('should default to the "heading3" typography', () => {
		expect(fixture.component.typography).toBe(HeadingTypography.Heading3)
		expect(fixture.component.getAttribute('typography')).toBe('heading3')
	})

	const fontWeightByTypography = new Map<HeadingTypography, string>([
		[HeadingTypography.Heading1, '300'],
		[HeadingTypography.Heading2, '300'],
		[HeadingTypography.Heading3, '400'],
		[HeadingTypography.Heading4, '400'],
		[HeadingTypography.Heading5, '500'],
		[HeadingTypography.Heading6, '500'],
		[HeadingTypography.Subtitle1, '400'],
		[HeadingTypography.Subtitle2, '400'],
	])

	for (const [typography, fontWeight] of fontWeightByTypography) {
		it(`should reflect "${typography}" so the typography styles apply`, async () => {
			fixture.component.typography = typography

			await fixture.updateComplete

			expect(fixture.component.getAttribute('typography')).toBe(typography)
			expect(getComputedStyle(fixture.component).fontWeight).toBe(fontWeight)
		})
	}
})