import { ComponentTestFixture } from '@a11d/lit-testing'
import './index.js'
import { fakeNavigation as navigation, fakeNavigationLink } from './fakeNavigation.test.js'
import { NavigationRail } from './NavigationRail.js'

describe('NavigationRail', () => {
	const products = fakeNavigationLink('Products')
	const masterData = navigation('Master data', { icon: 'inventory_2', children: [products, navigation('Customers')] })
	const reports = navigation('Reports', { icon: 'assessment', current: true, children: [navigation('Annual', { current: true })] })

	const fixture = new ComponentTestFixture(() => {
		const rail = new NavigationRail()
		rail.navigations = [
			navigation('Dashboard', { icon: 'dashboard' }),
			reports,
			masterData,
			navigation('Secrets', { hidden: true }),
		]
		return rail
	})

	const panel = () => fixture.component.renderRoot.querySelector('[part=panel]')
	const panelItems = () => {
		const tree = panel()?.querySelector('mo-navigation-tree')
		return [...tree?.shadowRoot?.querySelectorAll('mo-navigation-tree-item') ?? []].map(item => item.textContent?.trim())
	}

	it('should render an item for each navigation which is not hidden', () => {
		expect(fixture.component.items.length).toBe(3)
		expect(fixture.component.items.map(item => item.navigation.label)).toEqual(['Dashboard', 'Reports', 'Master data'])
	})

	it('should mark the item of the navigation the page belongs to', () => {
		expect(fixture.component.items[1]!.current).toBeTrue()
		expect(fixture.component.items[0]!.current).toBeFalse()
	})

	describe('while overlaid', () => {
		it('should show no panel until a group is picked', () => {
			expect(panel()).toBeNull()
		})

		it('should show the destinations of the group which was picked', async () => {
			fixture.component.items[2]!.click()
			await fixture.updateComplete

			expect(fixture.component.shownNavigation).toBe(masterData)
			expect(panelItems()).toEqual(['Products', 'Customers'])
		})

		it('should dismiss the panel when the same group is picked again', async () => {
			fixture.component.items[2]!.click()
			await fixture.updateComplete
			fixture.component.items[2]!.click()
			await fixture.updateComplete

			expect(panel()).toBeNull()
		})

		it('should dismiss the panel on Escape', async () => {
			fixture.component.items[2]!.click()
			await fixture.updateComplete

			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
			await fixture.updateComplete

			expect(panel()).toBeNull()
		})

		it('should dismiss the panel when something outside is pressed', async () => {
			fixture.component.items[2]!.click()
			await fixture.updateComplete

			document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))
			await fixture.updateComplete

			expect(panel()).toBeNull()
		})

		it('should show no panel for a navigation without destinations', async () => {
			fixture.component.items[0]!.click()
			await fixture.updateComplete

			expect(panel()).toBeNull()
		})

		it('should dismiss the panel once one of its destinations is invoked', async () => {
			fixture.component.items[2]!.click()
			await fixture.updateComplete
			const tree = panel()!.querySelector('mo-navigation-tree')!

			tree.shadowRoot!.querySelector<HTMLElement>('mo-navigation-tree-item')!.click()
			await fixture.updateComplete

			expect(panel()).toBeNull()
		})
	})

	describe('while docked', () => {
		beforeEach(async () => {
			fixture.component.docked = true
			await fixture.updateComplete
		})

		it('should show the destinations of the group the page belongs to', () => {
			expect(fixture.component.shownNavigation).toBe(reports)
			expect(panelItems()).toEqual(['Annual'])
		})

		it('should keep a panel open when the same group is picked again', async () => {
			fixture.component.items[2]!.click()
			await fixture.updateComplete
			fixture.component.items[2]!.click()
			await fixture.updateComplete

			expect(fixture.component.shownNavigation).toBe(masterData)
		})
	})
})