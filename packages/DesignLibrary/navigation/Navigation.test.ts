import { ComponentTestFixture } from '@a11d/lit-testing'
import { Key } from '@a11d/lit-application'
import '@3mo/drawer'
import '@3mo/list'
import '@3mo/icon-button'
import '@3mo/flex'
import '../ApplicationLogo.js'
import './NavigationItem.js'
import { Navigation } from './Navigation.js'
import { NavigationLink } from './INavigation.js'

const settle = async (component: Navigation) => {
	for (let i = 0; i < 5; i++) {
		await component.updateComplete
		await new Promise(resolve => setTimeout(resolve, 30))
	}
	await component.updateComplete
}

class TestNavigationTarget {
	constructor(readonly parameters?: object) { }
	get url() { return undefined }
	urlMatches() { return false }
	navigate() { }
}

const createNavigationLink = (label: string) => new NavigationLink({ label, component: new TestNavigationTarget } as any)

describe('Navigation', () => {
	const globalObject = globalThis as any
	let hadManifest: boolean
	let manifestBeforeSuite: unknown
	beforeAll(() => {
		hadManifest = 'manifest' in globalThis
		manifestBeforeSuite = globalObject.manifest
		globalObject.manifest = { short_name: 'Test Application' }
	})
	afterAll(() => {
		if (hadManifest) {
			globalObject.manifest = manifestBeforeSuite
		} else {
			delete globalObject.manifest
		}
	})

	describe('collapsing into the hamburger', () => {
		const fixture = new ComponentTestFixture(() => {
			const navigation = new Navigation()
			navigation.style.display = 'block'
			navigation.navigations = new Array(10).fill(undefined).map((_, index) => createNavigationLink(`Navigation ${index + 1}`))
			return navigation
		})

		const unlaidOutFixture = new ComponentTestFixture(() => {
			const navigation = new Navigation()
			navigation.style.display = 'none'
			navigation.navigations = new Array(10).fill(undefined).map((_, index) => createNavigationLink(`Navigation ${index + 1}`))
			return navigation
		})

		const hamburgerVisible = () => getComputedStyle(fixture.component.menuButton!).display !== 'none'

		it('should keep the navigation-bar as long as all items fit', async () => {
			fixture.component.style.width = '3000px'

			await settle(fixture.component)

			expect(fixture.component.mobileNavigation).toBeFalse()
			expect(hamburgerVisible()).toBeFalse()
		})

		it('should collapse into the hamburger once the items no longer fit', async () => {
			spyOnProperty(fixture.component['overflowController'], 'hasOverflow', 'get').and.returnValue(true)
			fixture.component.requestUpdate()
			await fixture.component.updateComplete

			expect(fixture.component.mobileNavigation).toBeTrue()
		})

		it('should restore the navigation-bar once the items fit again', async () => {
			const hasOverflowSpy = spyOnProperty(fixture.component['overflowController'], 'hasOverflow', 'get').and.returnValue(true)
			fixture.component.requestUpdate()
			await fixture.component.updateComplete
			expect(fixture.component.mobileNavigation).toBeTrue()

			hasOverflowSpy.and.returnValue(false)
			fixture.component.requestUpdate()
			await fixture.component.updateComplete

			expect(fixture.component.mobileNavigation).toBeFalse()
		})

		it('should not report mobile navigation before the first layout measurement', async () => {
			await settle(unlaidOutFixture.component)

			expect(unlaidOutFixture.component['overflowController'].hasOverflow).toBeFalse()
			expect(unlaidOutFixture.component.mobileNavigation).toBeFalse()
		})
	})

	describe('Alt key activation', () => {
		const fixture = new ComponentTestFixture(() => {
			const navigation = new Navigation()
			navigation.style.display = 'block'
			navigation.navigations = [createNavigationLink('Home')]
			return navigation
		})

		it('should focus on the first navigation item', () => {
			const firstNavItemSpy = spyOn(fixture.component.navigationItems[0]!, 'focus')
			const event = new KeyboardEvent('keydown', { key: Key.Alt, bubbles: true, cancelable: true, altKey: true })

			window.dispatchEvent(event)

			expect(firstNavItemSpy).toHaveBeenCalled()
		})

		it('should prevent activation if any input is focused', () => {
			const input = document.createElement('input')
			document.body.appendChild(input)
			const firstNavItemSpy = spyOn(fixture.component.navigationItems[0]!, 'focus')
			const event = new KeyboardEvent('keydown', { key: Key.Alt, bubbles: true, cancelable: true, altKey: true, })

			input.focus()
			input.dispatchEvent(event)

			expect(firstNavItemSpy).not.toHaveBeenCalled()
			input.remove()
		})

		it('should focus the menu button instead when collapsed into the hamburger', async () => {
			spyOnProperty(fixture.component['overflowController'], 'hasOverflow', 'get').and.returnValue(true)
			fixture.component.requestUpdate()
			await fixture.component.updateComplete
			expect(fixture.component.mobileNavigation).toBeTrue()
			const menuButtonSpy = spyOn(fixture.component.menuButton!, 'focus')
			const firstNavItemSpy = spyOn(fixture.component.navigationItems[0]!, 'focus')

			window.dispatchEvent(new KeyboardEvent('keydown', { key: Key.Alt, bubbles: true, cancelable: true, altKey: true }))

			expect(menuButtonSpy).toHaveBeenCalled()
			expect(firstNavItemSpy).not.toHaveBeenCalled()
		})
	})

	describe('navbar', () => {
		const fixture = new ComponentTestFixture(() => {
			const navigation = new Navigation()
			navigation.style.display = 'block'
			navigation.style.width = '3000px'
			navigation.navigations = ['Home', 'Settings', 'About'].map(createNavigationLink)
			return navigation
		})

		it('should render a navigation item for each navigation', () => {
			expect(fixture.component.navigationItems.length).toBe(3)
		})

		it('should fall back to the web manifest\'s short name when no "navbar-heading" content is slotted', () => {
			const slot = fixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=navbar-heading]')!

			expect(slot.assignedNodes().length).toBe(0)
			expect(slot.textContent?.trim()).toBe('Test Application')
		})

		it('should expose the "navigation" landmark role', () => {
			expect(fixture.component.role).toBe('navigation')
		})
	})

	describe('drawer', () => {
		const fixture = new ComponentTestFixture(() => {
			const navigation = new Navigation()
			navigation.style.display = 'block'
			navigation.navigations = ['Home', 'Settings'].map(createNavigationLink)
			return navigation
		})

		const drawer = () => fixture.component.renderRoot.querySelector('mo-drawer')!
		const list = () => fixture.component.renderRoot.querySelector<HTMLElement>('mo-drawer mo-list')!
		const listItems = () => fixture.component.renderRoot.querySelectorAll<HTMLElement>('mo-drawer mo-navigation-list-item')

		it('should open when the menu button is clicked', async () => {
			fixture.component.menuButton!.click()

			await fixture.updateComplete

			expect(fixture.component.drawerOpen).toBeTrue()
			expect(drawer().open).toBeTrue()
		})

		it('should render a list item for each navigation', () => {
			expect(listItems().length).toBe(2)
		})

		it('should move focus to the navigation list when opened', async () => {
			const focusSpy = spyOn(list(), 'focus')

			fixture.component.drawerOpen = true
			await fixture.updateComplete

			expect(focusSpy).toHaveBeenCalled()
		})

		it('should return focus to the menu button when closed', async () => {
			fixture.component.drawerOpen = true
			await fixture.updateComplete
			const focusSpy = spyOn(fixture.component.menuButton!, 'focus')

			fixture.component.drawerOpen = false
			await fixture.updateComplete

			expect(focusSpy).toHaveBeenCalled()
		})

		it('should close when a navigation is invoked', async () => {
			fixture.component.drawerOpen = true
			await fixture.updateComplete

			listItems()[0]!.click()
			await fixture.updateComplete

			expect(fixture.component.drawerOpen).toBeFalse()
		})
	})
})