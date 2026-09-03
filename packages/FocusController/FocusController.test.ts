import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { FocusController, type FocusMethod } from './FocusController.js'

@component('focus-controller-test-component')
class FocusControllerTestComponent extends Component {
	focused = false
	bubbled = false
	method: FocusMethod = 'programmatic'
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
	focusTarget = document.createElement('div')

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
		beforeEach(() => fixture.component.tabIndex = 0)

		afterEach(() => fixture.component.blur())

		// Headless Firefox delivers no focus events for a programmatic focus(), so the event is dispatched alongside
		const focusWith = (focusVisible: boolean) => {
			fixture.component.focus({ focusVisible } as FocusOptions)
			fixture.component.dispatchEvent(new FocusEvent('focusin'))
		}

		it('should be keyboard when the focus is visible', () => {
			focusWith(true)
			if (!fixture.component.matches(':focus-visible')) {
				pending('The platform did not apply the requested focus visibility, as headless Firefox does not in an inactive window')
			}
			expectFocused(true, false, 'keyboard')
		})

		it('should be pointer when a press within the target precedes the focus', () => {
			fixture.component.dispatchEvent(new PointerEvent('pointerdown'))
			focusWith(false)
			expectFocused(true, false, 'pointer')
		})

		it('should be programmatic when the focus is neither visible nor preceded by a press within the target', () => {
			focusWith(false)
			expectFocused(true, false, 'programmatic')
		})

		it('should be pointer when losing focus after a pointer interaction within the target', () => {
			focusWith(true)
			fixture.component.dispatchEvent(new PointerEvent('pointerdown'))

			fixture.component.dispatchEvent(new FocusEvent('focusout'))

			expectFocused(false, false, 'pointer')
		})

		it('should be programmatic when losing focus without an interaction within the target', () => {
			focusWith(false)

			fixture.component.dispatchEvent(new FocusEvent('focusout'))

			expectFocused(false, false, 'programmatic')
		})

		it('should be keyboard when losing focus after a keyboard interaction within the target', () => {
			focusWith(false)
			fixture.component.dispatchEvent(new PointerEvent('pointerdown'))
			fixture.component.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))

			fixture.component.dispatchEvent(new FocusEvent('focusout'))

			expectFocused(false, false, 'keyboard')
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

		it('should follow a changed target once resubscribed', async () => {
			const previous = fixture.component.focusTarget
			const next = document.body.appendChild(document.createElement('div'))
			fixture.component.focusTarget = next
			fixture.component.focusController.resubscribe()
			await new Promise(r => setTimeout(r))

			previous.dispatchEvent(new FocusEvent('focusin'))
			expect(fixture.component.focused).toBe(false)

			next.dispatchEvent(new FocusEvent('focusin'))
			expect(fixture.component.focused).toBe(true)
			next.remove()
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