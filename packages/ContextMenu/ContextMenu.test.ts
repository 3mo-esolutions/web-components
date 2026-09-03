import { Component, component, html, query, render } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { NestedMenuItem } from '@3mo/menu'
import { ContextMenu } from './ContextMenu.js'
import './index.js'

describe('ContextMenu', () => {
	describe('items', () => {
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

	@component('test-context-menu-anchor')
	class TestContextMenuAnchor extends Component {
		@query('mo-context-menu') readonly menu!: ContextMenu

		protected override get template() {
			return html`
				<mo-context-menu .anchor=${this}>
					<mo-context-menu-item>Item 1</mo-context-menu-item>
					<mo-context-menu-item>Item 2</mo-context-menu-item>
				</mo-context-menu>
			`
		}
	}

	const fixture = new ComponentTestFixture(() => new TestContextMenuAnchor)

	beforeEach(() => new Promise(resolve => setTimeout(resolve)))

	let extraContainers: Array<HTMLElement>
	beforeEach(() => extraContainers = [])

	afterEach(async () => {
		for (const container of extraContainers) {
			container.querySelector('mo-context-menu')?.close()
			container.remove()
		}
		fixture.component?.menu?.close()
		await fixture.component?.menu?.updateComplete
	})

	async function createExtraContextMenu() {
		const container = document.body.appendChild(document.createElement('div'))
		extraContainers.push(container)
		render(html`
			<mo-context-menu>
				<mo-context-menu-item>Extra item</mo-context-menu-item>
			</mo-context-menu>
		`, container)
		const menu = container.querySelector('mo-context-menu')!
		await menu.updateComplete
		return menu
	}

	const getPopover = (menu: ContextMenu) => menu.renderRoot.querySelector('mo-popover')!

	const deepActiveElement = () => {
		let element = document.activeElement
		while (element?.shadowRoot?.activeElement) {
			element = element.shadowRoot.activeElement
		}
		return element
	}

	async function open(menu: ContextMenu, coordinates: [number, number] = [100, 120]) {
		const popover = getPopover(menu)
		const opened = popover.open
			? Promise.resolve()
			: new Promise<void>(resolve => popover.addEventListener('toggle', () => resolve(), { once: true }))
		menu.openWith(coordinates)
		await menu.updateComplete
		await opened
	}

	describe('opening', () => {
		it('should open at the pointer\'s coordinates on the anchor\'s contextmenu event, preventing the native menu', async () => {
			const event = new PointerEvent('contextmenu', { clientX: 160, clientY: 180, bubbles: true, cancelable: true, composed: true })

			fixture.component.dispatchEvent(event)
			await fixture.component.menu.updateComplete

			expect(fixture.component.menu.open).toBeTrue()
			expect(event.defaultPrevented).toBeTrue()
			expect(getPopover(fixture.component.menu).coordinates).toEqual([160, 180])
		})

		it('should focus the first item once opened', async () => {
			await open(fixture.component.menu)
			await new Promise(resolve => setTimeout(resolve, 30))

			expect(deepActiveElement()).toBe(fixture.component.menu.items[0]!)
		})

		it('should close any other open context menu when opening, so only one is ever open', async () => {
			const extra = await createExtraContextMenu()
			await open(fixture.component.menu)
			expect(fixture.component.menu.open).toBeTrue()

			await open(extra, [200, 220])

			expect(fixture.component.menu.open).toBeFalse()
			expect(extra.open).toBeTrue()
		})

		it('should report itself as ContextMenu.openInstance while open', async () => {
			expect(ContextMenu.openInstance).toBeUndefined()

			await open(fixture.component.menu)

			expect(ContextMenu.openInstance).toBe(fixture.component.menu)
		})

		it('should re-open at the new position when already open', async () => {
			await open(fixture.component.menu, [100, 120])

			await open(fixture.component.menu, [300, 320])

			expect(fixture.component.menu.open).toBeTrue()
			expect(getPopover(fixture.component.menu).coordinates).toEqual([300, 320])
		})
	})

	describe('closing', () => {
		it('should close on a document click outside of itself', async () => {
			await open(fixture.component.menu)

			document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

			expect(fixture.component.menu.open).toBeFalse()
		})

		it('should stay open for an inside click that lands on no item', async () => {
			await open(fixture.component.menu)

			const list = fixture.component.menu.renderRoot.querySelector('mo-selectable-list')!
			list.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

			expect(fixture.component.menu.open).toBeTrue()
		})

		it('should close through close()', async () => {
			await open(fixture.component.menu)

			fixture.component.menu.close()

			expect(fixture.component.menu.open).toBeFalse()
		})
	})
})