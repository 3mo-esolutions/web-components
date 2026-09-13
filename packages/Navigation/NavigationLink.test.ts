import { html, render, type HTMLTemplateResult } from '@a11d/lit'
import { NavigationStrategy } from '@a11d/lit-application'
import '@a11d/metadata'
import './index.js'
import { NavigationGroup } from './NavigationGroup.js'
import { NavigationLink } from './NavigationLink.js'

class TestNavigationTarget {
	matchedUrl = false
	constructor(readonly parameters?: object) { }
	get url() { return { path: '/home' } }
	urlMatches() { return this.matchedUrl }
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

	it('should report the icon, the hidden state and the separator of its options', () => {
		const link = createNavigationLink({ label: 'Home', icon: 'home', hidden: true, hasSeparator: true })

		expect(link.icon).toBe('home')
		expect(link.hidden).toBeTrue()
		expect(link.hasSeparator).toBeTrue()
		expect(createNavigationLink({ label: 'Home' }).hidden).toBeFalse()
	})

	it('should be current while the router matches its component\'s url', () => {
		const component = new TestNavigationTarget
		const link = new NavigationLink({ component } as any)

		expect(link.current).toBeFalse()

		component.matchedUrl = true

		expect(link.current).toBeTrue()
	})

	describe('link', () => {
		it('should make the element it is applied to a link to its component', () => {
			const link = new NavigationLink({ component: new TestNavigationTarget } as any)
			const container = renderTemplate(html`<button ${link.link()}>Home</button>`)

			expect(container.querySelector('button')!.getAttribute('href')).toBe('/home')
		})

		it('should invoke both its own and the caller\'s invocation handlers on navigation', () => {
			const ownInvocationHandler = jasmine.createSpy('invocationHandler')
			const callerInvocationHandler = jasmine.createSpy('callerInvocationHandler')
			const link = createNavigationLink({ label: 'Home', invocationHandler: ownInvocationHandler })
			const container = renderTemplate(html`<button ${link.link({ invocationHandler: callerInvocationHandler })}>Home</button>`)

			container.querySelector('button')!.click()

			expect(ownInvocationHandler).toHaveBeenCalledTimes(1)
			expect(callerInvocationHandler).toHaveBeenCalledTimes(1)
		})
	})
})

describe('NavigationGroup', () => {
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

	describe('current', () => {
		it('should not be current while none of its children is', () => {
			expect(createGroup({ children: [createNavigationLink({ label: 'Home' })] }).current).toBeFalse()
		})

		it('should be current while one of its children is', () => {
			const component = new TestNavigationTarget
			component.matchedUrl = true
			const group = createGroup({
				children: [
					createNavigationLink({ label: 'Home' }),
					new NavigationLink({ component } as any),
				]
			})

			expect(group.current).toBeTrue()
		})
	})

	it('should not offer a link of its own', () => {
		expect((createGroup({ children: [] }) as { link?: unknown }).link).toBeUndefined()
	})
})