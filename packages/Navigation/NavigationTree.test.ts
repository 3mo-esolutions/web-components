import { ComponentTestFixture } from '@a11d/lit-testing'
import './index.js'
import { type INavigation } from './INavigation.js'
import { fakeNavigation as navigation, fakeNavigationLink } from './fakeNavigation.test.js'
import { NavigationTree } from './NavigationTree.js'
import { type NavigationTreeItem } from './NavigationTreeItem.js'

describe('NavigationTree', () => {
	const quarter = navigation('First quarter', { current: true })
	const quarterly = navigation('Quarterly', { current: true, children: [quarter, navigation('Second quarter')] })

	const fixture = new ComponentTestFixture(() => {
		const tree = new NavigationTree()
		tree.navigations = [
			navigation('Dashboard'),
			navigation('Reports', { icon: 'assessment', current: true, children: [navigation('Overview'), quarterly] }),
			navigation('Secrets', { hidden: true }),
		]
		return tree
	})

	const items = () => [...fixture.component.renderRoot.querySelectorAll<NavigationTreeItem>('mo-navigation-tree-item')]
	const itemOf = (label: string) => items().find(item => item.textContent?.trim().startsWith(label))!

	it('should render a row for each navigation which is not hidden, nesting the children', () => {
		expect(items().length).toBe(6)
		expect(itemOf('Secrets')).toBeUndefined()
		expect(itemOf('Quarterly').items.length).toBe(2)
	})

	it('should render the icon of a top-level row only', async () => {
		await fixture.updateComplete

		expect(itemOf('Reports').icon).toBe('assessment')
		expect(itemOf('Quarterly').icon).toBeUndefined()
	})

	it('should mark the destination being shown as the current page', () => {
		expect(itemOf('First quarter').getAttribute('aria-current')).toBe('page')
		expect(itemOf('Second quarter').hasAttribute('aria-current')).toBeFalse()
	})

	it('should mark the sections the current page sits in without claiming to be it', () => {
		expect(itemOf('Reports').current).toBeTrue()
		expect(itemOf('Reports').hasAttribute('aria-current')).toBeFalse()
		expect(itemOf('Dashboard').current).toBeFalse()
	})

	it('should open the ancestors of the current page so that it can be seen', async () => {
		await fixture.updateComplete
		await new Promise(resolve => setTimeout(resolve, 50))

		expect(itemOf('Reports').open).toBeTrue()
		expect(itemOf('Quarterly').open).toBeTrue()
	})

	describe('invoking a destination', () => {
		const invocationFixture = new ComponentTestFixture(() => {
			const tree = new NavigationTree()
			tree.navigations = [fakeNavigationLink('Dashboard')]
			return tree
		})

		it('should report the destination to whoever presented the tree', async () => {
			const handler = jasmine.createSpy('invoke')
			invocationFixture.component.addEventListener('invoke', (event: Event) => handler((event as CustomEvent<INavigation>).detail))
			await invocationFixture.updateComplete

			invocationFixture.component.renderRoot.querySelector<HTMLElement>('mo-navigation-tree-item')!.click()

			expect(handler).toHaveBeenCalledWith(jasmine.objectContaining({ label: 'Dashboard' }))
		})
	})
})