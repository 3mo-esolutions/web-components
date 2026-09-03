import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type MenuItem } from './MenuItem.js'

describe('MenuItem', () => {
	const fixture = new ComponentTestFixture<MenuItem>(html`
		<mo-menu-item>Item</mo-menu-item>
	`)

	it('should default role to menuitem', () => {
		expect(fixture.component.role).toBe('menuitem')
	})
})