import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { type SelectableList } from './index.js'

describe('ListFocusController', () => {
	describe('default focused item', () => {
		const fixture = new ComponentTestFixture<SelectableList>(html`
			<mo-selectable-list>
				<mo-selectable-list-item>Item 1</mo-selectable-list-item>
				<mo-selectable-list-item>Item 2</mo-selectable-list-item>
				<mo-selectable-list-item>Item 3</mo-selectable-list-item>
				<mo-selectable-list-item>Item 4</mo-selectable-list-item>
			</mo-selectable-list>
		`)

		const focus = () => fixture.component.focusController

		const select = async (...indices: Array<number>) => {
			fixture.component.value = indices
			await fixture.updateComplete
		}

		it('should focus the selected item when the list is focused without one', async () => {
			await select(2)

			focus().focusIn()

			expect(focus().focusedItemIndex).toBe(2)
			expect(fixture.component.items[2]!.hasAttribute('focused')).toBe(true)
		})

		it('should focus the topmost selected item of a multiple selection', async () => {
			await select(3, 1)

			focus().focusIn()

			expect(focus().focusedItemIndex).toBe(1)
		})

		it('should leave the list without a focused item when nothing is selected', () => {
			focus().focusIn()

			expect(focus().focusedItemIndex).toBeUndefined()
			expect(fixture.component.items.some(item => item.hasAttribute('focused'))).toBe(false)
		})

		it('should not overrule an item that is already focused', async () => {
			await select(2)
			focus().focusItem(fixture.component.items[0]!)

			focus().focusIn()

			expect(focus().focusedItemIndex).toBe(0)
		})

		it('should start keyboard traversal from the selected item', async () => {
			await select(1)
			focus().focusIn()

			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))

			expect(focus().focusedItemIndex).toBe(2)
		})

		it('should scroll the selected item into view', async () => {
			fixture.component.style.display = 'block'
			fixture.component.style.maxHeight = '50px'
			fixture.component.style.overflowY = 'auto'
			await select(3)

			focus().focusIn()

			expect(fixture.component.scrollTop).toBeGreaterThan(0)
		})
	})

	describe('focusedItemIndex', () => {
		const fixture = new ComponentTestFixture<SelectableList>(html`<mo-selectable-list></mo-selectable-list>`)

		it('should stay undefined while the list has no items', () => {
			fixture.component.focusController.focusedItemIndex = 0

			expect(fixture.component.focusController.focusedItemIndex).toBeUndefined()
		})
	})
})