import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { FocusController, type FocusMethod } from './FocusController.js'

@component('focus-controller-test-component')
class FocusControllerTestComponent extends Component {
	focused = false
	bubbled = false
	method: 'pointer' | 'keyboard' | 'programmatic' = 'programmatic'
	readonly focusController = new FocusController(this, {
		handleChange: (focused, bubbled, method) => {
			this.focused = focused
			this.bubbled = bubbled
			this.method = method
		}
	})

	protected override get template() {
		return html`<div></div>`
	}
}

describe('FocusController', () => {
	const fixture = new ComponentTestFixture(() => new FocusControllerTestComponent())

	const expectFocused = (focus: boolean, bubbled = false, method: FocusMethod = 'programmatic') => {
		expect(fixture.component.focusController?.focused).toBe(focus)
		expect(fixture.component.focused).toBe(focus)
		expect(fixture.component.bubbled).toBe(bubbled)
		expect(fixture.component.method).toBe(method)
	}

	it('should track state when focused', () => {
		fixture.component.dispatchEvent(new FocusEvent('focusin'))
		expectFocused(true)
	})

	it('should track state when blurred', () => {
		expectFocused(false)
		fixture.component.dispatchEvent(new FocusEvent('focusin'))
		fixture.component.dispatchEvent(new FocusEvent('focusout'))
		expectFocused(false)
	})

	describe('method', () => {
		it('should be pointer when pointerdown', () => {
			document.dispatchEvent(new PointerEvent('pointerdown'))
			fixture.component.dispatchEvent(new FocusEvent('focusin'))
			expectFocused(true, false, 'pointer')
		})

		it('should be keyboard when keydown', () => {
			document.dispatchEvent(new KeyboardEvent('keydown'))
			fixture.component.dispatchEvent(new FocusEvent('focusin'))
			expectFocused(true, false, 'keyboard')
		})

		it('should be programmatic when focusin', () => {
			fixture.component.dispatchEvent(new FocusEvent('focusin'))
			expectFocused(true, false, 'programmatic')
		})

		it('should be programmatic after pointerdown', () => {
			document.dispatchEvent(new PointerEvent('pointerdown'))
			fixture.component.dispatchEvent(new FocusEvent('focusin'))
			fixture.component.dispatchEvent(new FocusEvent('focusout'))

			document.dispatchEvent(new KeyboardEvent('keydown'))
			fixture.component.dispatchEvent(new FocusEvent('focusin'))
			fixture.component.dispatchEvent(new FocusEvent('focusout'))

			fixture.component.dispatchEvent(new FocusEvent('focusin'))
			expectFocused(true, false, 'programmatic')
		})
	})
})