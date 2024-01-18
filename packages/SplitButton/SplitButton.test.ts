import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { SplitButton } from './SplitButton.js'
import './index.js'

describe('SplitButton', () => {
	const fixture = new ComponentTestFixture<SplitButton>(html`
		<mo-split-button>
			<mo-button>Button</mo-button>
			<mo-list-item slot='more'>Item 1</mo-list-item>
			<mo-list-item slot='more'>Item 2</mo-list-item>
		</mo-split-button>
	`)

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
		it('should have "preventOpenOnAnchorEnter" property', () => {
			expect(fixture.component.renderRoot.querySelector('mo-menu')?.preventOpenOnAnchorEnter).toBe(true)
		})

		it('should stop propagation of click event on any menu-item', () => {
			const spy = jasmine.createSpy()
			fixture.component.addEventListener('click', () => spy())

			fixture.component.querySelector('mo-list-item')?.click()

			expect(spy).not.toHaveBeenCalled()
		})
	})
})