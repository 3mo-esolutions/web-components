import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type RadioListItem, type SelectionListItemChangeEvent } from './index.js'

describe('RadioListItem', () => {
	const fixture = new ComponentTestFixture<RadioListItem>(html`
		<mo-radio-list-item name='options'>Option 1</mo-radio-list-item>
	`)

	const radio = () => fixture.component.renderRoot.querySelector('mo-radio')!

	const recordChanges = () => {
		const changes = new Array<SelectionListItemChangeEvent<boolean>>()
		fixture.component.addEventListener('change', event => changes.push(event as SelectionListItemChangeEvent<boolean>))
		return changes
	}

	it('should select itself on click and announce the change', async () => {
		const changes = recordChanges()

		fixture.component.click()
		await fixture.updateComplete

		expect(fixture.component.selected).toBe(true)
		expect(changes.map(change => change.detail)).toEqual([true])
	})

	it('should not re-announce a change when already selected (guards Firefox\'s duplicated radio clicks)', async () => {
		const changes = recordChanges()

		fixture.component.click()
		await fixture.updateComplete
		fixture.component.click()
		await fixture.updateComplete

		expect(fixture.component.selected).toBe(true)
		expect(changes.map(change => change.detail)).toEqual([true])
	})

	it('should not double-fire when the embedded radio itself is clicked', async () => {
		const changes = recordChanges()

		radio().dispatchEvent(new CustomEvent('change', { detail: true }))
		radio().dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
		await fixture.updateComplete

		expect(fixture.component.selected).toBe(true)
		expect(changes.map(change => change.detail)).toEqual([true])
	})
})