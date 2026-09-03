import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type SelectableListItem, type SelectionListItemChangeEvent } from './index.js'

describe('SelectableListItem', () => {
	const fixture = new ComponentTestFixture<SelectableListItem>(html`
		<mo-selectable-list-item>Selectable</mo-selectable-list-item>
	`)

	const recordChanges = () => {
		const changes = new Array<SelectionListItemChangeEvent<boolean>>()
		fixture.component.addEventListener('change', event => changes.push(event as SelectionListItemChangeEvent<boolean>))
		return changes
	}

	it('should select itself on click, announcing a change that carries its selected state', async () => {
		const changes = recordChanges()

		fixture.component.click()
		await fixture.updateComplete

		expect(fixture.component.selected).toBe(true)
		expect(changes.length).toBe(1)
		expect(changes[0]!.detail).toBe(true)
		expect(changes[0]!.selected).toBe(true)
	})

	it('should stay selected on a second click by default', async () => {
		fixture.component.click()
		await fixture.updateComplete

		fixture.component.click()
		await fixture.updateComplete

		expect(fixture.component.selected).toBe(true)
	})

	it('should toggle off on a second click when toggleable', async () => {
		fixture.component.toggleable = true
		fixture.component.click()
		await fixture.updateComplete
		expect(fixture.component.selected).toBe(true)

		fixture.component.click()
		await fixture.updateComplete

		expect(fixture.component.selected).toBe(false)
	})
})