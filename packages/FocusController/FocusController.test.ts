import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { FocusController } from './FocusController.js'

@component('focus-controller-test-component')
class FocusControllerTestComponent extends Component {
	readonly focusController = new FocusController(this)

	protected override get template() {
		return html`<div></div>`
	}
}

describe('FocusController', () => {
	const fixture = new ComponentTestFixture(() => new FocusControllerTestComponent())

	it('should track state when focused', () => {
		fixture.component.dispatchEvent(new FocusEvent('focusin'))
		expect(fixture.component.focusController?.focused).toBe(true)
	})

	it('should track state when blurred', () => {
		expect(fixture.component.focusController?.focused).toBe(false)
		fixture.component.dispatchEvent(new FocusEvent('focusin'))
		fixture.component.dispatchEvent(new FocusEvent('focusout'))
		expect(fixture.component.focusController?.focused).toBe(false)
	})
})