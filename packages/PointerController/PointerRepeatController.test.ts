import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { PointerRepeatController } from './PointerRepeatController.js'

@component('pointer-repeat-controller-test-component')
class PointerRepeatControllerTestComponent extends Component {
	triggerOnPress = true
	readonly repetitions = new Array<number>()

	readonly pointerRepeatController = new PointerRepeatController(this, host => ({
		get triggerOnPress() { return host.triggerOnPress },
		handleTrigger: repetition => host.repetitions.push(repetition),
	}))

	protected override get template() {
		return html`<div></div>`
	}
}

describe('PointerRepeatController', () => {
	const fixture = new ComponentTestFixture(() => new PointerRepeatControllerTestComponent())

	const press = () => fixture.component.dispatchEvent(new PointerEvent('pointerdown'))
	const release = (type = 'pointerup') => document.dispatchEvent(new PointerEvent(type))
	const triggers = () => fixture.component.repetitions

	beforeEach(() => jasmine.clock().install())
	afterEach(() => jasmine.clock().uninstall())

	describe('the press itself', () => {
		it('triggers immediately, so a stepper does not wait for the release', () => {
			press()
			expect(triggers()).toEqual([0])
		})

		it('can be told not to, for a consumer which acts on its own click', () => {
			fixture.component.triggerOnPress = false
			press()
			expect(triggers()).toEqual([])

			jasmine.clock().tick(500)
			expect(triggers()).toEqual([0])
		})

		it('reports press like the controller it extends', () => {
			expect(fixture.component.pointerRepeatController.press).toBe(false)
			press()
			expect(fixture.component.pointerRepeatController.press).toBe(true)
		})
	})

	describe('the delay', () => {
		it('holds the first repetition back', () => {
			press()
			jasmine.clock().tick(499)
			expect(triggers()).toEqual([0])
		})

		it('places the first repetition exactly on it, not an interval late', () => {
			press()
			jasmine.clock().tick(500)
			expect(triggers()).toEqual([0, 1])
		})

		it('is not repeating until it has passed', () => {
			press()
			expect(fixture.component.pointerRepeatController.repeating).toBe(false)
			jasmine.clock().tick(500)
			expect(fixture.component.pointerRepeatController.repeating).toBe(true)
		})
	})

	describe('the repetition', () => {
		it('continues at the interval, counting up', () => {
			press()
			jasmine.clock().tick(650)
			expect(triggers()).toEqual([0, 1, 2, 3, 4])
		})

		it('stops on release, and nothing arrives afterwards', () => {
			press()
			jasmine.clock().tick(600)
			const untilRelease = [...triggers()]
			expect(untilRelease.length).toBeGreaterThan(1)

			release()
			jasmine.clock().tick(1000)
			expect(triggers()).toEqual(untilRelease)
			expect(fixture.component.pointerRepeatController.repeating).toBe(false)
		})

		it('stops on pointercancel', () => {
			press()
			jasmine.clock().tick(600)
			const untilCancel = triggers().length

			release('pointercancel')
			jasmine.clock().tick(1000)
			expect(triggers().length).toBe(untilCancel)
		})

		it('stops when the host disconnects mid-press', () => {
			press()
			jasmine.clock().tick(600)
			const untilDisconnect = triggers().length

			fixture.component.remove()
			jasmine.clock().tick(1000)
			expect(triggers().length).toBe(untilDisconnect)
		})

		it('can be stopped without ending the press', () => {
			press()
			jasmine.clock().tick(500)
			const untilStop = triggers().length

			fixture.component.pointerRepeatController.stop()
			jasmine.clock().tick(1000)

			expect(triggers().length).toBe(untilStop)
			expect(fixture.component.pointerRepeatController.press).toBe(true)
		})
	})

	describe('a second press', () => {
		it('counts from zero again', () => {
			press()
			jasmine.clock().tick(600)
			release()

			fixture.component.repetitions.length = 0
			press()
			expect(triggers()).toEqual([0])
		})

		it('waits out the delay again rather than resuming mid-repetition', () => {
			press()
			jasmine.clock().tick(600)
			release()

			fixture.component.repetitions.length = 0
			press()
			jasmine.clock().tick(100)
			expect(triggers()).toEqual([0])
		})
	})
})