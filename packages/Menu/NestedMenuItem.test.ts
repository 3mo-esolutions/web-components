import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { userEvent } from 'vitest/browser'
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

	describe('Submenu', () => {
		describe('with more items than fit in the viewport', () => {
			const fixture = new ComponentTestFixture(html`
				<div>
					<button>Anchor</button>
					<mo-menu>
						<mo-nested-menu-item>
							Item
							${[...new Array(60).keys()].map(index => html`<mo-menu-item slot='submenu'>Item ${index}</mo-menu-item>`)}
						</mo-nested-menu-item>
					</mo-menu>
				</div>
			`)

			const getPopover = (menu: Menu) => menu.renderRoot.querySelector('mo-popover')!

			it('should scroll within the viewport instead of running past it', async () => {
				const menu = fixture.component.querySelector('mo-menu')!
				const item = menu.querySelector<NestedMenuItem>('mo-nested-menu-item')!
				menu.anchor = fixture.component.querySelector('button')!
				menu.open = true
				await expect.poll(() => getPopover(menu).matches(':popover-open')).toBe(true)

				await userEvent.click(item)
				const popover = getPopover(item.subMenu)
				await expect.poll(() => popover.getBoundingClientRect().height).toBeGreaterThan(0)

				const rect = popover.getBoundingClientRect()
				expect(rect.top).toBeGreaterThanOrEqual(0)
				expect(rect.bottom).toBeLessThanOrEqual(innerHeight)
				expect(popover.scrollHeight).toBeGreaterThan(popover.clientHeight)
			})
		})
	})
})
