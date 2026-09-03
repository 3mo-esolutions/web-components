import { Component, component, html, query, render } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { SelectableListSelectability } from '@3mo/list'
import { MenuAlignment } from './MenuAlignment.js'
import { MenuPlacement } from './MenuPlacement.js'
import { type Menu } from './Menu.js'
import { type MenuItem } from './MenuItem.js'
import './index.js'

describe('Menu', () => {
	const tick = () => new Promise(resolve => setTimeout(resolve))

	function createMenuItem(text: string) {
		const container = document.body.appendChild(document.createElement('div'))
		render(html`<mo-menu-item>${text}</mo-menu-item>`, container)
		const item = container.querySelector('mo-menu-item')!
		item.remove()
		container.remove()
		return item
	}

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

		afterEach(async () => {
			fixture.component.open = false
			await fixture.updateComplete
		})

		it('should close when a menu item is clicked', () => {
			fixture.component.open = true

			const item = fixture.component.querySelector('mo-menu-item')
			item?.click()

			expect(fixture.component.open).toBeFalse()
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

	describe('disabled', () => {
		const fixture = new ComponentTestFixture<Menu>(html`
			<mo-menu>
				<mo-menu-item>Item 1</mo-menu-item>
			</mo-menu>
		`)

		afterEach(async () => {
			fixture.component.disabled = false
			fixture.component.open = false
			await fixture.updateComplete
		})

		it('should set pointer-events to "none" when disabled', async () => {
			fixture.component.disabled = true

			await fixture.updateComplete

			expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
		})

		it('should refuse to open while disabled', () => {
			const openChangeSpy = jasmine.createSpy('openChange')
			fixture.component.openChange.subscribe(openChangeSpy)
			fixture.component.disabled = true

			fixture.component.setOpen(true)

			expect(fixture.component.open).toBeFalse()
			expect(openChangeSpy).not.toHaveBeenCalled()
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
			const popover = getPopover()
			popover.style.maxHeight = '100px'
			popover.style.overflowY = 'auto'
			const opened = new Promise<void>(resolve => popover.addEventListener('toggle', () => resolve(), { once: true }))
			fixture.component.open = true
			await fixture.updateComplete
			await opened
		}

		afterEach(async () => {
			fixture.component.open = false
			await fixture.updateComplete
		})

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

	describe('opening via the anchor\'s keyboard', () => {
		@component('test-menu-anchor')
		class TestMenuAnchor extends Component {
			@query('#menu') readonly menu!: Menu
			@query('#sibling') readonly siblingMenu!: Menu
			@query('#trigger') readonly trigger!: HTMLButtonElement

			protected override get template() {
				return html`
					<button id='trigger'>Trigger</button>
					<mo-menu id='menu' .anchor=${this}>
						<mo-menu-item>Item 1</mo-menu-item>
						<mo-menu-item>Item 2</mo-menu-item>
					</mo-menu>
					<mo-menu id='sibling' .anchor=${this}>
						<mo-menu-item>Sibling item</mo-menu-item>
					</mo-menu>
				`
			}
		}

		const fixture = new ComponentTestFixture(() => new TestMenuAnchor)

		beforeEach(tick)

		afterEach(async () => {
			fixture.component?.menu?.setOpen(false)
			fixture.component?.siblingMenu?.setOpen(false)
			await fixture.component?.menu?.updateComplete
			await fixture.component?.siblingMenu?.updateComplete
		})

		function keydown(target: EventTarget, key: string, init?: KeyboardEventInit) {
			const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, composed: true, ...init })
			target.dispatchEvent(event)
			return event
		}

		for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageUp', 'PageDown']) {
			it(`should open while closed, preventing the page scroll (${key})`, () => {
				const event = keydown(fixture.component, key)

				expect(fixture.component.menu.open).toBeTrue()
				expect(event.defaultPrevented).toBeTrue()
			})
		}

		it('should close on Tab while open', () => {
			fixture.component.menu.setOpen(true)

			keydown(fixture.component, 'Tab')

			expect(fixture.component.menu.open).toBeFalse()
		})

		it('should not open on those keys when manual', () => {
			fixture.component.menu.manual = true
			fixture.component.siblingMenu.manual = true

			const event = keydown(fixture.component, 'ArrowDown')

			expect(fixture.component.menu.open).toBeFalse()
			expect(event.defaultPrevented).toBeFalse()
		})

		for (const modifier of ['ctrlKey', 'shiftKey'] as const) {
			it(`should ignore keys with ${modifier === 'ctrlKey' ? 'ctrl' : 'shift'} held`, () => {
				keydown(fixture.component, 'ArrowDown', { [modifier]: true })

				expect(fixture.component.menu.open).toBeFalse()
			})
		}

		it('should ignore keys arriving from within another menu, so a submenu\'s keystrokes never open the parent\'s siblings', async () => {
			fixture.component.menu.setOpen(true)
			await fixture.component.menu.updateComplete

			keydown(fixture.component.menu.items[0]!, 'ArrowDown')

			expect(fixture.component.siblingMenu.open).toBeFalse()
		})

		async function muteSiblingMenu() {
			fixture.component.siblingMenu.manual = true
			await fixture.component.siblingMenu.updateComplete
		}

		it('should not open for the anchor\'s synthesised Enter click when preventOpenOnAnchorEnter', async () => {
			await muteSiblingMenu()
			fixture.component.menu.target = 'trigger'
			fixture.component.menu.preventOpenOnAnchorEnter = true

			keydown(fixture.component, 'Enter')
			await new Promise(resolve => setTimeout(resolve, 30))

			expect(fixture.component.menu.open).toBeFalse()
		})

		it('should open for the anchor\'s synthesised Enter click otherwise', async () => {
			await muteSiblingMenu()
			fixture.component.menu.target = 'trigger'
			const popover = fixture.component.menu.renderRoot.querySelector('mo-popover')!
			const opened = new Promise<void>(resolve => popover.addEventListener('toggle', () => resolve(), { once: true }))

			const event = keydown(fixture.component, 'Enter')
			await opened

			expect(fixture.component.menu.open).toBeTrue()
			expect(event.defaultPrevented).toBeTrue()
		})
	})

	describe('open state', () => {
		const fixture = new ComponentTestFixture<Menu>(html`
			<mo-menu>
				<mo-menu-item>Item 1</mo-menu-item>
			</mo-menu>
		`)

		afterEach(async () => {
			fixture.component.setOpen(false)
			await fixture.updateComplete
		})

		it('should dispatch openChange only when setOpen actually changes the state', () => {
			const openChangeSpy = jasmine.createSpy('openChange')
			fixture.component.openChange.subscribe(openChangeSpy)

			fixture.component.setOpen(true)
			fixture.component.setOpen(true)
			fixture.component.setOpen(false)
			fixture.component.setOpen(false)

			expect(openChangeSpy.calls.allArgs()).toEqual([[true], [false]])
		})
	})

	describe('value and selection', () => {
		const fixture = new ComponentTestFixture<Menu>(html`
			<mo-menu selectability='single'>
				<mo-selectable-list-item>Item 1</mo-selectable-list-item>
				<mo-selectable-list-item>Item 2</mo-selectable-list-item>
				<mo-selectable-list-item>Item 3</mo-selectable-list-item>
			</mo-menu>
		`)

		beforeEach(tick)

		afterEach(async () => {
			fixture.component.setOpen(false)
			await fixture.updateComplete
		})

		it('should adopt the value and dispatch change with the selected indices when an item is picked', async () => {
			const changeSpy = jasmine.createSpy('change')
			fixture.component.change.subscribe(changeSpy)

			fixture.component.items[1]!.click()
			await fixture.updateComplete

			expect(fixture.component.value).toEqual([1])
			expect(changeSpy).toHaveBeenCalledOnceWith([1])
		})

		it('should reflect a programmatically assigned value in the list\'s selection without dispatching change', async () => {
			const changeSpy = jasmine.createSpy('change')
			fixture.component.change.subscribe(changeSpy)

			fixture.component.value = [2]
			await fixture.updateComplete
			await fixture.component.list.updateComplete

			expect(fixture.component.list.value).toEqual([2])
			expect(fixture.component.list.selectabilityController.isSelected(fixture.component.items[2]!)).toBeTrue()
			expect(changeSpy).not.toHaveBeenCalled()
		})

		for (const selectability of [SelectableListSelectability.Single, SelectableListSelectability.Multiple]) {
			it(`should forward its selectability to the list (${selectability})`, async () => {
				fixture.component.selectability = selectability

				await fixture.updateComplete

				expect(fixture.component.list.selectability).toBe(selectability)
				expect(fixture.component.list.selectabilityController.selectability).toBe(selectability)
			})
		}
	})

	describe('openWith', () => {
		const fixture = new ComponentTestFixture<Menu>(html`
			<mo-menu>
				<mo-menu-item>Item 1</mo-menu-item>
			</mo-menu>
		`)

		const getPopover = () => fixture.component.renderRoot.querySelector('mo-popover')!

		afterEach(async () => {
			fixture.component.setOpen(false)
			await fixture.updateComplete
		})

		it('should open at a mouse event\'s coordinates, preventing its default', async () => {
			const event = new MouseEvent('contextmenu', { clientX: 42, clientY: 84, cancelable: true })

			fixture.component.openWith(event)
			await fixture.updateComplete

			expect(fixture.component.open).toBeTrue()
			expect(event.defaultPrevented).toBeTrue()
			expect(getPopover().coordinates).toEqual([42, 84])
		})

		it('should open at plainly given coordinates', async () => {
			fixture.component.openWith([120, 160])
			await fixture.updateComplete

			expect(fixture.component.open).toBeTrue()
			expect(getPopover().coordinates).toEqual([120, 160])
		})
	})

	describe('popover plumbing', () => {
		const fixture = new ComponentTestFixture<Menu>(html`
			<mo-menu>
				<mo-menu-item>Item 1</mo-menu-item>
			</mo-menu>
		`)

		const getPopover = () => fixture.component.renderRoot.querySelector('mo-popover')!

		beforeEach(tick)

		afterEach(async () => {
			fixture.component.setOpen(false)
			await fixture.updateComplete
		})

		it('should forward placement, alignment and target to its popover', async () => {
			fixture.component.placement = MenuPlacement.BlockStart
			fixture.component.alignment = MenuAlignment.End
			fixture.component.target = 'trigger'

			await fixture.updateComplete

			expect(getPopover().placement).toBe(MenuPlacement.BlockStart)
			expect(getPopover().alignment).toBe(MenuAlignment.End)
			expect(getPopover().target).toBe('trigger')
		})

		it('should re-dispatch the list\'s itemsChange with the menu items', async () => {
			const itemsChangeSpy = jasmine.createSpy('itemsChange')
			fixture.component.itemsChange.subscribe(itemsChangeSpy)

			const item = createMenuItem('Item 2')
			fixture.component.appendChild(item)
			await new Promise(resolve => setTimeout(resolve, 30))

			expect(itemsChangeSpy).toHaveBeenCalled()
			expect(itemsChangeSpy.calls.mostRecent().args[0]).toEqual(fixture.component.items)
			expect(fixture.component.items).toContain(item)
		})
	})
})