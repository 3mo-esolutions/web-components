import { Component, component } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { IntervalController } from './IntervalController.js'

const period = 100

@component('interval-controller-test-component')
class IntervalControllerTestComponent extends Component {
	tickCount = 0

	readonly intervalController = new IntervalController(this, period, () => { this.tickCount++ })
}

describe('IntervalController', () => {
	beforeEach(() => vi.useFakeTimers())

	const fixture = new ComponentTestFixture(() => new IntervalControllerTestComponent())

	afterEach(() => vi.useRealTimers())

	it('should run the task immediately when the host connects', () => {
		expect(fixture.component.tickCount).toBe(1)
	})

	it('should run the task once per period', () => {
		vi.advanceTimersByTime(period)
		expect(fixture.component.tickCount).toBe(2)

		vi.advanceTimersByTime(period)
		expect(fixture.component.tickCount).toBe(3)

		vi.advanceTimersByTime(period - 1)
		expect(fixture.component.tickCount).toBe(3)
	})

	it('should stop running the task once the host is disconnected', () => {
		fixture.component.remove()

		vi.advanceTimersByTime(period * 5)

		expect(fixture.component.tickCount).toBe(1)
	})
})