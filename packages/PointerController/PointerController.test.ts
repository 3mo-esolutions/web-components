import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
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

	it('should track hover state', async () => {
		let browserHovered = false
		spyOn(fixture.component, 'matches').and.callFake(() => browserHovered)

		expect(fixture.component.pointerController?.hover).toBe(false)

		browserHovered = true
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		await new Promise(r => setTimeout(r, 20))
		expect(fixture.component.pointerController?.hover).toBe(true)

		browserHovered = false
		fixture.component.dispatchEvent(new PointerEvent('pointerleave'))
		await new Promise(r => setTimeout(r, 20))
		expect(fixture.component.pointerController?.hover).toBe(false)
	})

	it('should track press state', () => {
		expect(fixture.component.pointerController?.press).toBe(false)

		fixture.component.dispatchEvent(new PointerEvent('pointerdown'))
		expect(fixture.component.pointerController?.press).toBe(true)

		fixture.component.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
		expect(fixture.component.pointerController?.press).toBe(false)
	})
})