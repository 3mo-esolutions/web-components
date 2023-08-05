import { ComponentTestFixture } from '@a11d/lit/dist/test'
import { SplitButton } from './SplitButton.js'

describe('SplitButton', () => {
	const fixture = new ComponentTestFixture<SplitButton>('mo-split-button')

	it('should set pointer-events to "none" when disabled', async () => {
		fixture.component.disabled = true
		await fixture.updateComplete
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})

	describe('more button', () => {
		it('should respect the disabled property', async () => {
			fixture.component.disabled = true

			await fixture.updateComplete

			expect(fixture.component.renderRoot.querySelector('mo-button')?.disabled).toBe(true)
		})

		it('should prevent click event', () => {
			const spy = jasmine.createSpy()
			fixture.component.addEventListener('click', () => spy())

			fixture.component.renderRoot.querySelector('mo-button')?.click()

			expect(spy).not.toHaveBeenCalled()
		})
	})

	describe('menu', () => {
		it('should have "manualOpen" property', () => {
			expect(fixture.component.renderRoot.querySelector('mo-menu')?.manualOpen).toBe(true)
		})
	})
})