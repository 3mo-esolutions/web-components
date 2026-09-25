import { Component, component, html, property, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { userEvent } from 'vitest/browser'
import { type Menu } from './Menu.js'
import { MenuController } from './MenuController.js'
import './index.js'

const tick = () => new Promise(resolve => setTimeout(resolve))

/** A menu of the controller alone, hidden by its own render rather than by a popover, which would return focus itself. */
@component('menu-controller-test')
class MenuControllerTest extends Component {
	@property({ type: Object }) trigger?: HTMLElement
	@state() open = false


	readonly menu = new MenuController(this, host => ({
		get items() { return [...host.children] as Array<HTMLElement> },
		get expanded() { return (host as MenuControllerTest).open },
		handleExpandedChange: open => (host as MenuControllerTest).open = open,
	}))

	protected override willUpdate() {
		this.menu.trigger.set(this.trigger)
	}

	protected override get template() {
		return html`<div ?hidden=${!this.open}>
				<slot></slot>
			</div>`
	}
}

MenuControllerTest

/** The same, shown in the browser's own popover, which dismisses it on a press outside, as the controller leaves that to the popover. */
@component('menu-controller-popover-test')
class MenuControllerPopoverTest extends Component {
	@state() open = false

	readonly menu = new MenuController(this, host => ({
		get items() { return [...host.children] as Array<HTMLElement> },
		get expanded() { return (host as MenuControllerPopoverTest).open },
		handleExpandedChange: open => (host as MenuControllerPopoverTest).open = open,
	}))

	get popup() { return this.renderRoot.querySelector<HTMLElement>('[popover]')! }

	protected override updated() {
		if (this.open !== this.popup.matches(':popover-open')) {
			this.popup.togglePopover(this.open)
		}
	}

	protected override get template() {
		return html`<div .popover=${'auto'} ${this.menu.menu.ref()} @toggle=${(event: ToggleEvent) => this.open = event.newState === 'open'}>
				<slot></slot>
			</div>`
	}
}

MenuControllerPopoverTest

async function until(predicate: () => boolean, timeout = 1000) {
	const start = performance.now()
	while (!predicate() && performance.now() - start < timeout) {
		await new Promise(resolve => setTimeout(resolve, 10))
	}
}

const keyDown = (target: EventTarget, key: string) => {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true })
	target.dispatchEvent(event)
	return event
}

describe('MenuController', () => {
	const fixture = new ComponentTestFixture<Menu>(html`
		<mo-menu>
			<mo-menu-item>Cut</mo-menu-item>
			<mo-menu-item disabled>Copy</mo-menu-item>
			<mo-menu-item>Paste</mo-menu-item>
			<mo-list-item>Select all</mo-list-item>
			<mo-nested-menu-item>
				Share
				<mo-menu-item slot='submenu'>Mail</mo-menu-item>
				<mo-menu-item slot='submenu'>Chat</mo-menu-item>
				<mo-nested-menu-item slot='submenu'>
					More
					<mo-menu-item slot='submenu'>Print</mo-menu-item>
					<mo-menu-item slot='submenu'>Export</mo-menu-item>
				</mo-nested-menu-item>
			</mo-nested-menu-item>
		</mo-menu>
	`)

	let anchor: HTMLButtonElement
	let after: HTMLButtonElement
	const menu = () => fixture.component
	const items = () => menu().items
	const nested = () => menu().querySelector<HTMLElement & { open: boolean }>('mo-nested-menu-item')!
	const active = () => document.activeElement

	beforeEach(async () => {
		anchor = Object.assign(document.createElement('button'), { textContent: 'Open' })
		after = Object.assign(document.createElement('button'), { textContent: 'After' })
		menu().before(anchor)
		menu().after(after)
		menu().anchor = anchor
		await menu().updateComplete
		await tick()
	})

	afterEach(async () => {
		nested().open = false
		menu().setOpen(false)
		await menu().updateComplete
		anchor.remove()
		after.remove()
	})

	async function open(key = 'ArrowDown') {
		anchor.focus()
		await userEvent.keyboard(`{${key}}`)
		await until(() => items().includes(active() as never))
	}

	it('should give every item a menu item role', () => {
		expect(items().map(item => item.getAttribute('role'))).toEqual(['menuitem', 'menuitem', 'menuitem', 'menuitem', 'menuitem'])
	})

	it('should move focus onto the first item as it opens', async () => {
		await open()

		expect(active()).toBe(items()[0]!)
	})

	it('should focus the menu itself with no item active when opened by a click, leaving the first arrow to pick the first item', async () => {
		await userEvent.click(anchor)
		await until(() => menu().shadowRoot!.activeElement?.getAttribute('role') === 'menu')

		expect(menu().shadowRoot!.activeElement?.getAttribute('role')).toBe('menu')
		expect(items().some(item => item.dataset.navigability === 'current')).toBe(false)

		await userEvent.keyboard('{ArrowDown}')
		expect(active()).toBe(items()[0]!)
	})

	it('should move focus onto the last item when opened with ArrowUp', async () => {
		await open('ArrowUp')

		expect(active()).toBe(items()[4]!)
	})

	it('should move focus with the arrows, Home and End, stepping over disabled items and wrapping around', async () => {
		await open()

		keyDown(active()!, 'ArrowDown')
		expect(active()).toBe(items()[2]!)

		keyDown(active()!, 'End')
		expect(active()).toBe(items()[4]!)

		keyDown(active()!, 'ArrowDown')
		expect(active()).toBe(items()[0]!)
	})

	it('should find an item by typing its name', async () => {
		await open()

		keyDown(active()!, 's')

		expect(active()).toBe(items()[3]!)
	})

	it('should click the item on Enter and on Space, and close', async () => {
		await open()
		const clicks = new Array<string>()
		for (const item of items()) {
			item.addEventListener('click', () => clicks.push(item.textContent!.trim()))
		}

		expect(keyDown(active()!, 'Enter').defaultPrevented).toBe(true)
		await menu().updateComplete

		expect(clicks).toEqual(['Cut'])
		expect(menu().open).toBe(false)
	})

	it('should close once focus leaves it for something outside', async () => {
		await open()

		after.focus()

		expect(menu().open).toBe(false)
	})

	it('should open a submenu on ArrowRight, moving focus into it, and return on ArrowLeft', async () => {
		await open('ArrowUp')
		expect(active()).toBe(nested())

		expect(keyDown(nested(), 'ArrowRight').defaultPrevented).toBe(true)
		await until(() => active()?.textContent?.trim() === 'Mail')
		expect(active()?.textContent?.trim()).toBe('Mail')

		expect(keyDown(active()!, 'ArrowLeft').defaultPrevented).toBe(true)
		await until(() => active() === nested())

		expect(nested().open).toBe(false)
		expect(active()).toBe(nested())
	})

	it('should leave the parent menu where it was while the submenu takes the arrows', async () => {
		await open('ArrowUp')
		keyDown(nested(), 'ArrowRight')
		await until(() => active()?.textContent?.trim() === 'Mail')

		keyDown(active()!, 'ArrowDown')

		expect(active()?.textContent?.trim()).toBe('Chat')
		expect(nested().dataset.navigability).toBe('current')
	})

	it('should announce the menu on its trigger, and stop once the menu is manual', async () => {
		expect(anchor.getAttribute('aria-haspopup')).toBe('menu')
		expect(anchor.getAttribute('aria-expanded')).toBe('false')

		await open()
		expect(anchor.getAttribute('aria-expanded')).toBe('true')

		menu().setOpen(false)
		menu().manual = true
		await menu().updateComplete
		expect(anchor.hasAttribute('aria-haspopup')).toBe(false)
		expect(anchor.hasAttribute('aria-expanded')).toBe(false)
		menu().manual = false
		await menu().updateComplete
	})

	it('should close once an item is chosen by a real click, but not for a click opening a submenu', async () => {
		await open()

		await userEvent.click(nested())
		await menu().updateComplete
		expect(menu().open).toBe(true)

		await userEvent.click(items()[0]!)
		await menu().updateComplete
		expect(menu().open).toBe(false)
	})

	it('should close on Tab from its trigger', async () => {
		menu().setOpen(true)
		await menu().updateComplete

		keyDown(anchor, 'Tab')

		expect(menu().open).toBe(false)
	})

	it('should give focus back to its trigger once a choice closes it', async () => {
		await open()

		keyDown(active()!, 'Enter')
		await until(() => active() === anchor)

		expect(menu().open).toBe(false)
		expect(active()).toBe(anchor)
	})

	it('should leave focus that moved on where it went', async () => {
		await open()

		after.focus()
		await menu().updateComplete

		expect(menu().open).toBe(false)
		expect(active()).toBe(after)
	})

	it('should close on Escape and give focus back to its trigger, claiming the key', async () => {
		await open()

		expect(keyDown(active()!, 'Escape').defaultPrevented).toBe(true)
		await until(() => active() === anchor)

		expect(menu().open).toBe(false)
		expect(active()).toBe(anchor)
	})

	it('should close only the innermost submenu on ArrowLeft, returning to the submenu around it', async () => {
		await open('ArrowUp')
		keyDown(nested(), 'ArrowRight')
		await until(() => active()?.textContent?.trim() === 'Mail')
		const more = nested().querySelector<HTMLElement & { open: boolean }>('mo-nested-menu-item')!
		keyDown(active()!, 'ArrowDown')
		keyDown(active()!, 'ArrowDown')
		expect(active()).toBe(more)

		keyDown(more, 'ArrowRight')
		await until(() => active()?.textContent?.trim() === 'Print')
		expect(active()?.textContent?.trim()).toBe('Print')

		keyDown(active()!, 'ArrowLeft')
		await until(() => active() === more)

		expect(more.open).toBe(false)
		expect(nested().open).toBe(true)
		expect(menu().open).toBe(true)
		expect(active()).toBe(more)
	})

	it('should close only the submenu on Escape inside it', async () => {
		await open('ArrowUp')
		keyDown(nested(), 'ArrowRight')
		await until(() => active()?.textContent?.trim() === 'Mail')

		keyDown(active()!, 'Escape')
		await until(() => active() === nested())

		expect(nested().open).toBe(false)
		expect(menu().open).toBe(true)
		expect(active()).toBe(nested())
	})

	it('should close on a real press outside it, even on something that takes no focus', async () => {
		const outside = Object.assign(document.createElement('div'), { textContent: 'Outside' })
		document.body.append(outside)
		try {
			await open()

			await userEvent.click(outside)
			await menu().updateComplete

			expect(menu().open).toBe(false)
		} finally {
			outside.remove()
		}
	})

	it('should close on Tab from an item, leaving the key to move focus', async () => {
		await open()

		expect(keyDown(active()!, 'Tab').defaultPrevented).toBe(false)

		expect(menu().open).toBe(false)
	})
})

describe('MenuController without a popover', () => {
	const fixture = new ComponentTestFixture<MenuControllerTest>(html`
		<menu-controller-test>
			<div>Cut</div>
			<div>Copy</div>
		</menu-controller-test>
	`)

	let trigger: HTMLButtonElement
	const active = () => document.activeElement

	beforeEach(async () => {
		trigger = Object.assign(document.createElement('button'), { textContent: 'Edit' })
		fixture.component.before(trigger)
		fixture.component.trigger = trigger
		await fixture.updateComplete
	})

	afterEach(() => trigger.remove())

	it('should give focus back to its trigger once a choice closes it, although its own render hid the focused item', async () => {
		trigger.focus()
		keyDown(trigger, 'ArrowDown')
		await fixture.updateComplete
		expect(active()?.textContent).toBe('Cut')

		keyDown(active()!, 'Enter')
		await fixture.updateComplete

		expect(fixture.component.open).toBe(false)
		expect(active()).toBe(trigger)
	})

})

describe('MenuController in a native popover', () => {
	const fixture = new ComponentTestFixture<MenuControllerPopoverTest>(html`
		<menu-controller-popover-test>
			<div>Cut</div>
			<div>Copy</div>
		</menu-controller-popover-test>
	`)

	it('should close on a real press outside it, even on something that takes no focus, through the popover', async () => {
		const outside = Object.assign(document.createElement('div'), { textContent: 'Outside' })
		document.body.append(outside)
		try {
			fixture.component.open = true
			await fixture.updateComplete
			expect(fixture.component.popup.matches(':popover-open')).toBe(true)

			await userEvent.click(outside)
			await fixture.updateComplete

			expect(fixture.component.open).toBe(false)
		} finally {
			outside.remove()
		}
	})
})