import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Line } from './Line.js'
import './index.js'

const extent = 200

const segmentsOf = (line: Line) => ['::before', '::after'].map(pseudo => {
	const style = getComputedStyle(line, pseudo)
	return {
		width: parseFloat(style.width),
		height: parseFloat(style.height),
		borderBlockEndWidth: style.borderBottomWidth,
		borderInlineEndWidth: style.borderRightWidth,
	}
})

describe('Line', () => {
	const fixture = new ComponentTestFixture<Line>(html`<mo-line style='width: ${extent}px; height: ${extent}px'></mo-line>`)

	it('should be a separator for assistive technology', () => {
		expect(fixture.component.role).toBe('separator')
		expect(fixture.component.getAttribute('role')).toBe('separator')
	})

	describe('Property "direction"', () => {
		it('should default to "horizontal" and reflect as an attribute', () => {
			expect(fixture.component.direction).toBe('horizontal')
			expect(fixture.component.getAttribute('direction')).toBe('horizontal')
		})

		it('should draw the rule along the configured axis (horizontal)', () => {
			const [before, after] = segmentsOf(fixture.component)

			expect(getComputedStyle(fixture.component).flexDirection).toBe('row')
			expect(before!.borderBlockEndWidth).toBe('1px')
			expect(before!.borderInlineEndWidth).toBe('0px')
			expect(after!.borderBlockEndWidth).toBe('1px')
		})

		it('should draw the rule along the configured axis (vertical)', async () => {
			fixture.component.direction = 'vertical'
			await fixture.updateComplete
			const [before, after] = segmentsOf(fixture.component)

			expect(getComputedStyle(fixture.component).flexDirection).toBe('column')
			expect(before!.borderInlineEndWidth).toBe('1px')
			expect(before!.borderBlockEndWidth).toBe('0px')
			expect(after!.borderInlineEndWidth).toBe('1px')
		})
	})

	describe('with slotted content', () => {
		const labelledFixture = new ComponentTestFixture<Line>(html`<mo-line style='width: ${extent}px'><span>Or</span></mo-line>`)

		it('should split the rule into two segments around the content', () => {
			const [before, after] = segmentsOf(labelledFixture.component)
			const label = labelledFixture.component.querySelector('span')!.getBoundingClientRect()
			const host = labelledFixture.component.getBoundingClientRect()

			expect(before!.width).toBeGreaterThan(0)
			expect(before!.width).toBeCloseTo(after!.width, -1)
			expect(before!.width + after!.width).toBeLessThan(extent - label.width)
			expect(label.left - host.left).toBeCloseTo(host.right - label.right, -1)
		})

		it('should draw one uninterrupted rule without content', () => {
			const [before, after] = segmentsOf(fixture.component)

			expect(getComputedStyle(fixture.component).columnGap).not.toBe('8px')
			expect(getComputedStyle(labelledFixture.component).columnGap).toBe('8px')
			expect(before!.width + after!.width).toBeCloseTo(extent, -1)
		})
	})
})