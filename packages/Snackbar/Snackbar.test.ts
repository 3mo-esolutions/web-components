import { ComponentTestFixture } from '@a11d/lit-testing'
import { Snackbar } from './index.js'

describe('Snackbar', () => {
	const fixture = new ComponentTestFixture(() => new Snackbar)

	it('should set mwc-snackbar\'s "timeoutMs" to -1', async () => {
		await new Promise(resolve => setTimeout(resolve, 100))
		expect(fixture.component.renderRoot.querySelector('mwc-snackbar')?.timeoutMs).toBe(-1)
	})
})