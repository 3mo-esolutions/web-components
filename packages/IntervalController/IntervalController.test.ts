import { Component, component } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { IntervalController } from './IntervalController.js'

const period = 100

@component('interval-controller-test-component')
class IntervalControllerTestComponent extends Component {
	tickCount = 0

	readonly intervalController = new IntervalController(this, period, () => this.tickCount++)
}

describe('IntervalController', () => {
	beforeEach(() => jasmine.clock().install())

	const fixture = new ComponentTestFixture(() => new IntervalControllerTestComponent())

	afterEach(() => jasmine.clock().uninstall())

	it('should run the task immediately when the host connects', () => {
		expect(fixture.component.tickCount).toBe(1)
	})

	it('should run the task once per period', () => {
		jasmine.clock().tick(period)
		expect(fixture.component.tickCount).toBe(2)

		jasmine.clock().tick(period)
		expect(fixture.component.tickCount).toBe(3)

		jasmine.clock().tick(period - 1)
		expect(fixture.component.tickCount).toBe(3)
	})

	it('should stop running the task once the host is disconnected', () => {
		fixture.component.remove()

		jasmine.clock().tick(period * 5)

		expect(fixture.component.tickCount).toBe(1)
	})
})