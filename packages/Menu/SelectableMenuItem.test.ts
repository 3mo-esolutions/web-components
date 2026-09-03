import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type SelectableMenuItem } from './SelectableMenuItem.js'

describe('SelectableMenuItem', () => {
	const fixture = new ComponentTestFixture<SelectableMenuItem>(html`
		<mo-selectable-menu-item>Selectable Item</mo-selectable-menu-item>
	`)

	it('should default role to menuitem', () => {
		expect(fixture.component.role).toBe('menuitem')
	})
})