import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type LoadingDialog } from './LoadingDialog.js'
import './index.js'

describe('LoadingDialog', () => {
	const fixture = new ComponentTestFixture<LoadingDialog>('mo-loading-dialog')

	const heading = () => fixture.component.renderRoot.querySelector('mo-heading')?.textContent

	describe('loading state', () => {
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

		it('should fade the content and make it inert while loading', async () => {
			const content = () => fixture.component.renderRoot.querySelector('[part=content]')!
			expect(getComputedStyle(content()).opacity).toBe('1')

			fixture.component.loading = true
			await fixture.updateComplete

			expect(Number(getComputedStyle(content()).opacity)).toBeCloseTo(0.33, 2)
			expect(getComputedStyle(content()).pointerEvents).toBe('none')
		})

		describe('with custom loading content', () => {
			const customFixture = new ComponentTestFixture<LoadingDialog>(html`
				<mo-loading-dialog loading>
					<div slot='loading' id='custom-loading'>Please wait</div>
				</mo-loading-dialog>
			`)

			it('should render custom slotted loading content in place of the default progress', () => {
				const loadingSlot = customFixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=loading]')
				expect(loadingSlot?.assignedElements().map(element => element.id)).toEqual(['custom-loading'])
			})
		})
	})

	describe('heading', () => {
		it('should have default loading heading', async () => {
			fixture.component.loading = true
			await fixture.updateComplete

			expect(heading()).toBe('Loading ...')
		})

		it('should be able to have custom loading heading', async () => {
			fixture.component.loading = true
			fixture.component.loadingHeading = 'Custom Loading Heading'
			await fixture.updateComplete

			expect(heading()).toBe('Custom Loading Heading ...')
		})

		it('should restore the dialog\'s own heading when loading ends', async () => {
			fixture.component.heading = 'Invoice details'
			fixture.component.loading = true
			await fixture.updateComplete
			expect(heading()).toBe('Loading ...')

			fixture.component.loading = false
			await fixture.updateComplete

			expect(heading()).toBe('Invoice details')
		})
	})
})