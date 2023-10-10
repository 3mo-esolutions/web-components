import { ComponentTestFixture } from '@a11d/lit-testing'
import { Checkbox } from './Checkbox.js'

describe('Checkbox', () => {
	const fixture = new ComponentTestFixture<Checkbox>('mo-checkbox')

	it('should set pointer-events to "none" when disabled', async () => {
		fixture.component.disabled = true
		await fixture.updateComplete
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})
})