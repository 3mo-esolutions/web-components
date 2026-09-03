import { Component, component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { PointerController } from './PointerController.js'

@component('pointer-controller-test-component')
class PointerControllerTestComponent extends Component {
	readonly pressChanges = new Array<boolean>()
	readonly hoverChanges = new Array<boolean>()

	readonly pointerController = new PointerController(this, {
		handlePressChange: press => this.pressChanges.push(press),
		handleHoverChange: hover => this.hoverChanges.push(hover),
	})

	protected override get template() {
		return html`<div></div>`
	}
}

describe('PointerController', () => {
	const fixture = new ComponentTestFixture(() => new PointerControllerTestComponent())

	const settleHover = () => new Promise(resolve => setTimeout(resolve, 60))

	it('should reflect the press state of its press sub-controller and forward handlePressChange', () => {
		expect(fixture.component.pointerController.press).toBeFalse()

		fixture.component.dispatchEvent(new PointerEvent('pointerdown'))
		expect(fixture.component.pointerController.press).toBeTrue()

		document.dispatchEvent(new PointerEvent('pointerup'))
		expect(fixture.component.pointerController.press).toBeFalse()

		expect(fixture.component.pressChanges).toEqual([true, false])
	})

	it('should reflect the hover state of its hover sub-controller and forward handleHoverChange', async () => {
		let hovered = false
		spyOn(fixture.component, 'matches').and.callFake(() => hovered)
		expect(fixture.component.pointerController.hover).toBeFalse()

		hovered = true
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		await settleHover()
		expect(fixture.component.pointerController.hover).toBeTrue()

		hovered = false
		fixture.component.dispatchEvent(new PointerEvent('pointerleave'))
		await settleHover()
		expect(fixture.component.pointerController.hover).toBeFalse()

		expect(fixture.component.hoverChanges).toEqual([true, false])
	})
})