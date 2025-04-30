import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { NestedMenuItem } from '@3mo/menu'
import { type ContextMenu } from './ContextMenu.js'

describe('ContextMenu', () => {
	describe('single selection', () => {
		const fixture = new ComponentTestFixture<ContextMenu>(html`
			<mo-context-menu>
				<mo-context-menu-item>Item 1</mo-context-menu-item>
				<mo-context-menu-item>
					Item 2
					<mo-context-menu-item slot='submenu'>Item 2.1</mo-context-menu-item>
					<mo-context-menu-item slot='submenu'>Item 2.2</mo-context-menu-item>
				</mo-context-menu-item>
				<mo-context-menu-item>Item 3</mo-context-menu-item>
			</mo-context-menu>
		`)

		it('should have 3 items', () => {
			expect(fixture.component.items.length).toEqual(3)
		})

		it('should have 2 submenus', async () => {
			const item = fixture.component.items[1] as NestedMenuItem
			await item.subMenu.updateComplete
			expect(item.subMenu.items.length).toEqual(2)
		})
	})
})