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

@component('focus-controller-target-test-component')
class FocusControllerTargetTestComponent extends Component {
	readonly focusTarget = document.createElement('div')

	focused = false

	readonly focusController = new FocusController(this, {
		target: () => this.focusTarget,
		handleChange: focused => this.focused = focused,
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

	it('should request a host update when the focus state changes', () => {
		const requestUpdate = spyOn(fixture.component, 'requestUpdate')

		fixture.component.dispatchEvent(new FocusEvent('focusin'))
		expect(requestUpdate).toHaveBeenCalledTimes(1)

		fixture.component.dispatchEvent(new FocusEvent('focusin'))
		expect(requestUpdate).toHaveBeenCalledTimes(1)

		fixture.component.dispatchEvent(new FocusEvent('focusout'))
		expect(requestUpdate).toHaveBeenCalledTimes(2)
	})

	it('should stop tracking focus after the host is disconnected', () => {
		fixture.component.remove()

		fixture.component.dispatchEvent(new FocusEvent('focusin'))

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

	describe('bubbled', () => {
		it('should be true when focus originates from a descendant', () => {
			const descendant = document.createElement('input')
			fixture.component.append(descendant)

			descendant.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

			expectFocused(true, true)
		})

		it('should be false when the host itself receives focus', () => {
			fixture.component.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

			expectFocused(true, false)
		})
	})

	describe('target option', () => {
		const fixture = new ComponentTestFixture(() => new FocusControllerTargetTestComponent())

		beforeEach(() => new Promise(resolve => setTimeout(resolve, 0)))

		it('should track the focus of the configured target instead of the host', () => {
			fixture.component.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
			expect(fixture.component.focusController.focused).toBeFalse()
			expect(fixture.component.focused).toBeFalse()

			fixture.component.focusTarget.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
			expect(fixture.component.focusController.focused).toBeTrue()
			expect(fixture.component.focused).toBeTrue()
		})
	})

	describe('focusIn/focusOut', () => {
		it('should set focused via focusIn()', () => {
			fixture.component.focusController.focusIn()

			expect(fixture.component.focusController.focused).toBeTrue()
			expect(fixture.component.focused).toBeTrue()
		})

		it('should reset focused via focusOut()', () => {
			fixture.component.focusController.focusIn()

			fixture.component.focusController.focusOut()

			expect(fixture.component.focusController.focused).toBeFalse()
			expect(fixture.component.focused).toBeFalse()
		})
	})
})