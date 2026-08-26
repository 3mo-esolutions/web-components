import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import './index.js'
// eslint-disable-next-line no-duplicate-imports
import type { CollapsibleListItem, List } from './index.js'

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
})