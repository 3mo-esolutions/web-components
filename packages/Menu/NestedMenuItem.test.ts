import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import './index.js'
// eslint-disable-next-line no-duplicate-imports
import type { NestedMenuItem, Menu } from './index.js'

describe('NestedMenuItem', () => {
	const fixture = new ComponentTestFixture<Menu>(html`
		<mo-menu>
			<mo-menu-item>Item 1</mo-menu-item>
			<mo-nested-menu-item id='two'>
				Item 2
				<mo-menu-item slot='submenu'>Item 2.1</mo-menu-item>
				<mo-menu-item slot='submenu'>Item 2.2</mo-menu-item>
				<mo-nested-menu-item slot='submenu' id='two-three'>
					Item 2.3
					<mo-menu-item slot='submenu'>Item 2.3.1</mo-menu-item>
					<mo-menu-item slot='submenu'>Item 2.3.2</mo-menu-item>
				</mo-nested-menu-item>
			</mo-nested-menu-item>
			<mo-menu-item>Item 3</mo-menu-item>
		</mo-menu>
	`)

	it('should assign items to each menu correctly', async () => {
		const rootMenu = fixture.component
		const firstSubMenu = rootMenu.querySelector<NestedMenuItem>('#two')!.subMenu
		const secondSubMenu = rootMenu.querySelector<NestedMenuItem>('#two-three')!.subMenu

		await firstSubMenu.updateComplete
		await secondSubMenu.updateComplete

		expect(rootMenu.items.length).toBe(3)
		expect(firstSubMenu.items.length).toBe(3)
		expect(secondSubMenu.items.length).toBe(2)
	})
})