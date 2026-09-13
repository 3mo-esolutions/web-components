import { ComponentTestFixture } from '@a11d/lit-testing'
import './index.js'
import { fakeNavigation as navigation } from './fakeNavigation.test.js'
import { NavigationBar } from './NavigationBar.js'

describe('NavigationBar', () => {
	const fixture = new ComponentTestFixture(() => {
		const bar = new NavigationBar()
		bar.style.width = '3000px'
		bar.navigations = [
			navigation('Dashboard', { current: true }),
			navigation('Reports', { children: [navigation('Overview'), navigation('Annual')] }),
			navigation('Secrets', { hidden: true }),
		]
		return bar
	})

	it('should expose the navigation landmark role', () => {
		expect(fixture.component.role).toBe('navigation')
	})

	it('should render an item for each navigation which is not hidden', () => {
		expect(fixture.component.items.length).toBe(2)
		expect(fixture.component.items.map(item => item.navigation.label)).toEqual(['Dashboard', 'Reports'])
	})

	it('should mark the item of the navigation the page belongs to', () => {
		expect(fixture.component.items[0]!.current).toBeTrue()
		expect(fixture.component.items[1]!.current).toBeFalse()
	})

	it('should not report an overflow while the navigations fit', async () => {
		await new Promise(resolve => setTimeout(resolve, 50))

		expect(fixture.component.hasOverflow).toBeFalse()
	})

	it('should focus its first item', () => {
		const focusSpy = spyOn(fixture.component.items[0]!, 'focus')

		fixture.component.focus()

		expect(focusSpy).toHaveBeenCalled()
	})

	it('should render the children of a group as menu items of its dropdown', async () => {
		const group = fixture.component.items[1]!
		await group.updateComplete

		const menuItems = group.shadowRoot!.querySelectorAll('mo-navigation-menu-item')

		expect(menuItems.length).toBe(2)
		expect([...menuItems].map(item => item.textContent?.trim())).toEqual(['Overview', 'Annual'])
	})

	it('should render no dropdown for a navigation without children', async () => {
		const link = fixture.component.items[0]!
		await link.updateComplete

		expect(link.shadowRoot!.querySelector('mo-menu')).toBeNull()
	})
})