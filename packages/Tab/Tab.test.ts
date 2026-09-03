import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import './index.js'
// eslint-disable-next-line no-duplicate-imports
import { type Tab } from './index.js'

describe('Tab', () => {
	const fixture = new ComponentTestFixture<Tab>(html`
		<mo-tab value='tab1'>Tab 1</mo-tab>
	`)

	it('should reflect its value as an attribute, so bars and styles can address it', async () => {
		expect(fixture.component.value).toBe('tab1')
		expect(fixture.component.getAttribute('value')).toBe('tab1')

		fixture.component.value = 'tab2'
		await fixture.updateComplete

		expect(fixture.component.getAttribute('value')).toBe('tab2')
	})
})