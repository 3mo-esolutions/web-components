import { ComponentTestFixture } from '@a11d/lit-testing'
import './index.js'
import { fakeNavigation as navigation } from './fakeNavigation.test.js'
import { NavigationBar } from './NavigationBar.js'

describe('NavigationBar', () => {
	const quarterly = navigation('Quarterly', { children: [navigation('First quarter'), navigation('Second quarter')] })

	const fixture = new ComponentTestFixture(() => {
		const bar = new NavigationBar()
		bar.style.width = '3000px'
		bar.navigations = [
			navigation('Dashboard', { current: true }),
			navigation('Reports', { children: [navigation('Overview'), navigation('Annual'), quarterly] }),
			navigation('Secrets', { hidden: true }),
		]
		return bar
	})

	const dropdownOf = async (index: number) => {
		const item = fixture.component.items[index]!
		await item.updateComplete
		return item.shadowRoot!.querySelector('mo-menu')
	}

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

	it('should render the destinations of a group as menu items of its dropdown', async () => {
		const menuItems = (await dropdownOf(1))!.querySelectorAll(':scope > mo-navigation-menu-item')

		expect(menuItems.length).toBe(2)
		expect([...menuItems].map(item => item.textContent?.trim())).toEqual(['Overview', 'Annual'])
	})

	it('should render a group nested in a dropdown as a submenu of its own', async () => {
		const nestedItems = (await dropdownOf(1))!.querySelectorAll(':scope > mo-nested-menu-item')

		expect(nestedItems.length).toBe(1)
		expect(nestedItems[0]!.textContent?.trim().startsWith('Quarterly')).toBeTrue()
		expect([...nestedItems[0]!.querySelectorAll('[slot=submenu]')].map(item => item.textContent?.trim()))
			.toEqual(['First quarter', 'Second quarter'])
	})

	it('should render no dropdown for a navigation without children', async () => {
		expect(await dropdownOf(0)).toBeNull()
	})
})