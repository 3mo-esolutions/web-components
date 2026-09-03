import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import './index.js'
// eslint-disable-next-line no-duplicate-imports
import type { CollapsibleListItem, List } from './index.js'

const flush = () => new Promise(resolve => setTimeout(resolve, 50))

describe('CollapsibleListItem', () => {
	const fixture = new ComponentTestFixture<List>(html`
		<mo-list>
			<mo-list-item>Item 1</mo-list-item>
			<mo-collapsible-list-item id='two' open>
				<mo-list-item>Item 2</mo-list-item>
				<mo-list-item slot='details'>Item 2.1</mo-list-item>
				<mo-list-item slot='details'>Item 2.2</mo-list-item>
				<mo-collapsible-list-item slot='details' id='two-three' open>
					<mo-list-item>Item 2.3</mo-list-item>
					<mo-list-item slot='details'>Item 2.3.1</mo-list-item>
					<mo-list-item slot='details'>Item 2.3.2</mo-list-item>
				</mo-collapsible-list-item>
			</mo-collapsible-list-item>
			<mo-list-item>Item 3</mo-list-item>
		</mo-list>
	`)

	it('should assign items to the list correctly', () => {
		expect(fixture.component.items.length).toBe(8)
	})

	describe('Expand animation', () => {
		const item = () => fixture.component.querySelector<CollapsibleListItem>('#two')!
		const detailsElement = () => item().renderRoot.querySelector('details')!

		it('should size the details content by its content while open', () => {
			expect(getComputedStyle(detailsElement(), '::details-content').height).not.toBe('0px')
		})

		it('should size the details content to nothing once closed', async () => {
			item().open = false
			await item().updateComplete
			// Transitions cannot be sampled reliably mid-flight, hence only the settled state is asserted.
			await new Promise(resolve => setTimeout(resolve, 1000))

			expect(getComputedStyle(detailsElement(), '::details-content').height).toBe('0px')
		})
	})

	describe('open state', () => {
		const fixture = new ComponentTestFixture<CollapsibleListItem>(html`
			<mo-collapsible-list-item>
				<mo-list-item>Item</mo-list-item>
				<mo-list-item slot='details'>Nested 1</mo-list-item>
				<mo-list-item slot='details'>Nested 2</mo-list-item>
			</mo-collapsible-list-item>
		`)

		const nestedItems = () => [...fixture.component.querySelectorAll('[slot=details]')]

		it('should sync open with the details element\'s own toggling', async () => {
			const details = fixture.component.renderRoot.querySelector('details')!

			details.open = true
			await flush()
			expect(fixture.component.open).toBe(true)

			details.open = false
			await flush()
			expect(fixture.component.open).toBe(false)
		})

		it('should stamp aria-hidden onto the nested items while closed, taking them out of traversal', async () => {
			expect(nestedItems().map(item => item.getAttribute('aria-hidden'))).toEqual(['true', 'true'])

			fixture.component.open = true
			await fixture.updateComplete

			expect(nestedItems().map(item => item.getAttribute('aria-hidden'))).toEqual(['false', 'false'])
		})
	})

	describe('keyboard', () => {
		const fixture = new ComponentTestFixture<CollapsibleListItem>(html`
			<mo-collapsible-list-item>
				<mo-list-item>Item</mo-list-item>
				<mo-list-item slot='details'>Nested</mo-list-item>
			</mo-collapsible-list-item>
		`)

		const summaryItem = () => fixture.component.querySelector('mo-list-item:not([slot])')!

		const keyDown = (key: string) => window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))

		it('should open on ArrowRight and close on ArrowLeft while its item is focused', async () => {
			summaryItem().toggleAttribute('focused', true)

			keyDown('ArrowRight')
			await fixture.updateComplete
			expect(fixture.component.open).toBe(true)

			keyDown('ArrowLeft')
			await fixture.updateComplete
			expect(fixture.component.open).toBe(false)
		})

		it('should ignore the keys while its item is not focused', async () => {
			keyDown('ArrowRight')
			await fixture.updateComplete

			expect(fixture.component.open).toBe(false)
		})
	})

	describe('auto-opening', () => {
		for (const [attribute, template] of [
			['selected', html`<mo-selectable-list-item slot='details'>Nested</mo-selectable-list-item>`],
			['data-router-selected', html`<mo-navigation-list-item slot='details'>Nested</mo-navigation-list-item>`],
		] as const) {
			describe(attribute, () => {
				const fixture = new ComponentTestFixture<CollapsibleListItem>(html`
					<mo-collapsible-list-item>
						<mo-list-item>Item</mo-list-item>
						${template}
					</mo-collapsible-list-item>
				`)

				it('should open itself when a nested item becomes selected', async () => {
					expect(fixture.component.open).toBe(false)

					fixture.component.querySelector('[slot=details]')!.setAttribute(attribute, '')
					await flush()

					expect(fixture.component.open).toBe(true)
				})
			})
		}
	})
})