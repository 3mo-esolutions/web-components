import { Component, component, css, html, property, query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { MenuBarController, type MenuBarMenuElement } from './MenuBarController.js'

/** A menu without any DOM, as the bar needs nothing but `open`, `anchor` and `openChange`. */
class TestMenu extends EventTarget implements MenuBarMenuElement {
	anchor?: HTMLElement

	private _open = false
	get open() { return this._open }
	set open(value: boolean) {
		if (this._open !== value) {
			this._open = value
			this.dispatchEvent(new CustomEvent('openChange', { detail: value }))
		}
	}
}

@component('menu-bar-controller-test-item')
class TestItem extends Component {
	readonly menu = new TestMenu

	@property() label = ''
	@property({ type: Boolean }) disabled = false

	@query('button') readonly trigger!: HTMLButtonElement

	protected override get template() {
		return html`<button tabindex='-1' ?disabled=${this.disabled}>${this.label}</button>`
	}
}

@component('menu-bar-controller-test-bar')
class TestBar extends Component {
	readonly menuBarController: MenuBarController<TestItem, TestBar> = new MenuBarController<TestItem, TestBar>(this, host => ({
		get items() { return host.items },
	}))

	get items(): ReadonlyArray<TestItem> {
		return [...this.children].filter((child): child is TestItem => child instanceof TestItem)
	}

	static override get styles() {
		return css`:host { display: flex; }`
	}

	protected override get template() {
		return html`<slot @slotchange=${() => this.menuBarController.handleItemsChange()}></slot>`
	}
}

@component('menu-bar-controller-test-rendering-bar')
class TestRenderingBar extends Component {
	readonly menuBarController: MenuBarController<TestItem, TestRenderingBar> = new MenuBarController<TestItem, TestRenderingBar>(this, host => ({
		get items() { return [...host.renderRoot.querySelectorAll('menu-bar-controller-test-item')] as Array<TestItem> },
	}))

	protected override get template() {
		return html`
			<menu-bar-controller-test-item label='File'></menu-bar-controller-test-item>
			<menu-bar-controller-test-item label='Edit'></menu-bar-controller-test-item>
		`
	}
}

describe('MenuBarController', () => {
	const fixture = new ComponentTestFixture<TestBar>(html`
		<menu-bar-controller-test-bar>
			<menu-bar-controller-test-item label='File'></menu-bar-controller-test-item>
			<menu-bar-controller-test-item label='Edit'></menu-bar-controller-test-item>
			<menu-bar-controller-test-item label='View'></menu-bar-controller-test-item>
			<menu-bar-controller-test-item label='Help' disabled></menu-bar-controller-test-item>
		</menu-bar-controller-test-bar>
	`)

	const controller = () => fixture.component.menuBarController
	const items = () => fixture.component.items
	const triggers = () => items().map(item => item.trigger)

	function keydown(target: EventTarget, key: string, init?: KeyboardEventInit) {
		const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, composed: true, ...init })
		target.dispatchEvent(event)
		return event
	}

	beforeEach(async () => {
		await fixture.updateComplete
	})

	afterEach(() => {
		controller().close()
	})

	describe('roles', () => {
		it('should announce the bar, and each trigger as a menu item of it', () => {
			expect(fixture.component.getAttribute('role')).toBe('menubar')
			expect(items().map(item => item.getAttribute('role'))).toEqual(['none', 'none', 'none', 'none'])
			expect(triggers().map(trigger => trigger.getAttribute('role'))).toEqual(['menuitem', 'menuitem', 'menuitem', 'menuitem'])
		})
	})

	describe('cursor', () => {
		it('should make the bar one tab stop', () => {
			expect(triggers().map(trigger => trigger.tabIndex)).toEqual([0, -1, -1, -1])
		})

		it('should move with the arrows, claiming them', () => {
			triggers()[0]!.focus()

			const event = keydown(triggers()[0]!, 'ArrowRight')

			expect(event.defaultPrevented).toBe(true)
			expect(triggers().map(trigger => trigger.tabIndex)).toEqual([-1, 0, -1, -1])
		})

		it('should step over a disabled item and wrap', () => {
			triggers()[0]!.focus()

			keydown(triggers()[0]!, 'End')

			expect(triggers()[2]!.tabIndex).toBe(0)

			keydown(triggers()[2]!, 'ArrowRight')

			expect(triggers()[0]!.tabIndex).toBe(0)
		})

		it('should jump to the ends with Home and End', () => {
			keydown(triggers()[0]!, 'End')
			expect(triggers()[2]!.tabIndex).toBe(0)

			keydown(triggers()[2]!, 'Home')
			expect(triggers()[0]!.tabIndex).toBe(0)
		})

		it('should jump to the item a typed letter starts', () => {
			keydown(triggers()[0]!, 'v')

			expect(triggers()[2]!.tabIndex).toBe(0)
		})

		it('should leave the keys of an open menu alone', () => {
			controller().open(items()[0])

			const event = keydown(triggers()[0]!, 'Home')

			expect(event.defaultPrevented).toBe(false)
			expect(triggers()[0]!.tabIndex).toBe(0)
		})
	})

	describe('opening', () => {
		it('should open an item and close whichever was open', () => {
			controller().open(items()[0])
			expect(controller().openItem).toBe(items()[0])

			controller().open(items()[1])

			expect(items()[0]!.menu.open).toBe(false)
			expect(items()[1]!.menu.open).toBe(true)
			expect(controller().openItem).toBe(items()[1])
		})

		it('should move the cursor to whatever it opens', () => {
			controller().open(items()[1])

			expect(triggers()[1]!.tabIndex).toBe(0)
		})

		it('should refuse a disabled item', () => {
			controller().open(items()[3])

			expect(items()[3]!.menu.open).toBe(false)
			expect(controller().openItem).toBeUndefined()
		})

		it('should close what is open when focus leaves the bar', () => {
			controller().open(items()[0])

			fixture.component.dispatchEvent(new FocusEvent('focusout', { relatedTarget: document.body, bubbles: true }))

			expect(controller().openItem).toBeUndefined()
		})
	})

	describe('switching', () => {
		it('should move the open menu with the arrows', () => {
			controller().open(items()[0])

			const event = keydown(triggers()[0]!, 'ArrowRight')

			expect(event.defaultPrevented).toBe(true)
			expect(items()[0]!.menu.open).toBe(false)
			expect(items()[1]!.menu.open).toBe(true)
		})

		it('should leave an arrow the open menu has claimed for a submenu of its own', () => {
			// As a menu does when the arrow opens a submenu
			document.addEventListener('keydown', event => event.preventDefault(), { once: true })
			controller().open(items()[0])

			keydown(triggers()[0]!, 'ArrowRight')

			expect(items()[0]!.menu.open).toBe(true)
			expect(items()[1]!.menu.open).toBe(false)
		})

		it('should not switch while nothing is open', () => {
			keydown(triggers()[0]!, 'ArrowRight')

			expect(controller().openItem).toBeUndefined()
		})

		it('should follow the pointer once a menu is open', () => {
			controller().open(items()[0])

			triggers()[1]!.dispatchEvent(new PointerEvent('pointerover', { pointerType: 'mouse', bubbles: true, composed: true }))

			expect(controller().openItem).toBe(items()[1])
		})

		it('should not open on hover while nothing is open', () => {
			triggers()[1]!.dispatchEvent(new PointerEvent('pointerover', { pointerType: 'mouse', bubbles: true, composed: true }))

			expect(controller().openItem).toBeUndefined()
		})

		it('should not follow a touch', () => {
			controller().open(items()[0])

			triggers()[1]!.dispatchEvent(new PointerEvent('pointerover', { pointerType: 'touch', bubbles: true, composed: true }))

			expect(controller().openItem).toBe(items()[0])
		})
	})

	describe('rendering its own items', () => {
		const renderingFixture = new ComponentTestFixture<TestRenderingBar>(html`<menu-bar-controller-test-rendering-bar></menu-bar-controller-test-rendering-bar>`)

		it('should follow the pointer between items in its own shadow root', async () => {
			await renderingFixture.updateComplete
			await new Promise(resolve => setTimeout(resolve))
			const controller = renderingFixture.component.menuBarController
			const [file, edit] = controller.items
			controller.open(file)

			edit!.trigger.dispatchEvent(new PointerEvent('pointerover', { pointerType: 'mouse', relatedTarget: file!.trigger, bubbles: true, composed: true }))

			expect(controller.openItem).toBe(edit)
			controller.close()
		})
	})
})