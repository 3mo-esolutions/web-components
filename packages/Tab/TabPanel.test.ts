import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import './index.js'
// eslint-disable-next-line no-duplicate-imports
import { type TabPanel } from './index.js'

describe('TabPanel', () => {
	const fixture = new ComponentTestFixture<TabPanel>(html`
		<mo-tab-panel value='a'>Content</mo-tab-panel>
	`)

	it('should assign itself to the panel slot, so that markup does not have to', () => {
		expect(fixture.component.slot).toBe('panel')
	})

	it('should be a tabpanel which keyboard users reach even without focusable content', () => {
		expect(fixture.component.role).toBe('tabpanel')
		expect(fixture.component.tabIndex).toBe(0)
	})

	it('should be hidden until it is activated', async () => {
		expect(getComputedStyle(fixture.component).display).toBe('none')

		fixture.component.active = true
		await fixture.updateComplete

		expect(getComputedStyle(fixture.component).display).not.toBe('none')
	})
})