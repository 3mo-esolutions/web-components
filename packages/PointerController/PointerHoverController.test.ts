import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { PointerHoverController } from './PointerHoverController.js'

@component('pointer-hover-controller-test-component')
class PointerHoverControllerTestComponent extends Component {
	readonly spy = jasmine.createSpy()

	readonly pointerHoverController = new PointerHoverController(this, {
		handleHoverChange: this.spy
	})

	protected override get template() {
		return html`<div></div>`
	}
}

@component('pointer-hover-controller-target-test-component')
class PointerHoverControllerTargetTestComponent extends Component {
	hoverTarget = document.createElement('div')

	readonly pointerHoverController = new PointerHoverController(this, {
		target: () => this.hoverTarget,
	})

	protected override get template() {
		return html`<div></div>`
	}
}

describe('PointerHoverController', () => {
	const fixture = new ComponentTestFixture(() => new PointerHoverControllerTestComponent())

	const expectHover = (hover: boolean) => {
		expect(fixture.component.pointerHoverController.hover).toBe(hover)
		expect(fixture.component.spy).toHaveBeenCalledWith(hover)
	}

	it('should be false by default', () => {
		expect(fixture.component.pointerHoverController.hover).toBe(false)
	})

	it('should set hover to true on pointerenter', () => {
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		expectHover(true)
	})

	it('should set hover to false on pointerleave', () => {
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		expectHover(true)

		fixture.component.dispatchEvent(new PointerEvent('pointerleave'))
		expectHover(false)
	})

	it('should not listen on the document', async () => {
		const added = spyOn(document, 'addEventListener').and.callThrough()
		const component = document.body.appendChild(new PointerHoverControllerTestComponent())
		await component.updateComplete
		await new Promise(resolve => setTimeout(resolve))

		expect(added.calls.allArgs().map(([type]) => type).filter(type => String(type).startsWith('pointer'))).toEqual([])
		component.remove()
	})

	describe('refresh', () => {
		it('should adopt a ":hover" match without clearing a reported hover otherwise', async () => {
			const matches = spyOn(fixture.component, 'matches').and.returnValue(false)

			await fixture.component.pointerHoverController.refresh()
			expect(fixture.component.pointerHoverController.hover).toBe(false)
			expect(fixture.component.spy).not.toHaveBeenCalled()

			matches.and.returnValue(true)
			await fixture.component.pointerHoverController.refresh()
			expectHover(true)

			matches.and.returnValue(false)
			await fixture.component.pointerHoverController.refresh()
			expect(fixture.component.pointerHoverController.hover).toBe(true)
			expect(fixture.component.spy).toHaveBeenCalledTimes(1)
		})
	})

	describe('target option', () => {
		const targetFixture = new ComponentTestFixture(() => new PointerHoverControllerTargetTestComponent())

		beforeEach(() => new Promise(resolve => setTimeout(resolve)))

		it('should track the hover of the configured target instead of the host', () => {
			targetFixture.component.dispatchEvent(new PointerEvent('pointerenter'))
			expect(targetFixture.component.pointerHoverController.hover).toBe(false)

			targetFixture.component.hoverTarget.dispatchEvent(new PointerEvent('pointerenter'))
			expect(targetFixture.component.pointerHoverController.hover).toBe(true)
		})

		it('should follow a changed target once resubscribed', async () => {
			const previous = targetFixture.component.hoverTarget
			const next = document.body.appendChild(document.createElement('div'))
			targetFixture.component.hoverTarget = next
			targetFixture.component.pointerHoverController.resubscribe()
			await new Promise(resolve => setTimeout(resolve))

			previous.dispatchEvent(new PointerEvent('pointerenter'))
			expect(targetFixture.component.pointerHoverController.hover).toBe(false)

			next.dispatchEvent(new PointerEvent('pointerenter'))
			expect(targetFixture.component.pointerHoverController.hover).toBe(true)
			next.remove()
		})
	})
})