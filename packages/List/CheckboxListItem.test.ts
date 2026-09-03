import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type CheckboxListItem, type SelectionListItemChangeEvent } from './index.js'

describe('CheckboxListItem', () => {
	const fixture = new ComponentTestFixture<CheckboxListItem>(html`
		<mo-checkbox-list-item>Check Item</mo-checkbox-list-item>
	`)

	const checkbox = () => fixture.component.renderRoot.querySelector('mo-checkbox')!

	const recordChanges = () => {
		const changes = new Array<SelectionListItemChangeEvent<CheckboxSelection>>()
		fixture.component.addEventListener('change', event => changes.push(event as SelectionListItemChangeEvent<CheckboxSelection>))
		return changes
	}

	it('should have the menuitemcheckbox role, so lists and menus recognise it as an item', () => {
		expect(fixture.component.role).toBe('menuitemcheckbox')
	})

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

	it('should not double-toggle when the embedded checkbox itself is clicked', async () => {
		const changes = recordChanges()

		checkbox().dispatchEvent(new CustomEvent('change', { detail: true }))
		checkbox().dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
		await fixture.updateComplete

		expect(fixture.component.selected).toBe(true)
		expect(changes.map(change => change.detail)).toEqual([true])
	})

	it('should accept an indeterminate selected state through its attribute converter', async () => {
		fixture.component.setAttribute('selected', 'indeterminate')
		await fixture.updateComplete

		expect(fixture.component.selected).toBe('indeterminate')
		expect(checkbox().selected).toBe('indeterminate')
	})
})