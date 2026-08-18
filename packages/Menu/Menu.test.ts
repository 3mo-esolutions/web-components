import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import '@3mo/list'
import { type Menu } from './Menu.js'
import { type MenuItem } from './MenuItem.js'

describe('Menu', () => {
	describe('auto-closing', () => {
		const fixture = new ComponentTestFixture<Menu>(html`
			<mo-menu>
				<mo-menu-item>Item 1</mo-menu-item>
				<mo-list-item>Item 2</mo-list-item>
				<mo-nested-menu-item>
					Item 3
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

	describe('revealing the selection', () => {
		const indices = [...new Array(60).keys()]
		const selectedIndex = 50

		const fixture = new ComponentTestFixture<Menu>(html`
			<mo-menu selectability='single' .value=${[selectedIndex]}>
				${indices.map(index => html`<mo-selectable-list-item>Item ${index}</mo-selectable-list-item>`)}
			</mo-menu>
		`)

		const getPopover = () => fixture.component.renderRoot.querySelector('mo-popover')!

		async function open() {
			// The scroller a menu inside a field-select gets from its host, without depending on one.
			const popover = getPopover()
			popover.style.maxHeight = '100px'
			popover.style.overflowY = 'auto'
			const opened = new Promise<void>(resolve => popover.addEventListener('toggle', () => resolve(), { once: true }))
			fixture.component.open = true
			await fixture.updateComplete
			await opened
		}

		it('should focus the selected item when opened', async () => {
			await open()

			expect(fixture.component.list.focusController.focusedItemIndex).toBe(selectedIndex)
			expect(fixture.component.items[selectedIndex]!.hasAttribute('focused')).toBeTrue()
		})

		it('should scroll the selected item into view when opened', async () => {
			await open()

			expect(getPopover().scrollTop).toBeGreaterThan(0)
			const item = fixture.component.items[selectedIndex]!
			const itemRect = item.getBoundingClientRect()
			const popoverRect = getPopover().getBoundingClientRect()
			expect(itemRect.top).toBeGreaterThanOrEqual(popoverRect.top)
			expect(itemRect.bottom).toBeLessThanOrEqual(popoverRect.bottom)
		})

		it('should re-read the selection on every opening', async () => {
			await open()
			fixture.component.open = false
			await fixture.updateComplete

			expect(fixture.component.list.focusController.focusedItemIndex).toBeUndefined()

			fixture.component.value = [10]
			await open()

			expect(fixture.component.list.focusController.focusedItemIndex).toBe(10)
		})
	})
})