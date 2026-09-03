import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type ContextMenuItem } from './ContextMenuItem.js'

describe('ContextMenuItem', () => {
	const fixture = new ComponentTestFixture<ContextMenuItem>(html`
		<mo-context-menu-item>Action</mo-context-menu-item>
	`)

	it('should instantiate context menu item', () => {
		expect(fixture.component).toBeDefined()
	})
})