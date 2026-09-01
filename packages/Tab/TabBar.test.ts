import { ComponentTestFixture } from '@a11d/lit-testing'
import { bind, Component, component, html, state } from '@a11d/lit'
import { TabBar } from './TabBar.js'
import { Tab } from './Tab.js'
import './index.js'

const flush = () => new Promise(resolve => setTimeout(resolve))

function createTab(value?: string) {
	const tab = new Tab()
	if (value !== undefined) {
		tab.value = value
	}
	tab.textContent = value ?? 'All'
	return tab
}

class TabBarTestFixture extends ComponentTestFixture<TabBar> {
	readonly changeEvents: Array<string | null>

	constructor(parameters: { readonly value?: string, readonly tabs: ReadonlyArray<string | undefined> }) {
		// Recorded from construction on, as the initial activation happens before the first test statement.
		const changeEvents = new Array<string | null>()
		super(() => {
			changeEvents.length = 0
			const tabBar = new TabBar()
			tabBar.value = parameters.value
			tabBar.append(...parameters.tabs.map(value => createTab(value)))
			tabBar.addEventListener('change', event => changeEvents.push((event as CustomEvent<string | null>).detail))
			return tabBar
		})
		this.changeEvents = changeEvents
	}

	get mdTabs() {
		return this.component.renderRoot.querySelector('md-tabs')!
	}

	tabByValue(value?: string) {
		return this.component.tabs.find(tab => tab.value === value)
	}

	/** Mimics md-tabs, which flags the tabs before dispatching its change event. */
	activateViaMdTabs(value?: string) {
		this.component.tabs.forEach(tab => tab.active = tab.value === value)
		this.mdTabs.dispatchEvent(new Event('change'))
	}

	reportNoActiveTabViaMdTabs() {
		this.component.tabs.forEach(tab => tab.active = false)
		this.mdTabs.dispatchEvent(new Event('change'))
	}
}

@component('mo-test-tab-bar-binding-host')
class BindingHost extends Component {
	@state() selection?: string

	get tabBar() { return this.renderRoot.querySelector('mo-tab-bar')! }

	protected override get template() {
		return html`
			<mo-tab-bar ${bind(this, 'selection')}>
				<mo-tab value='a'>A</mo-tab>
				<mo-tab value='b'>B</mo-tab>
			</mo-tab-bar>
		`
	}
}

describe('TabBar', () => {
	describe('tabs', () => {
		const fixture = new TabBarTestFixture({ tabs: ['a', 'b'] })

		it('should only comprise the tab children, in their order', async () => {
			fixture.component.prepend(document.createElement('div'))
			await fixture.component.updateComplete

			expect(fixture.component.tabs.map(tab => tab.value)).toEqual(['a', 'b'])
		})
	})

	describe('a preselected value', () => {
		const fixture = new TabBarTestFixture({ value: 'b', tabs: ['a', 'b'] })

		it('should activate its tab rather than the automatically activated first one', async () => {
			await flush()

			expect(fixture.mdTabs.activeTab).toBe(fixture.tabByValue('b')!)
		})

		it('should be kept and not be announced as a change', async () => {
			await flush()

			expect(fixture.component.value).toBe('b')
			expect(fixture.changeEvents).toEqual([])
		})
	})

	describe('an absent value', () => {
		const fixture = new TabBarTestFixture({ tabs: ['a', 'b'] })

		it('should adopt and announce the automatically activated first tab', async () => {
			await flush()

			expect(fixture.mdTabs.activeTab).toBe(fixture.tabByValue('a')!)
			expect(fixture.component.value).toBe('a')
			expect(fixture.changeEvents).toEqual(['a'])
		})
	})

	describe('assigning a value', () => {
		const fixture = new TabBarTestFixture({ value: 'a', tabs: ['a', 'b'] })

		it('should activate its tab without announcing a change', async () => {
			await flush()

			fixture.component.value = 'b'
			await fixture.component.updateComplete
			await flush()

			expect(fixture.mdTabs.activeTab).toBe(fixture.tabByValue('b')!)
			expect(fixture.changeEvents).toEqual([])
		})

		it('should leave the active tab untouched when no tab matches it', async () => {
			await flush()
			const activeTab = fixture.mdTabs.activeTab

			fixture.component.value = 'without-a-tab'
			await fixture.component.updateComplete
			await flush()

			expect(fixture.mdTabs.activeTab).toBe(activeTab)
			expect(fixture.component.value).toBe('without-a-tab')
		})
	})

	describe('a tab activated through md-tabs', () => {
		const fixture = new TabBarTestFixture({ value: 'a', tabs: ['a', 'b'] })

		it('should be adopted and announced', async () => {
			await flush()

			fixture.activateViaMdTabs('b')
			await fixture.component.updateComplete

			expect(fixture.component.value).toBe('b')
			expect(fixture.changeEvents).toEqual(['b'])
		})

		it('should not be announced when it already matches the value', async () => {
			await flush()

			fixture.activateViaMdTabs('a')
			await fixture.component.updateComplete

			expect(fixture.changeEvents).toEqual([])
		})
	})

	describe('a tab without a value', () => {
		const fixture = new TabBarTestFixture({ value: 'b', tabs: [undefined, 'b'] })

		it('should be adopted as a selection of its own when activated', async () => {
			await flush()

			fixture.activateViaMdTabs(undefined)
			await fixture.component.updateComplete

			expect(fixture.component.value).toBeUndefined()
			// CustomEvent coerces an undefined detail to null.
			expect(fixture.changeEvents).toEqual([null])
		})
	})

	describe('a missing active tab', () => {
		const fixture = new TabBarTestFixture({ value: 'b', tabs: ['a', 'b'] })

		it('should neither clear the value nor be announced', async () => {
			await flush()

			fixture.reportNoActiveTabViaMdTabs()
			await fixture.component.updateComplete

			expect(fixture.component.value).toBe('b')
			expect(fixture.changeEvents).toEqual([])
		})
	})

	describe('tabs slotted after the value', () => {
		const fixture = new TabBarTestFixture({ value: 'b', tabs: [] })

		it('should keep the value and activate its tab once they arrive', async () => {
			await flush()

			fixture.component.append(createTab('a'), createTab('b'))
			await fixture.component.updateComplete
			await flush()

			expect(fixture.component.value).toBe('b')
			expect(fixture.mdTabs.activeTab).toBe(fixture.tabByValue('b')!)
			expect(fixture.changeEvents).toEqual([])
		})
	})

	describe('a two-way bound value', () => {
		const fixture = new ComponentTestFixture<BindingHost>(html`<mo-test-tab-bar-binding-host></mo-test-tab-bar-binding-host>`)

		it('should survive being assigned by its source', async () => {
			await flush()

			fixture.component.selection = 'b'
			await fixture.component.updateComplete
			await flush()

			expect(fixture.component.selection).toBe('b')
			expect(fixture.component.tabBar.value).toBe('b')
		})

		it('should be written back to its source when a tab is activated', async () => {
			await flush()
			const { tabBar } = fixture.component

			tabBar.tabs.forEach(tab => tab.active = tab.value === 'b')
			tabBar.renderRoot.querySelector('md-tabs')!.dispatchEvent(new Event('change'))
			await fixture.component.updateComplete

			expect(fixture.component.selection).toBe('b')
		})
	})
})