import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type SelectionListItemChangeEvent, type SwitchListItem } from './index.js'

describe('SwitchListItem', () => {
	const fixture = new ComponentTestFixture<SwitchListItem>(html`
		<mo-switch-list-item>Switch Item</mo-switch-list-item>
	`)

	const switchElement = () => fixture.component.renderRoot.querySelector('mo-switch')!

	const recordChanges = () => {
		const changes = new Array<SelectionListItemChangeEvent<boolean>>()
		fixture.component.addEventListener('change', event => changes.push(event as SelectionListItemChangeEvent<boolean>))
		return changes
	}

	it('should toggle on a click anywhere on the item and announce the change', async () => {
		const changes = recordChanges()

		fixture.component.click()
		await fixture.updateComplete
		expect(fixture.component.selected).toBe(true)

		fixture.component.click()
		await fixture.updateComplete
		expect(fixture.component.selected).toBe(false)

		expect(changes.map(change => change.detail)).toEqual([true, false])
	})

	it('should not double-toggle when the embedded switch itself is clicked', async () => {
		const changes = recordChanges()

		switchElement().dispatchEvent(new CustomEvent('change', { detail: true }))
		switchElement().dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
		await fixture.updateComplete

		expect(fixture.component.selected).toBe(true)
		expect(changes.map(change => change.detail)).toEqual([true])
	})
})