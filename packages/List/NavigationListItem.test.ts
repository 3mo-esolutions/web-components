import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type NavigationListItem } from './NavigationListItem.js'

describe('NavigationListItem', () => {
	const fixture = new ComponentTestFixture<NavigationListItem>(html`
		<mo-navigation-list-item>Nav Item</mo-navigation-list-item>
	`)

	it('should return selected based on data-router-selected attribute', () => {
		expect(fixture.component.selected).toBeFalse()

		fixture.component.setAttribute('data-router-selected', '')

		expect(fixture.component.selected).toBeTrue()
	})
})