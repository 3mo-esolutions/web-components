import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { GenericFetchableDialog } from './GenericFetchableDialog.js'
import './index.js'

type Item = { id: number, name: string }

describe('GenericFetchableDialog', () => {
	const waitUntil = async (condition: () => boolean, timeoutInMilliseconds = 3000) => {
		const start = performance.now()
		while (condition() === false) {
			if (performance.now() - start > timeoutInMilliseconds) {
				throw new Error('The condition has not been met in time.')
			}
			await new Promise(resolve => setTimeout(resolve, 10))
		}
	}

	const fetchSpy = jasmine.createSpy('fetch').and.callFake((id: number | string) => ({ id: Number(id), name: `Item ${id}` }) as Item)

	beforeEach(() => fetchSpy.calls.reset())

	afterEach(() => new Promise(resolve => setTimeout(resolve, 50)))

	describe('without an id', () => {
		const fixture = new ComponentTestFixture<GenericFetchableDialog<Item>>(() => new GenericFetchableDialog<Item>({
			entity: { id: 0, name: 'Preset' },
			fetch: fetchSpy,
			content: () => html`<div id='name'>Content</div>`,
		}))

		it('should use the parameterized entity when no id is given', async () => {
			await waitUntil(() => fixture.component.fetcherController.value !== undefined)

			expect(fetchSpy).not.toHaveBeenCalled()
			expect(fixture.component.entity).toEqual({ id: 0, name: 'Preset' })
			expect(fixture.component.renderRoot.querySelector('#name')).not.toBeNull()
		})
	})

	describe('with an id', () => {
		const fixture = new ComponentTestFixture<GenericFetchableDialog<Item>>(() => new GenericFetchableDialog<Item>({
			id: 5,
			entity: { id: 0, name: 'Preset' },
			fetch: fetchSpy,
			content: () => html`<div id='name'>Content</div>`,
		}))

		it('should fetch via the parameterized fetch when an id is given', async () => {
			await waitUntil(() => fixture.component.entity?.name === 'Item 5')

			expect(fetchSpy).toHaveBeenCalledOnceWith(5)
			expect(fixture.component.entity).toEqual({ id: 5, name: 'Item 5' })
		})
	})
})