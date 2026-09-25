import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { FocusController } from '@3mo/focus-controller'
import '@3mo/menu'
import { type MenuBar } from './MenuBar.js'
import { type MenuBarItem } from './MenuBarItem.js'
import './index.js'

describe('MenuBar', () => {
	const tick = () => new Promise(resolve => setTimeout(resolve))

	async function settleUntil(predicate: () => boolean, timeout = 1000) {
		const start = performance.now()
		while (!predicate() && performance.now() - start < timeout) {
			await new Promise(resolve => setTimeout(resolve, 10))
		}
	}

	const fixture = new ComponentTestFixture<MenuBar>(html`
		<mo-menu-bar aria-label='Editor'>
			<mo-menu-bar-item>
				File
				<mo-menu slot='menu'>
					<mo-menu-item>New</mo-menu-item>
					<mo-menu-item>Open</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
			<mo-menu-bar-item>
				Edit
				<mo-menu slot='menu'>
					<mo-menu-item>Undo</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
			<mo-menu-bar-item>
				View
				<mo-menu slot='menu'>
					<mo-menu-item>Zoom in</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
		</mo-menu-bar>
	`)

	const items = () => fixture.component.items as ReadonlyArray<MenuBarItem>
	const triggers = () => items().map(item => item.trigger)
	const menus = () => items().map(item => item.menu as HTMLElementTagNameMap['mo-menu'])

	function keydown(target: EventTarget, key: string, init?: KeyboardEventInit) {
		const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, composed: true, ...init })
		target.dispatchEvent(event)
		return event
	}

	beforeEach(async () => {
		await fixture.updateComplete
		await tick()
	})

	afterEach(async () => {
		for (const menu of menus()) {
			menu.setOpen(false)
		}
		await tick()
	})

	it('should announce itself as a menu bar of menu buttons', () => {
		expect(fixture.component.getAttribute('role')).toBe('menubar')
		expect(items()[0]!.getAttribute('role')).toBe('none')
		expect(triggers()[0]!.getAttribute('role')).toBe('menuitem')
		expect(triggers()[0]!.getAttribute('aria-haspopup')).toBe('menu')
		expect(triggers()[0]!.getAttribute('aria-expanded')).toBe('false')
	})

	it('should take the label from the trigger only, leaving the menu out of it', () => {
		expect(items()[0]!.label).toBe('File')
	})

	it('should anchor each menu to its own trigger', () => {
		expect(menus()[0]!.anchor).toBe(triggers()[0]!)
		expect(menus()[1]!.anchor).toBe(triggers()[1]!)
	})

	it('should open a menu when its trigger is clicked', async () => {
		triggers()[0]!.click()
		await settleUntil(() => menus()[0]!.open)

		expect(menus()[0]!.open).toBe(true)
		expect(triggers()[0]!.getAttribute('aria-expanded')).toBe('true')
	})

	it('should open a menu on ArrowDown', async () => {
		keydown(triggers()[0]!, 'ArrowDown')
		await settleUntil(() => menus()[0]!.open)

		expect(menus()[0]!.open).toBe(true)
	})

	it('should move the cursor on Home rather than open the menu it moved away from', async () => {
		keydown(triggers()[1]!, 'Home')
		await tick()

		expect(menus()[1]!.open).toBe(false)
		expect(menus()[0]!.open).toBe(false)
		expect(triggers()[0]!.tabIndex).toBe(0)
	})

	it('should open the neighbouring menu on ArrowRight while one is open', async () => {
		fixture.component.menuBarController.open(items()[0])
		await tick()

		keydown(triggers()[0]!, 'ArrowRight')
		await settleUntil(() => menus()[1]!.open)

		expect(menus()[0]!.open).toBe(false)
		expect(menus()[1]!.open).toBe(true)
	})

	it('should move focus into the menu it switched to, onto its first item', async () => {
		triggers()[0]!.focus()
		fixture.component.menuBarController.open(items()[0])
		await tick()

		keydown(triggers()[0]!, 'ArrowRight')
		await settleUntil(() => FocusController.activeElement === menus()[1]!.items[0])

		expect(FocusController.activeElement).toBe(menus()[1]!.items[0]!)
	})

	it('should hide and skip the items which do not fit, announcing the verdict', async () => {
		const overflows = new Array<boolean>()
		fixture.component.addEventListener('overflowChange', event => overflows.push((event as CustomEvent<boolean>).detail))

		fixture.component.style.width = '80px'
		await settleUntil(() => fixture.component.hasOverflow)
		await fixture.updateComplete

		expect(fixture.component.hasOverflow).toBe(true)
		expect(items().some(item => item.hasAttribute('data-overflowed'))).toBe(true)
		expect(overflows).toEqual([true])

		fixture.component.style.width = ''
		await settleUntil(() => !fixture.component.hasOverflow)
		await fixture.updateComplete

		expect(fixture.component.hasOverflow).toBe(false)
		expect(items().some(item => item.hasAttribute('data-overflowed'))).toBe(false)
	})
})