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

	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	describe('the press itself', () => {
		it('triggers immediately, so a stepper does not wait for the release', () => {
			press()
			expect(triggers()).toEqual([0])
		})

		it('can be told not to, for a consumer which acts on its own click', () => {
			fixture.component.triggerOnPress = false
			press()
			expect(triggers()).toEqual([])

			vi.advanceTimersByTime(500)
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
			vi.advanceTimersByTime(499)
			expect(triggers()).toEqual([0])
		})

		it('places the first repetition exactly on it, not an interval late', () => {
			press()
			vi.advanceTimersByTime(500)
			expect(triggers()).toEqual([0, 1])
		})

		it('is not repeating until it has passed', () => {
			press()
			expect(fixture.component.pointerRepeatController.repeating).toBe(false)
			vi.advanceTimersByTime(500)
			expect(fixture.component.pointerRepeatController.repeating).toBe(true)
		})
	})

	describe('the repetition', () => {
		it('continues at the interval, counting up', () => {
			press()
			vi.advanceTimersByTime(650)
			expect(triggers()).toEqual([0, 1, 2, 3, 4])
		})

		it('stops on release, and nothing arrives afterwards', () => {
			press()
			vi.advanceTimersByTime(600)
			const untilRelease = [...triggers()]
			expect(untilRelease.length).toBeGreaterThan(1)

			release()
			vi.advanceTimersByTime(1000)
			expect(triggers()).toEqual(untilRelease)
			expect(fixture.component.pointerRepeatController.repeating).toBe(false)
		})

		it('stops on pointercancel', () => {
			press()
			vi.advanceTimersByTime(600)
			const untilCancel = triggers().length

			release('pointercancel')
			vi.advanceTimersByTime(1000)
			expect(triggers().length).toBe(untilCancel)
		})

		it('stops when the host disconnects mid-press', () => {
			press()
			vi.advanceTimersByTime(600)
			const untilDisconnect = triggers().length

			fixture.component.remove()
			vi.advanceTimersByTime(1000)
			expect(triggers().length).toBe(untilDisconnect)
		})

		it('can be stopped without ending the press', () => {
			press()
			vi.advanceTimersByTime(500)
			const untilStop = triggers().length

			fixture.component.pointerRepeatController.stop()
			vi.advanceTimersByTime(1000)

			expect(triggers().length).toBe(untilStop)
			expect(fixture.component.pointerRepeatController.press).toBe(true)
		})
	})

	describe('a second press', () => {
		it('counts from zero again', () => {
			press()
			vi.advanceTimersByTime(600)
			release()

			fixture.component.repetitions.length = 0
			press()
			expect(triggers()).toEqual([0])
		})

		it('waits out the delay again rather than resuming mid-repetition', () => {
			press()
			vi.advanceTimersByTime(600)
			release()

			fixture.component.repetitions.length = 0
			press()
			vi.advanceTimersByTime(100)
			expect(triggers()).toEqual([0])
		})
	})
})