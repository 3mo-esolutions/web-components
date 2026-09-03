import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type EntityDialog } from './EntityDialog.js'
import './index.js'

class Entity {
	toString() { return 'Invoice' }
}

describe('EntityDialog', () => {
	const waitUntil = async (condition: () => boolean, timeoutInMilliseconds = 3000) => {
		const start = performance.now()
		while (condition() === false) {
			if (performance.now() - start > timeoutInMilliseconds) {
				throw new Error('The condition has not been met in time.')
			}
			await new Promise(resolve => setTimeout(resolve, 10))
		}
	}

	let resolvers = new Array<(value: Entity) => void>()
	const deferredFetch = () => new Promise<Entity>(resolve => resolvers.push(resolve))

	beforeEach(() => resolvers = [])

	const fixture = new ComponentTestFixture<EntityDialog<Entity>>(html`
		<mo-entity-dialog
			.parameters=${{ id: 1 }}
			.entity=${new Entity}
			.fetch=${deferredFetch}
		></mo-entity-dialog>
	`)

	const primaryButton = () => fixture.component.primaryActionElement
	const secondaryButton = () => fixture.component.secondaryActionElement

	it('should default the primary button text to Save and hide the button when primaryButtonText is empty', async () => {
		expect(primaryButton()?.textContent?.trim()).toBe('Save')

		fixture.component.primaryButtonText = ''
		await fixture.updateComplete

		expect(primaryButton()).toBeUndefined()
	})

	it('should render the Delete secondary button only when a delete action is set', async () => {
		expect(secondaryButton()).toBeUndefined()

		fixture.component.delete = () => Promise.resolve()
		await fixture.updateComplete

		expect(secondaryButton()?.textContent?.trim()).toBe('Delete')
	})

	it('should disable the action buttons while the fetch is pending', async () => {
		fixture.component.delete = () => Promise.resolve()
		await waitUntil(() => fixture.component.fetcherController.pending)
		await fixture.updateComplete

		expect(primaryButton()?.hasAttribute('disabled')).toBeTrue()
		expect(secondaryButton()?.hasAttribute('disabled')).toBeTrue()

		resolvers[0]!(new Entity)
		await waitUntil(() => fixture.component.fetcherController.pending === false)
		await fixture.updateComplete

		expect(primaryButton()?.hasAttribute('disabled')).toBeFalse()
		expect(secondaryButton()?.hasAttribute('disabled')).toBeFalse()
	})
})