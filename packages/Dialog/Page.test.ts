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

	describe('with full height', () => {
		const fullHeightFixture = new ComponentTestFixture<Page>(html`
			<mo-page fullHeight heading='Invoices' style='display: block; height: 400px'>
				<div id='content' style='display: flex; flex-direction: column'>
					<div style='flex: 1 1 auto; min-height: 0; overflow: auto'>
						<div style='height: 2000px'></div>
					</div>
				</div>
			</mo-page>
		`)

		it('should let its content shrink to the height the header leaves, rather than to as tall as what it scrolls', () => {
			const content = fullHeightFixture.component.querySelector('#content')!
			expect(content.getBoundingClientRect().bottom).toBeLessThanOrEqual(fullHeightFixture.component.getBoundingClientRect().bottom + 1)
		})
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
