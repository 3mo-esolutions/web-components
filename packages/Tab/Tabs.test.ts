import { ComponentTestFixture } from '@a11d/lit-testing'
import { bind, Component, component, html, state } from '@a11d/lit'
import { type Tabs } from './Tabs.js'
import './index.js'

/**
 * The bar adopts its tabs a task after they are slotted into it, and the tabs pair their panels on the
 * update which follows, so both have to be let through before anything is asserted.
 */
const settle = async (tabs: Tabs) => {
	await tabs.updateComplete
	await new Promise(resolve => setTimeout(resolve))
	await tabs.updateComplete
}

@component('mo-test-tabs-binding-host')
class BindingHost extends Component {
	@state() selection?: string

	get tabs() { return this.renderRoot.querySelector('mo-tabs')! }

	protected override get template() {
		return html`
			<mo-tabs ${bind(this, 'selection')}>
				<mo-tab value='a'>A</mo-tab>
				<mo-tab value='b'>B</mo-tab>
				<mo-tab-panel value='a'>A</mo-tab-panel>
				<mo-tab-panel value='b'>B</mo-tab-panel>
			</mo-tabs>
		`
	}
}

describe('Tabs', () => {
	const tabByValue = (fixture: ComponentTestFixture<Tabs>, value: string) => fixture.component.tabs.find(tab => tab.value === value)!
	const panelByValue = (fixture: ComponentTestFixture<Tabs>, value: string) => fixture.component.panels.find(panel => panel.value === value)!

	describe('the tabs and the panels', () => {
		const fixture = new ComponentTestFixture<Tabs>(html`
			<mo-tabs value='b'>
				<mo-tab value='a'>A</mo-tab>
				<mo-tab value='b'>B</mo-tab>
				<mo-tab-panel value='a'>A content</mo-tab-panel>
				<mo-tab-panel value='b'>B content</mo-tab-panel>
			</mo-tabs>
		`)

		it('should be found in their own slots, in their order', async () => {
			await settle(fixture.component)

			expect(fixture.component.tabs.map(tab => tab.value)).toEqual(['a', 'b'])
			expect(fixture.component.panels.map(panel => panel.value)).toEqual(['a', 'b'])
		})

		it('should reach the tab bar through its forwarding slot', async () => {
			await settle(fixture.component)

			const tabBar = fixture.component.renderRoot.querySelector('mo-tab-bar')!
			expect(tabBar.tabs.map(tab => tab.value)).toEqual(['a', 'b'])
		})
	})

	describe('a panel', () => {
		const fixture = new ComponentTestFixture<Tabs>(html`
			<mo-tabs value='b'>
				<mo-tab value='a'>A</mo-tab>
				<mo-tab value='b'>B</mo-tab>
				<mo-tab-panel value='a'>A content</mo-tab-panel>
				<mo-tab-panel value='b'>B content</mo-tab-panel>
			</mo-tabs>
		`)

		it('should be named after the tab of its value, which in turn announces what it controls', async () => {
			await settle(fixture.component)

			const tab = tabByValue(fixture, 'a')
			const panel = panelByValue(fixture, 'a')

			expect(tab.id).toBeTruthy()
			expect(panel.id).toBeTruthy()
			expect(panel.getAttribute('aria-labelledby')).toBe(tab.id)
			expect(tab.getAttribute('aria-controls')).toBe(panel.id)
		})

		it('should be shown only while its value is the current one', async () => {
			await settle(fixture.component)

			expect(panelByValue(fixture, 'a').active).toBe(false)
			expect(panelByValue(fixture, 'b').active).toBe(true)
		})

		it('should hand the shown one over when the value changes', async () => {
			await settle(fixture.component)

			fixture.component.value = 'a'
			await settle(fixture.component)

			expect(panelByValue(fixture, 'a').active).toBe(true)
			expect(panelByValue(fixture, 'b').active).toBe(false)
		})
	})

	describe('a tab activated by the bar', () => {
		const fixture = new ComponentTestFixture<Tabs>(html`
			<mo-tabs value='a'>
				<mo-tab value='a'>A</mo-tab>
				<mo-tab value='b'>B</mo-tab>
				<mo-tab-panel value='a'>A content</mo-tab-panel>
				<mo-tab-panel value='b'>B content</mo-tab-panel>
			</mo-tabs>
		`)

		it('should be adopted, announced and reflected by the panels', async () => {
			await settle(fixture.component)
			const handler = vi.fn()
			fixture.component.addEventListener('change', handler)

			tabByValue(fixture, 'b').click()
			await settle(fixture.component)

			expect(fixture.component.value).toBe('b')
			expect(handler).toHaveBeenCalledTimes(1)
			expect(handler.mock.lastCall![0].detail).toBe('b')
			expect(panelByValue(fixture, 'b').active).toBe(true)
		})

		it('should not be announced when the value is assigned rather than chosen', async () => {
			await settle(fixture.component)
			const handler = vi.fn()
			fixture.component.addEventListener('change', handler)

			fixture.component.value = 'b'
			await settle(fixture.component)

			expect(panelByValue(fixture, 'b').active).toBe(true)
			expect(handler).not.toHaveBeenCalled()
		})
	})

	describe('an absent value', () => {
		const fixture = new ComponentTestFixture<Tabs>(html`
			<mo-tabs>
				<mo-tab value='a'>A</mo-tab>
				<mo-tab value='b'>B</mo-tab>
				<mo-tab-panel value='a'>A content</mo-tab-panel>
				<mo-tab-panel value='b'>B content</mo-tab-panel>
			</mo-tabs>
		`)

		it('should adopt the tab the bar activates on its own and show its panel', async () => {
			await settle(fixture.component)

			expect(fixture.component.value).toBe('a')
			expect(panelByValue(fixture, 'a').active).toBe(true)
		})
	})

	describe('a tab without a panel', () => {
		const fixture = new ComponentTestFixture<Tabs>(html`
			<mo-tabs value='a'>
				<mo-tab value='a'>A</mo-tab>
				<mo-tab value='b'>B</mo-tab>
				<mo-tab-panel value='a'>A content</mo-tab-panel>
			</mo-tabs>
		`)

		it('should not announce controlling one', async () => {
			await settle(fixture.component)

			expect(tabByValue(fixture, 'b').hasAttribute('aria-controls')).toBe(false)
		})
	})

	describe('a panel without a tab', () => {
		const fixture = new ComponentTestFixture<Tabs>(html`
			<mo-tabs value='a'>
				<mo-tab value='a'>A</mo-tab>
				<mo-tab-panel value='a'>A content</mo-tab-panel>
				<mo-tab-panel value='orphan'>Orphan</mo-tab-panel>
			</mo-tabs>
		`)

		it('should carry no name of its own', async () => {
			await settle(fixture.component)

			expect(panelByValue(fixture, 'orphan').hasAttribute('aria-labelledby')).toBe(false)
		})
	})

	describe('panels slotted after the value', () => {
		const fixture = new ComponentTestFixture<Tabs>(html`
			<mo-tabs value='b'>
				<mo-tab value='a'>A</mo-tab>
				<mo-tab value='b'>B</mo-tab>
			</mo-tabs>
		`)

		it('should be paired and shown once they arrive', async () => {
			await settle(fixture.component)

			const panel = document.createElement('mo-tab-panel')
			panel.value = 'b'
			fixture.component.append(panel)
			await settle(fixture.component)

			expect(panel.active).toBe(true)
			expect(panel.getAttribute('aria-labelledby')).toBe(tabByValue(fixture, 'b').id)
		})
	})

	describe('a two-way bound value', () => {
		const fixture = new ComponentTestFixture<BindingHost>(html`<mo-test-tabs-binding-host></mo-test-tabs-binding-host>`)

		it('should be written back to its source when a tab is activated', async () => {
			await settle(fixture.component.tabs)

			fixture.component.tabs.tabs.find(tab => tab.value === 'b')!.click()
			await settle(fixture.component.tabs)

			expect(fixture.component.selection).toBe('b')
		})
	})
})