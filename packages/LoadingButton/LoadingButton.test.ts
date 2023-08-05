import { ComponentTestFixture } from '@a11d/lit/dist/test'
import { LoadingButton } from './LoadingButton.js'

describe('LoadingButton', () => {
	const fixture = new ComponentTestFixture<LoadingButton>('mo-loading-button')

	it('should stop click events when disabled', async () => {
		const spy = jasmine.createSpy()
		fixture.component.addEventListener('click', () => spy())

		fixture.component.disabled = true
		await fixture.updateComplete

		fixture.component.click()

		expect(spy).not.toHaveBeenCalled()
	})
})