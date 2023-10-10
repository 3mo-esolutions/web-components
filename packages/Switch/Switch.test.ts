import { ComponentTestFixture } from '@a11d/lit-testing'
import { Switch } from './Switch.js'

describe('Switch', () => {
	const fixture = new ComponentTestFixture<Switch>('mo-switch')

	it('should set pointer-events to "none" when disabled', async () => {
		fixture.component.disabled = true
		await fixture.updateComplete
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})
})