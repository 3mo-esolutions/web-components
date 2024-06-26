import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Button } from './Button.js'

describe('Button', () => {
	const fixture = new ComponentTestFixture<Button>('mo-button')

	it('should set pointer-events to "none" when disabled', async () => {
		fixture.component.disabled = true
		await fixture.updateComplete
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})
})