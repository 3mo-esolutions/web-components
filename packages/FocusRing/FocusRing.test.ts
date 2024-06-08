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
})