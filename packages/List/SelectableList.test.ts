import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { SelectableList, SelectableListSelectionMode, type SelectableListItem } from './index.js'

class SelectableListTestFixture extends ComponentTestFixture<SelectableList> {
	dispatchedSelectedIndices?: Array<number>

	constructor({ selectionMode }: { selectionMode: SelectableListSelectionMode }) {
		super(html`
			<mo-selectable-list selectionMode=${selectionMode}
				@change=${(e: CustomEvent<Array<number>>) => this.dispatchedSelectedIndices = e.detail}
			>
				<mo-selectable-list-item>Item 1</mo-selectable-list-item>
				<mo-checkbox-list-item>Item 2</mo-checkbox-list-item>
				<mo-switch-list-item>Item 3</mo-switch-list-item>
				<mo-radio-list-item>Item 4</mo-radio-list-item>
			</mo-selectable-list>
		`)
	}

	get items() {
		return this.component.items as Array<SelectableListItem>
	}

	itemsExcept(item: SelectableListItem) {
		return this.items.filter(i => i !== item)
	}
}

describe('List', () => {
	describe('single selection', () => {
		const fixture = new SelectableListTestFixture({ selectionMode: SelectableListSelectionMode.Single })

		it('should select only one item', async () => {
			for (const item of fixture.items) {
				item.click()
				await fixture.updateComplete
				expect(item.selected).toBe(true)
				for (const other of fixture.itemsExcept(item)) {
					expect(other.selected).toBe(false)
				}
			}
		})

		xit('should dispatch change event with the selected item index', async () => {
			fixture.component.click()
			fixture.items[0].click()
			for (const item of fixture.items) {
				item.click()
				await fixture.updateComplete
				expect(fixture.dispatchedSelectedIndices).toEqual([fixture.items.indexOf(item)])
			}
		})
	})

	describe('multiple selection', () => {
		const fixture = new SelectableListTestFixture({ selectionMode: SelectableListSelectionMode.Multiple })

		it('should select multiple items', async () => {
			for (const item of fixture.items) {
				item.click()
				await fixture.updateComplete
				expect(item.selected).toBe(true)
			}
		})

		xit('should dispatch change event with the selected items indices', async () => {
			const indices = new Array<number>()
			for (const item of fixture.items) {
				item.click()
				await fixture.updateComplete
				indices.push(fixture.items.indexOf(item))
				expect(fixture.dispatchedSelectedIndices).toEqual(indices)
			}
		})
	})
})