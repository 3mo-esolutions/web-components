import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import './index.js'
// eslint-disable-next-line no-duplicate-imports
import type { List } from './index.js'

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
})