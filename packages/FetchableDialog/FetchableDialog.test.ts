import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FetchableDialog } from './FetchableDialog.js'
import './index.js'

describe('FetchableDialog', () => {
	const waitUntil = async (condition: () => boolean, timeoutInMilliseconds = 3000) => {
		const start = performance.now()
		while (condition() === false) {
			if (performance.now() - start > timeoutInMilliseconds) {
				throw new Error('The condition has not been met in time.')
			}
			await new Promise(resolve => setTimeout(resolve, 10))
		}
	}

	let resolvers = new Array<(value: string) => void>()
	const deferredFetch = () => new Promise<string>(resolve => resolvers.push(resolve))

	beforeEach(() => resolvers = [])

	const fixture = new ComponentTestFixture<FetchableDialog<string>>(html`
		<mo-fetchable-dialog .fetch=${deferredFetch}></mo-fetchable-dialog>
	`)

	const loadingSlot = () => fixture.component.renderRoot.querySelector('slot[name=loading]')

	it('should show the loading state while the fetch is pending and lift it once settled', async () => {
		await waitUntil(() => fixture.component.fetcherController.pending)
		await fixture.updateComplete

		expect(loadingSlot()).not.toBeNull()
		expect(fixture.component.renderRoot.querySelector('mo-heading')?.textContent).toBe('Loading ...')

		resolvers[0]!('data')
		await waitUntil(() => fixture.component.fetcherController.pending === false)
		await fixture.updateComplete

		expect(loadingSlot()).toBeNull()
		expect(fixture.component.fetcherController.value).toBe('data')
	})

	it('should refetch when the fetch function is replaced', async () => {
		await waitUntil(() => resolvers.length === 1)
		resolvers[0]!('first')
		await waitUntil(() => fixture.component.fetcherController.value === 'first')

		const replacement = jasmine.createSpy('fetch').and.returnValue(Promise.resolve('second'))
		fixture.component.fetch = replacement
		await waitUntil(() => fixture.component.fetcherController.value === 'second')

		expect(replacement).toHaveBeenCalledTimes(1)
		expect(resolvers.length).toBe(1)
	})
})