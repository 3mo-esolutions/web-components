import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type SplitButton } from './SplitButton.js'
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
			const spy = vi.fn()
			fixture.component.addEventListener('click', () => spy())

			fixture.component.renderRoot.querySelector('mo-button')?.click()

			expect(spy).not.toHaveBeenCalled()
		})

		// On a line of text, the arrow sits above the middle by the room the text font keeps below the baseline, which the icon font has none of:
		it('should center its arrow vertically', async () => {
			const button = fixture.component.renderRoot.querySelector('mo-button')!
			await button.updateComplete
			await vi.waitFor(() => expect([...document.fonts].some(font => font.family.includes('Material Icons') && font.status === 'loaded')).toBe(true), { timeout: 10_000 })
			const center = (rect: DOMRect) => rect.top + rect.height / 2

			expect(center(button.querySelector('mo-icon')!.getBoundingClientRect())).toBeCloseTo(center(button.getBoundingClientRect()), 0)
		})
	})

	describe('menu', () => {
		it('should have "preventOpenOnAnchorEnter" property', () => {
			expect(fixture.component.renderRoot.querySelector('mo-menu')?.preventOpenOnAnchorEnter).toBe(true)
		})

		it('should stop propagation of click event on any menu-item', () => {
			const spy = vi.fn()
			fixture.component.addEventListener('click', () => spy())

			fixture.component.querySelector('mo-list-item')?.click()

			expect(spy).not.toHaveBeenCalled()
		})
	})
})
