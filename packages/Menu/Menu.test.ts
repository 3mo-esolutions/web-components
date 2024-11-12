import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Menu } from './Menu.js'
import { type MenuItem } from './MenuItem.js'

describe('Menu', () => {
	describe('auto-closing', () => {
		const fixture = new ComponentTestFixture<Menu>(html`
		<mo-menu>
			<mo-menu-item>Item 1</mo-menu-item>
			<mo-list-item>Item 2</mo-list-item>
			<mo-nested-menu-item>Item 3
				<mo-menu slot='submenu'>
					<mo-menu-item>Item 3.1</mo-menu-item>
					<mo-list-item>Item 3.2</mo-list-item>
				</mo-menu>
			</mo-nested-menu-item>
			<mo-nested-menu-item>Item 4</mo-nested-menu-item>
		</mo-menu>
	`)

		it('should close when a menu item is clicked', () => {
			fixture.component.open = true

			const item = fixture.component.querySelector('mo-menu-item')
			item?.click()

			expect(fixture.component.open).toBeFalse()
		})

		it('should set pointer-events to "none" when disabled', async () => {
			fixture.component.disabled = true

			await fixture.updateComplete

			expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
		})

		it('should close when a list-item other than menu item is clicked', () => {
			fixture.component.open = true

			const item = fixture.component.querySelector('mo-list-item')
			item?.click()

			expect(fixture.component.open).toBeFalse()
		})

		it('should not close when a nested-menu-item with submenu is clicked', () => {
			fixture.component.open = true

			const item = fixture.component.querySelectorAll('mo-nested-menu-item')[0]
			item?.click()

			expect(fixture.component.open).toBeTruthy()
		})

		it('should close when a nested-menu-item without submenu is clicked', () => {
			fixture.component.open = true

			const item = fixture.component.querySelectorAll('mo-nested-menu-item')[1]
			item?.click()

			expect(fixture.component.open).toBeFalse()
		})

		it('should close when a menu-item in a submenu is clicked', () => {
			fixture.component.open = true

			const item = fixture.component.querySelector<MenuItem>('mo-nested-menu-item mo-menu-item')
			item?.click()

			expect(fixture.component.open).toBeFalse()
		})

		it('should close when a list-item in a submenu is clicked', () => {
			fixture.component.open = true

			const item = fixture.component.querySelector<MenuItem>('mo-nested-menu-item mo-list-item')
			item?.click()

			expect(fixture.component.open).toBeFalse()
		})
	})
})