import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { PointerTypeController } from './PointerTypeController.js'

@component('pointer-type-controller-test-component')
class PointerTypeControllerTestComponent extends Component {
	readonly spy = jasmine.createSpy()

	readonly pointerTypeController = new PointerTypeController(this, {
		handleTypeChange: this.spy
	})

	protected override get template() {
		return html`<div></div>`
	}
}

describe('PointerTypeController', () => {
	const fixture = new ComponentTestFixture(() => new PointerTypeControllerTestComponent())

	beforeEach(() => {
		(PointerTypeController as any)._type = undefined
	})

	it('should support "touch"', () => {
		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch' }))
		expect(fixture.component.pointerTypeController.type).toBe('touch')
	})

	it('should support "pen"', () => {
		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'pen' }))
		expect(fixture.component.pointerTypeController.type).toBe('pen')
	})

	it('should support "mouse"', () => {
		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch' }))
		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' }))
		expect(fixture.component.pointerTypeController.type).toBe('mouse')
		expect(fixture.component.spy).toHaveBeenCalledWith('mouse')
	})
})