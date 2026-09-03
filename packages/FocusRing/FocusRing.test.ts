import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import './FocusRing.js'

describe('FocusRing', () => {
	const fixture = new ComponentTestFixture(html`<mo-focus-ring></mo-focus-ring>`)

	it('should reject dispatching "visibility-changed" event', () => {
		spyOn(HTMLElement.prototype, 'dispatchEvent')

		const visibilityEvent = fixture.component.dispatchEvent(new Event('visibility-changed'))
		expect(visibilityEvent).toBe(false)
		expect(HTMLElement.prototype.dispatchEvent).not.toHaveBeenCalled()

		fixture.component.dispatchEvent(new Event('other-event'))
		expect(HTMLElement.prototype.dispatchEvent).toHaveBeenCalled()
	})

	it('should be hidden from assistive technology by default', () => {
		expect(fixture.component.ariaHidden).toBe('true')
	})

	it('should ignore attempts to set the aria-hidden attribute, as it is provided as a property', () => {
		fixture.component.setAttribute('aria-hidden', 'false')

		expect(fixture.component.getAttribute('aria-hidden')).toBe('true')
		expect(fixture.component.ariaHidden).toBe('true')

		fixture.component.setAttribute('inward', '')
		expect(fixture.component.hasAttribute('inward')).toBe(true)
	})
})