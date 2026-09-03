import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Page } from './Page.js'
import './index.js'

describe('Page', () => {
	const fixture = new ComponentTestFixture<Page>('mo-page')

	const header = () => fixture.component.renderRoot.querySelector('[part=header]')

	it('should dispatch pageHeadingChange when the heading changes', async () => {
		const headings = new Array<string>()
		fixture.component.addEventListener('pageHeadingChange', (e: Event) => headings.push((e as CustomEvent<string>).detail))

		fixture.component.heading = 'Invoices'
		await fixture.updateComplete

		expect(headings).toEqual(['Invoices'])
	})

	it('should reflect fullHeight', async () => {
		expect(fixture.component.hasAttribute('fullHeight')).toBe(false)
		expect(getComputedStyle(fixture.component).boxSizing).toBe('content-box')

		fixture.component.fullHeight = true
		await fixture.updateComplete

		expect(fixture.component.hasAttribute('fullHeight')).toBe(true)
		expect(getComputedStyle(fixture.component).boxSizing).toBe('border-box')
	})

	describe('header', () => {
		it('should not render the header when there is neither a heading nor action content', () => {
			expect(header()).toBeNull()
		})

		it('should render the header when a heading is set', async () => {
			fixture.component.heading = 'Invoices'
			await fixture.updateComplete

			expect(header()?.textContent?.trim()).toBe('Invoices')
		})

		it('should not render the header when headerHidden is set even with a heading', async () => {
			fixture.component.heading = 'Invoices'
			fixture.component.headerHidden = true
			await fixture.updateComplete

			expect(header()).toBeNull()
		})

		describe('with action content', () => {
			const actionFixture = new ComponentTestFixture<Page>(html`
				<mo-page>
					<button slot='action' id='action'>Action</button>
				</mo-page>
			`)

			it('should render the header when content is slotted into the action slot', () => {
				const actionSlot = actionFixture.component.renderRoot.querySelector<HTMLSlotElement>('[part=header] slot[name=action]')
				expect(actionSlot?.assignedElements().map(element => element.id)).toEqual(['action'])
			})
		})
	})
})