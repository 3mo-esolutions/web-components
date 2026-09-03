import { html, render, type HTMLTemplateResult } from '@a11d/lit'
import { NavigationStrategy } from '@a11d/lit-application'
import '@a11d/metadata'
import '@3mo/list'
import '@3mo/menu'
import '@3mo/line'
import '@3mo/icon'
import './NavigationItem.js'
import { NavigationGroup, NavigationLink } from './INavigation.js'

class TestNavigationTarget {
	constructor(readonly parameters?: object) { }
	get url() { return undefined }
	urlMatches() { return false }
	navigate() { }
}

class TestLabelledNavigationTarget extends TestNavigationTarget { }
label('Dashboard')(TestLabelledNavigationTarget)

const createNavigationLink = (options: object) => new NavigationLink({ component: new TestNavigationTarget, ...options } as any)

const containers = new Array<HTMLElement>()

const renderTemplate = (template: HTMLTemplateResult) => {
	const container = document.createElement('div')
	document.body.appendChild(container)
	containers.push(container)
	render(template, container)
	return container
}

const removeRenderedTemplates = () => {
	while (containers.length > 0) {
		containers.pop()!.remove()
	}
}

describe('NavigationLink', () => {
	afterEach(removeRenderedTemplates)

	describe('label', () => {
		const labelText = (link: NavigationLink) => renderTemplate(link.label).textContent?.trim()

		it('should use the label option when provided', () => {
			expect(labelText(createNavigationLink({ label: 'Home' }))).toBe('Home')
		})

		it('should fall back to the component\'s label metadata when no label option is given', () => {
			const link = new NavigationLink({ component: new TestLabelledNavigationTarget } as any)

			expect(labelText(link)).toBe('Dashboard')
		})

		it('should not append an ellipsis for the default page navigation strategy', () => {
			expect(labelText(createNavigationLink({ label: 'Reports' }))).toBe('Reports')
			expect(labelText(createNavigationLink({ label: 'Reports', navigationStrategy: NavigationStrategy.Page }))).toBe('Reports')
		})

		for (const strategy of ['Tab', 'Window'] as const) {
			it(`should append an ellipsis for non-page navigation strategies (${strategy})`, () => {
				const link = createNavigationLink({ label: 'Reports', navigationStrategy: NavigationStrategy[strategy] })

				expect(labelText(link)).toBe('Reports ...')
			})
		}
	})

	describe('hidden', () => {
		for (const method of ['getItemTemplate', 'getMenuItemTemplate', 'getListItemTemplate'] as const) {
			it(`should render nothing when hidden (${method})`, () => {
				const link = createNavigationLink({ label: 'Home', hidden: true })

				expect(link[method]()).toBe(html.nothing)
			})
		}
	})

	describe('templates', () => {
		for (const method of ['getMenuItemTemplate', 'getListItemTemplate'] as const) {
			it(`should render a leading separator line when hasSeparator is set (${method})`, () => {
				const withSeparator = createNavigationLink({ label: 'Home', hasSeparator: true })
				const withoutSeparator = createNavigationLink({ label: 'Home' })

				expect(renderTemplate(withSeparator[method]()).firstElementChild?.localName).toBe('mo-line')
				expect(renderTemplate(withoutSeparator[method]()).querySelector('mo-line')).toBeNull()
			})
		}

		it('should render the icon in the list template unless iconHidden is requested', () => {
			const link = createNavigationLink({ label: 'Home', icon: 'home' })

			expect(renderTemplate(link.getListItemTemplate()).querySelector('mo-icon[icon=home]')).not.toBeNull()
			expect(renderTemplate(link.getListItemTemplate({ iconHidden: true })).querySelector('mo-icon')).toBeNull()
		})

		it('should invoke both its own and the caller\'s invocation handlers on navigation', () => {
			const ownInvocationHandler = jasmine.createSpy('invocationHandler')
			const callerInvocationHandler = jasmine.createSpy('navigationInvocationHandler')
			const link = createNavigationLink({ label: 'Home', invocationHandler: ownInvocationHandler })
			const container = renderTemplate(link.getListItemTemplate({ navigationInvocationHandler: callerInvocationHandler }))

			container.querySelector<HTMLElement>('mo-navigation-list-item')!.click()

			expect(ownInvocationHandler).toHaveBeenCalledTimes(1)
			expect(callerInvocationHandler).toHaveBeenCalledTimes(1)
		})
	})
})

describe('NavigationGroup', () => {
	afterEach(removeRenderedTemplates)

	const createGroup = (options: object) => new NavigationGroup({ label: 'More', children: [], ...options } as any)

	describe('hidden', () => {
		it('should be hidden when the hidden option is set', () => {
			const group = createGroup({ hidden: true, children: [createNavigationLink({ label: 'Home' })] })

			expect(group.hidden).toBeTrue()
		})

		it('should be hidden when it has no children', () => {
			expect(createGroup({ children: [] }).hidden).toBeTrue()
		})

		it('should be hidden when all children are hidden', () => {
			const group = createGroup({
				children: [
					createNavigationLink({ label: 'Home', hidden: true }),
					createNavigationLink({ label: 'Settings', hidden: true }),
				]
			})

			expect(group.hidden).toBeTrue()
		})

		it('should be visible while at least one child is visible', () => {
			const group = createGroup({
				children: [
					createNavigationLink({ label: 'Home', hidden: true }),
					createNavigationLink({ label: 'Settings' }),
				]
			})

			expect(group.hidden).toBeFalse()
		})
	})

	describe('templates', () => {
		const children = () => [
			createNavigationLink({ label: 'Settings', icon: 'settings' }),
			createNavigationLink({ label: 'About', icon: 'info' }),
		]

		for (const method of ['getItemTemplate', 'getMenuItemTemplate', 'getListItemTemplate'] as const) {
			it(`should render nothing when hidden (${method})`, () => {
				const group = createGroup({ hidden: true, children: children() })

				expect(group[method]()).toBe(html.nothing)
			})
		}

		it('should render a nested menu item with its children in the submenu slot', () => {
			const group = createGroup({ children: children() })

			const nestedMenuItem = renderTemplate(group.getMenuItemTemplate()).querySelector('mo-nested-menu-item')!

			expect(nestedMenuItem).not.toBeNull()
			expect(nestedMenuItem.querySelectorAll('mo-navigation-menu-item[slot=submenu]').length).toBe(2)
		})

		it('should render a collapsible list item with its children as icon-less details items', () => {
			const group = createGroup({ children: children() })

			const collapsibleListItem = renderTemplate(group.getListItemTemplate()).querySelector('mo-collapsible-list-item')!

			expect(collapsibleListItem).not.toBeNull()
			expect(collapsibleListItem.querySelectorAll('mo-navigation-list-item[slot=details]').length).toBe(2)
			expect(collapsibleListItem.querySelectorAll('mo-navigation-list-item[slot=details] mo-icon').length).toBe(0)
		})
	})
})