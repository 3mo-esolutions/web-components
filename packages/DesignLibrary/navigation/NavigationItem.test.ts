import { ComponentTestFixture } from '@a11d/lit-testing'
import '@3mo/menu'
import '@3mo/focus-ring'
import '@3mo/flex'
import '@3mo/icon'
import { NavigationItem } from './NavigationItem.js'
import { NavigationGroup, NavigationLink } from './INavigation.js'

class TestNavigationTarget {
	constructor(readonly parameters?: object) { }
	get url() { return undefined }
	urlMatches() { return false }
	navigate() { }
}

const createNavigationLink = (label: string) => new NavigationLink({ label, component: new TestNavigationTarget } as any)

const waitUntil = async (predicate: () => boolean, timeout = 2000) => {
	const start = performance.now()
	while (predicate() === false && performance.now() - start < timeout) {
		await new Promise(resolve => setTimeout(resolve, 20))
	}
	return predicate()
}

describe('NavigationItem', () => {
	const linkFixture = new ComponentTestFixture(() => {
		const item = new NavigationItem()
		item.navigation = createNavigationLink('Home')
		return item
	})

	it('should participate in the tab order', () => {
		expect(linkFixture.component.tabIndex).toBe(0)
	})

	describe('rendering a navigation group', () => {
		const fixture = new ComponentTestFixture(() => {
			const item = new NavigationItem()
			item.navigation = new NavigationGroup({
				label: 'More',
				children: [createNavigationLink('Settings'), createNavigationLink('About')],
			})
			return item
		})

		const buttonElement = () => fixture.component.renderRoot.querySelector<HTMLElement>('#button')!
		const arrowIcon = () => fixture.component.renderRoot.querySelector('#button mo-icon')?.getAttribute('icon')
		const menuItems = () => fixture.component.renderRoot.querySelectorAll<HTMLElement>('mo-menu mo-navigation-menu-item')

		it('should render the group\'s label with a downward arrow while closed', () => {
			expect(buttonElement().querySelector('span')?.textContent?.trim()).toBe('More')
			expect(arrowIcon()).toBe('keyboard_arrow_down')
		})

		it('should point the arrow upward while the menu is open', async () => {
			fixture.component.open = true

			await fixture.updateComplete

			expect(arrowIcon()).toBe('keyboard_arrow_up')
		})

		it('should render a menu item for each child navigation', () => {
			expect(menuItems().length).toBe(2)
		})

		it('should open its menu when clicked', async () => {
			await new Promise(resolve => setTimeout(resolve, 50))

			buttonElement().click()

			expect(await waitUntil(() => fixture.component.open)).toBeTrue()
		})

		it('should close its menu when a child navigation is invoked', async () => {
			fixture.component.open = true
			await fixture.updateComplete

			menuItems()[0]!.click()

			expect(await waitUntil(() => fixture.component.open === false)).toBeTrue()
		})
	})
})