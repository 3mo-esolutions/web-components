import { ComponentTestFixture } from '@a11d/lit-testing'
import { LoadingDialog } from './LoadingDialog.js'

describe('LoadingDialog', () => {
	const fixture = new ComponentTestFixture<LoadingDialog>('mo-loading-dialog')

	it('should display the loading template only when `loading` is true', async () => {
		expect(fixture.component.loading).toBeFalsy()
		expect(fixture.component.renderRoot.querySelector('slot[name=loading]')).toBeFalsy()

		fixture.component.loading = true
		await fixture.updateComplete

		expect(fixture.component.renderRoot.querySelector('slot[name=loading]')).toBeTruthy()
	})

	it('should render a circular progress when `loading` is true', async () => {
		fixture.component.loading = true
		await fixture.updateComplete

		expect(fixture.component.renderRoot.querySelector('slot[name=loading] > mo-circular-progress')).toBeTruthy()
	})

	it('should have default loading heading', async () => {
		fixture.component.loading = true
		await fixture.updateComplete

		expect(fixture.component.renderRoot.querySelector('mo-heading')?.textContent).toBe('Loading ...')
	})

	it('should be able to have custom loading heading', async () => {
		fixture.component.loading = true
		fixture.component.loadingHeading = 'Custom Loading Heading'
		await fixture.updateComplete

		expect(fixture.component.renderRoot.querySelector('mo-heading')?.textContent).toBe('Custom Loading Heading ...')
	})
})