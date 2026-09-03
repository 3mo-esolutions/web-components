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

@component('pointer-press-controller-target-test-component')
class PointerPressControllerTargetTestComponent extends Component {
	pressTarget = document.createElement('div')

	readonly pointerPressController = new PointerPressController(this, {
		target: () => this.pressTarget,
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

	it('should listen for the release on the document for the duration of the press alone', () => {
		const added = spyOn(document, 'addEventListener').and.callThrough()
		const removed = spyOn(document, 'removeEventListener').and.callThrough()
		const releaseTypes = (spy: jasmine.Spy) => spy.calls.allArgs().map(([type]) => type).filter(type => type === 'pointerup' || type === 'pointercancel')

		expect(releaseTypes(added)).toEqual([])

		fixture.component.dispatchEvent(new PointerEvent('pointerdown'))
		expect(releaseTypes(added)).toEqual(['pointerup', 'pointercancel'])

		document.dispatchEvent(new PointerEvent('pointerup'))
		expect(releaseTypes(removed)).toEqual(['pointerup', 'pointercancel'])
	})

	describe('target option', () => {
		const targetFixture = new ComponentTestFixture(() => new PointerPressControllerTargetTestComponent())

		it('should follow a changed target once resubscribed', async () => {
			const previous = targetFixture.component.pressTarget
			const next = document.body.appendChild(document.createElement('div'))
			targetFixture.component.pressTarget = next
			targetFixture.component.pointerPressController.resubscribe()
			await new Promise(resolve => setTimeout(resolve))

			previous.dispatchEvent(new PointerEvent('pointerdown'))
			expect(targetFixture.component.pointerPressController.press).toBe(false)

			next.dispatchEvent(new PointerEvent('pointerdown'))
			expect(targetFixture.component.pointerPressController.press).toBe(true)
			next.remove()
		})
	})
})