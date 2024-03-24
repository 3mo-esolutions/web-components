import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { PointerHoverController } from './PointerHoverController.js'

@component('pointer-hover-controller-test-component')
class PointerHoverControllerTestComponent extends Component {
	readonly pointerHoverController = new PointerHoverController(this)

	protected override get template() {
		return html`<div></div>`
	}
}

describe('PointerHoverController', () => {
	const fixture = new ComponentTestFixture(() => new PointerHoverControllerTestComponent())

	let browserHovered = false
	beforeEach(() => {
		spyOn(fixture.component, 'matches').and.callFake(() => browserHovered)
	})

	it('should be false by default', () => {
		expect(fixture.component.pointerHoverController?.hover).toBe(false)
	})

	xit('should set hover to true on pointerenter', async () => {
		browserHovered = true
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		await new Promise(r => setTimeout(r, 20))
		expect(fixture.component.pointerHoverController?.hover).toBe(true)
	})

	it('should set hover to false on pointerleave', async () => {
		browserHovered = true
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		await new Promise(r => setTimeout(r, 20))
		expect(fixture.component.pointerHoverController?.hover).toBe(true)

		browserHovered = false
		fixture.component.dispatchEvent(new PointerEvent('pointerleave'))
		await new Promise(r => setTimeout(r, 20))
		expect(fixture.component.pointerHoverController?.hover).toBe(false)
	})

	xit('should set hover to false on pointerdown', async () => {
		browserHovered = true
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		await new Promise(r => setTimeout(r, 20))
		expect(fixture.component.pointerHoverController?.hover).toBe(true)

		browserHovered = false
		document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
		await new Promise(r => setTimeout(r, 20))
		expect(fixture.component.pointerHoverController?.hover).toBe(false)
	})

	xit('should set hover to false on pointerup', async () => {
		browserHovered = true
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		await new Promise(r => setTimeout(r, 20))
		expect(fixture.component.pointerHoverController?.hover).toBe(true)

		browserHovered = false
		document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
		await new Promise(r => setTimeout(r, 20))
		expect(fixture.component.pointerHoverController?.hover).toBe(false)
	})

	it('should set hover to false on pointercancel', async () => {
		browserHovered = true
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		await new Promise(r => setTimeout(r, 20))
		expect(fixture.component.pointerHoverController?.hover).toBe(true)

		browserHovered = false
		document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }))
		await new Promise(r => setTimeout(r, 20))
		expect(fixture.component.pointerHoverController?.hover).toBe(false)
	})
})