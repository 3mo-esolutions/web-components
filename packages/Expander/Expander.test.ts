import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Expander } from './Expander.js'
import '.'

describe('Expander', () => {
	const fixture = new ComponentTestFixture<Expander>('mo-expander')

	it('should be closed by default', () => {
		expect(fixture.component.open).toBe(false)
	})

	it('should have the "header" part on the flex container', () => {
		expect(fixture.component.renderRoot.querySelector('mo-flex')?.getAttribute('part')).toBe('header')
	})

	describe('heading', () => {
		it('should have the "heading" part', () => {
			expect(fixture.component.renderRoot.querySelector('mo-heading')?.getAttribute('part')).toBe('heading')
		})

		it('should get reflected on mo-heading', async () => {
			fixture.component.heading = 'heading'

			await fixture.updateComplete

			expect(fixture.component.renderRoot.querySelector('mo-heading')?.textContent).toBe('heading')
		})

		it('should not be user-selectable', () => {
			expect(getComputedStyle(fixture.component.renderRoot.querySelector('summary')!)?.userSelect).toBe('none')
		})
	})

	describe('expand-collapse-icon-button', () => {
		it('should be closed by default', () => {
			expect(fixture.component.renderRoot.querySelector('mo-expand-collapse-icon-button')?.open).toBe(false)
		})

		it('should have the "expand-collapse-icon-button" part', () => {
			expect(fixture.component.renderRoot.querySelector('mo-expand-collapse-icon-button')?.getAttribute('part')).toBe('expand-collapse-icon-button')
		})

		it('should reflect the "open" property', async () => {
			fixture.component.open = true

			await fixture.updateComplete

			expect(fixture.component.renderRoot.querySelector('mo-expand-collapse-icon-button')?.open).toBe(true)
		})
	})

	describe('details', () => {
		it('should be closed by default', () => {
			expect(fixture.component.detailsElement.open).toBe(false)
		})

		it('should reflect the "open" property', async () => {
			fixture.component.open = true

			await fixture.updateComplete

			expect(fixture.component.detailsElement.open).toBe(true)
		})

		it('should reflect "open" & dispatch "openChange" event when opens', async () => {
			spyOn(fixture.component.openChange, 'dispatch')
			fixture.component.detailsElement.open = true
			fixture.component.detailsElement.dispatchEvent(new Event('toggle'))

			await fixture.updateComplete

			expect(fixture.component.open).toBe(true)
			expect(fixture.component.openChange.dispatch).toHaveBeenCalledWith(true)
		})
	})

	describe('content', () => {
		it('should be user-selectable', () => {
			const div = document.createElement('div')

			fixture.component.appendChild(div)

			expect(getComputedStyle(div)?.userSelect).toBe('auto')
		})
	})
})