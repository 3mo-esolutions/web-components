import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { PointerPressController } from './PointerPressController.js'

@component('pointer-press-controller-test-component')
class PointerPressControllerTestComponent extends Component {
	readonly spy = jasmine.createSpy()

	readonly pointerPressController = new PointerPressController(this, {
		handlePressChange: this.spy
	})

	protected override get template() {
		return html`<div></div>`
	}
}

describe('PointerPressController', () => {
	const fixture = new ComponentTestFixture(() => new PointerPressControllerTestComponent())

	const expectPress = (press: boolean) => {
		expect(fixture.component.pointerPressController?.press).toBe(press)
		expect(fixture.component.spy).toHaveBeenCalledWith(press)
	}

	it('should be false by default', () => {
		expect(fixture.component.pointerPressController?.press).toBe(false)
	})

	it('should set press to true on pointerdown', () => {
		fixture.component.dispatchEvent(new PointerEvent('pointerdown'))
		expectPress(true)
	})

	it('should set press to false on pointerup', () => {
		fixture.component.dispatchEvent(new PointerEvent('pointerdown'))
		expectPress(true)

		fixture.component.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
		expectPress(false)
	})

	it('should set press to false on pointercancel', () => {
		fixture.component.dispatchEvent(new PointerEvent('pointerdown'))
		expectPress(true)

		fixture.component.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }))
		expectPress(false)
	})
})