import { ComponentTestFixture } from '@a11d/lit-testing'
import { LoadingButton } from './LoadingButton.js'
import './index.js'

describe('LoadingButton', () => {
	const fixture = new ComponentTestFixture<LoadingButton>('mo-loading-button')

	it('should stop click events when disabled', async () => {
		fixture.component.disabled = true
		await fixture.updateComplete
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})

	it('should stop click events when loading', async () => {
		fixture.component.loading = true
		await fixture.updateComplete
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})
})