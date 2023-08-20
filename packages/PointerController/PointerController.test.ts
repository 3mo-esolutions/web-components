import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { PointerController } from './PointerController.js'

@component('pointer-controller-test-component')
class PointerControllerTestComponent extends Component {
	readonly pointerController = new PointerController(this)

	protected override get template() {
		return html`<div></div>`
	}
}

describe('PointerController', () => {
	const fixture = new ComponentTestFixture(() => new PointerControllerTestComponent())

	// How to test :hover state?
	xit('should track state when hovered', () => {
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		expect(fixture.component.pointerController?.hover).toBe(true)
	})

	it('should track state when not hovered', () => {
		expect(fixture.component.pointerController?.hover).toBe(false)
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		fixture.component.dispatchEvent(new PointerEvent('pointerleave'))
		expect(fixture.component.pointerController?.hover).toBe(false)
	})
})