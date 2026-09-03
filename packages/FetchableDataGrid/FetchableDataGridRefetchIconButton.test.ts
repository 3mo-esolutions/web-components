import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { ContextMenu } from '@3mo/context-menu'
import { type FetchableDataGridRefetchIconButton } from './FetchableDataGridRefetchIconButton.js'

describe('FetchableDataGridRefetchIconButton', () => {
	const tick = () => new Promise(resolve => setTimeout(resolve))
	const idle = () => new Promise(resolve => {
		const heartbeat = setInterval(() => requestIdleCallback(() => undefined, { timeout: 10 }), 10)
		requestIdleCallback(() => {
			clearInterval(heartbeat)
			resolve(undefined)
		})
	})

	const fixture = new ComponentTestFixture<FetchableDataGridRefetchIconButton>(html`
		<mo-fetchable-data-grid-refetch-icon-button></mo-fetchable-data-grid-refetch-icon-button>
	`)

	const iconButton = () => fixture.component.renderRoot.querySelector<HTMLElement>('mo-icon-button')!
	const badge = () => fixture.component.renderRoot.querySelector('span')

	it('should dispatch requestFetch when the button is clicked', () => {
		let dispatchCount = 0
		fixture.component.addEventListener('requestFetch', () => dispatchCount++)

		iconButton().click()

		expect(dispatchCount).toBe(1)
	})

	it('should show the interval badge only while an auto-refetch interval is active', async () => {
		expect(badge()).toBeNull()

		fixture.component.autoRefetch = 10
		await fixture.updateComplete

		expect(badge()?.textContent?.trim()).toBe('10')

		fixture.component.autoRefetch = undefined
		await fixture.updateComplete

		expect(badge()).toBeNull()
	})

	it('should mark itself and its icon as fetching while a fetch is pending', async () => {
		const grid = () => fixture.component.renderRoot.querySelector('mo-grid')
		expect(grid()?.hasAttribute('data-fetching')).toBeFalse()
		expect(iconButton().hasAttribute('data-selected')).toBeFalse()

		fixture.component.fetching = true
		await fixture.updateComplete

		expect(grid()?.hasAttribute('data-fetching')).toBeTrue()
		expect(iconButton().hasAttribute('data-selected')).toBeTrue()
	})

	describe('auto-refetch options menu', () => {
		const requestMenu = () => {
			const event = new MouseEvent('contextmenu', { cancelable: true })
			iconButton().dispatchEvent(event)
			return event.defaultPrevented
		}

		const openMenu = async () => {
			let requested = false
			while (requested === false) {
				await idle()
				await tick()
				requested = requestMenu()
			}

			const menu = ContextMenu.openInstance!
			await menu.updateComplete
			while (menu.items.length === 0) {
				await menu.list.updateComplete
				await tick()
			}
			return menu
		}

		afterEach(() => ContextMenu.openInstance?.close())

		// Disabled: Firefox timeout when awaiting lazy context menu
		xit('should offer Off and the predefined intervals (parameterized over 5, 10, 30, 60 seconds)', async () => {
			const menu = await openMenu()

			const texts = menu.items.map(item => item.textContent?.trim() ?? '')
			expect(texts.length).toBe(5)
			expect(texts[0]).toBe('Off')
			for (const [index, seconds] of [5, 10, 30, 60].entries()) {
				expect(texts[index + 1]).toContain(seconds.toString())
			}
		})

		// Disabled: Firefox timeout when awaiting lazy context menu
		xit('should dispatch autoRefetchChange with the chosen interval and mark it selected', async () => {
			const dispatched = new Array<unknown>()
			fixture.component.addEventListener('autoRefetchChange', event => dispatched.push((event as CustomEvent).detail ?? undefined))
			const menu = await openMenu()

			menu.items[3]!.click()
			await fixture.updateComplete

			expect(dispatched).toEqual([30])
			expect(fixture.component.autoRefetch).toBe(30)

			const reopenedMenu = await openMenu()
			expect(reopenedMenu.items.map(item => item.hasAttribute('data-selected'))).toEqual([false, false, false, true, false])
		})

		// Disabled: Firefox timeout when awaiting lazy context menu
		xit('should turn auto-refetch off and dispatch autoRefetchChange with undefined via the Off option', async () => {
			fixture.component.autoRefetch = 10
			await fixture.updateComplete
			const dispatched = new Array<unknown>()
			fixture.component.addEventListener('autoRefetchChange', event => dispatched.push((event as CustomEvent).detail ?? undefined))
			const menu = await openMenu()

			menu.items[0]!.click()
			await fixture.updateComplete

			expect(dispatched).toEqual([undefined])
			expect(fixture.component.autoRefetch).toBeUndefined()
			expect(badge()).toBeNull()
		})
	})
})