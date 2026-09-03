import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type NavigationMenuItem } from './NavigationMenuItem.js'

describe('NavigationMenuItem', () => {
	const fixture = new ComponentTestFixture<NavigationMenuItem>(html`
		<mo-navigation-menu-item>Nav Menu Item</mo-navigation-menu-item>
	`)

	it('should default role to menuitem', () => {
		expect(fixture.component.role).toBe('menuitem')
	})
})