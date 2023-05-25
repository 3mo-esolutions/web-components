import { ComponentTestFixture } from '@a11d/lit/dist/test'
import { Button } from '@3mo/button/'
import { SplitButton } from './SplitButton.js'

describe('SplitButton', () => {
	const fixture = new ComponentTestFixture<SplitButton>('mo-split-button')

	it('should set the disabled property on the more button', async () => {
		fixture.component.disabled = true

		await fixture.updateComplete

		expect(fixture.component.renderRoot.querySelector<Button>('#more')?.disabled).toBe(true)
	})
})