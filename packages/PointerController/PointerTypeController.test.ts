import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type PointerType, PointerTypeController } from './PointerTypeController.js'

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

	const expectType = (type: PointerType) => {
		expect(fixture.component.pointerTypeController?.type).toBe(type)
		expect(fixture.component.spy).toHaveBeenCalledWith(type)
	}

	it('should default to the current type', () => {
		expect(fixture.component.pointerTypeController?.type).toBe('mouse')
		expect(fixture.component.spy).not.toHaveBeenCalled()
	})

	it('should support "mouse"', () => {
		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' }))
		expectType('mouse')
	})

	it('should support "touch"', () => {
		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch' }))
		expectType('touch')
	})

	it('should support "pen"', () => {
		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'pen' }))
		expectType('pen')
	})
})