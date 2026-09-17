import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import './index.js'
import { fakeNavigation as navigation } from './fakeNavigation.test.js'
import { Navigation } from './Navigation.js'

const settle = async (component: Navigation) => {
	for (let i = 0; i < 5; i++) {
		await component.updateComplete
		await new Promise(resolve => setTimeout(resolve, 30))
	}
	await component.updateComplete
}

/** The rail's verdicts travel through a resize observation, so they are awaited rather than slept for. */
const settleUntil = async (component: Navigation, predicate: () => boolean) => {
	for (let i = 0; i < 40 && predicate() === false; i++) {
		await component.updateComplete
		await new Promise(resolve => setTimeout(resolve, 25))
	}
	await component.updateComplete
}

describe('Navigation', () => {
	const create = (presentations: Navigation['presentations'], width = '3000px') => () => {
		const component = new Navigation()
		component.style.width = width
		component.style.height = '400px'
		component.presentations = presentations
		component.heading = 'Business Suite'
		component.navigations = [
			navigation('Dashboard', { icon: 'dashboard' }),
			navigation('Reports', { icon: 'assessment', children: [navigation('Annual')] }),
		]
		return component
	}

	describe('choosing a presentation', () => {
		const fixture = new ComponentTestFixture(create(['bar', 'drawer']))

		it('should present the navigations as a bar while they fit', async () => {
			await settle(fixture.component)

			expect(fixture.component.presentation).toBe('bar')
			expect(fixture.component.getAttribute('presentation')).toBe('bar')
		})

		it('should fall back to the drawer once they no longer fit', async () => {
			await settle(fixture.component)
			vi.spyOn(fixture.component.navigationBar!, 'hasOverflow', 'get').mockReturnValue(true)

			fixture.component.requestUpdate()
			await fixture.component.updateComplete

			expect(fixture.component.presentation).toBe('drawer')
		})

		it('should take the bar verdict when the bar reaches it, since nothing else resized', async () => {
			await settle(fixture.component)
			const bar = fixture.component.navigationBar!
			vi.spyOn(bar, 'hasOverflow', 'get').mockReturnValue(true)

			bar.requestUpdate()
			await bar.updateComplete
			await fixture.component.updateComplete

			expect(fixture.component.presentation).toBe('drawer')
		})

		it('should keep the bar laid out while another presentation is shown, so that it can fit again', async () => {
			await settle(fixture.component)
			vi.spyOn(fixture.component.navigationBar!, 'hasOverflow', 'get').mockReturnValue(true)
			fixture.component.requestUpdate()
			await fixture.component.updateComplete

			expect(fixture.component.navigationBar).not.toBeNull()
		})

		it('should render no bar at all once it is left out of the order', async () => {
			fixture.component.presentations = ['drawer']
			await settle(fixture.component)

			expect(fixture.component.navigationBar).toBeNull()
			expect(fixture.component.presentation).toBe('drawer')
		})
	})

	describe('the rail', () => {
		const fixture = new ComponentTestFixture(create(['rail', 'drawer'], '400px'))

		beforeEach(() => {
			fixture.component.style.setProperty('--mo-navigation-rail-size', '80px')
			fixture.component.style.setProperty('--mo-navigation-rail-panel-size', '200px')
			fixture.component.style.setProperty('--mo-navigation-min-content-size', '200px')
		})

		it('should present the navigations as a rail while the page keeps its room beside one', async () => {
			await settleUntil(fixture.component, () => fixture.component.presentation === 'rail')

			expect(fixture.component.presentation).toBe('rail')
			expect(fixture.component.navigationRail).not.toBeNull()
		})

		it('should overlay the rail\'s panel while there is no room for both it and the page', async () => {
			await settleUntil(fixture.component, () => fixture.component.presentation === 'rail')

			expect(fixture.component.navigationRail!.docked).toBe(false)
		})

		it('should dock the rail\'s panel once there is room for both', async () => {
			fixture.component.style.width = '900px'
			await settleUntil(fixture.component, () => fixture.component.navigationRail?.docked === true)

			expect(fixture.component.navigationRail!.docked).toBe(true)
		})

		it('should fall back to the drawer once the page would keep no room', async () => {
			fixture.component.style.width = '200px'
			await settleUntil(fixture.component, () => fixture.component.presentation === 'drawer')

			expect(fixture.component.presentation).toBe('drawer')
		})
	})

	describe('the drawer', () => {
		const fixture = new ComponentTestFixture(create(['drawer']))

		it('should offer a menu button which opens it', async () => {
			await settle(fixture.component)

			fixture.component.menuButton!.click()
			await fixture.updateComplete

			expect(fixture.component.drawerOpen).toBe(true)
		})

		it('should return focus to the menu button when it closes', async () => {
			await settle(fixture.component)
			fixture.component.drawerOpen = true
			await fixture.updateComplete
			const focusSpy = vi.spyOn(fixture.component.menuButton!, 'focus').mockReturnValue(undefined)

			fixture.component.drawerOpen = false
			await fixture.updateComplete

			expect(focusSpy).toHaveBeenCalled()
		})

		it('should offer no menu button while another presentation is shown', async () => {
			fixture.component.presentations = ['bar', 'drawer']
			await settle(fixture.component)

			expect(fixture.component.presentation).toBe('bar')
			expect(fixture.component.menuButton).toBeNull()
		})

		it('should hand the heading over as a template rather than as an attribute', async () => {
			fixture.component.heading = html`<span>Kasse</span>`
			await settle(fixture.component)

			const drawer = fixture.component.renderRoot.querySelector('mo-navigation-drawer')!
			expect(drawer.renderRoot.textContent).toContain('Kasse')
		})
	})

	describe('Alt key activation', () => {
		const fixture = new ComponentTestFixture(create(['bar', 'drawer']))

		it('should hand focus to the presentation being shown', async () => {
			await settle(fixture.component)
			const focusSpy = vi.spyOn(fixture.component.navigationBar!, 'focus').mockReturnValue(undefined)

			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt', bubbles: true, cancelable: true, altKey: true }))

			expect(focusSpy).toHaveBeenCalled()
		})

		it('should keep out of the way while an input is focused', async () => {
			await settle(fixture.component)
			const input = document.createElement('input')
			document.body.appendChild(input)
			const focusSpy = vi.spyOn(fixture.component.navigationBar!, 'focus').mockReturnValue(undefined)

			input.focus()
			input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt', bubbles: true, cancelable: true, altKey: true }))

			expect(focusSpy).not.toHaveBeenCalled()
			input.remove()
		})
	})
})