import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { type SelectableList, SelectableListSelectability, type SelectableListItem } from './index.js'

class SelectableListTestFixture extends ComponentTestFixture<SelectableList> {
	dispatchedSelectedIndices?: Array<number>

	constructor({ selectability }: { selectability: SelectableListSelectability }) {
		super(html`
			<mo-selectable-list selectability=${selectability}
				@change=${(e: CustomEvent<Array<number>>) => this.dispatchedSelectedIndices = e.detail}
			>
				<mo-selectable-list-item>Item 1</mo-selectable-list-item>
				<mo-checkbox-list-item>Item 2</mo-checkbox-list-item>
				<mo-switch-list-item>Item 3</mo-switch-list-item>
				<mo-radio-list-item>Item 4</mo-radio-list-item>
			</mo-selectable-list>
		`)
	}

	/** The list listens for item changes on its slot, which it can only query asynchronously — so a
	 * click dispatched the instant the fixture resolves races that listener. Nothing a user can do,
	 * but a spec can, and it is what kept the change-event specs disabled. */
	override async initialize() {
		const component = await super.initialize()
		await new Promise(resolve => setTimeout(resolve))
		return component
	}

	get items() {
		return this.component.items as Array<SelectableListItem>
	}

	itemsExcept(item: SelectableListItem) {
		return this.items.filter(i => i !== item)
	}

	get selectedIndices() {
		return this.items.map((item, index) => item.selected ? index : undefined).filter(index => index !== undefined)
	}

	/** The press carries the modifiers; the item then reports itself with a plain CustomEvent. */
	shiftClick(item: SelectableListItem) {
		item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, shiftKey: true }))
		item.click()
	}
}

describe('SelectableList', () => {
	describe('single selection', () => {
		const fixture = new SelectableListTestFixture({ selectability: SelectableListSelectability.Single })

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

		it('should dispatch change event with the selected item index', async () => {
			for (const item of fixture.items) {
				item.click()
				await fixture.updateComplete
				expect(fixture.dispatchedSelectedIndices).toEqual([fixture.items.indexOf(item)])
			}
		})

		it('should ignore a range, since there can only ever be one', async () => {
			fixture.items[0]!.click()
			await fixture.updateComplete

			fixture.shiftClick(fixture.items[2]!)
			await fixture.updateComplete

			expect(fixture.component.value).toEqual([2])
			expect(fixture.selectedIndices).toEqual([2])
		})
	})

	describe('multiple selection', () => {
		const fixture = new SelectableListTestFixture({ selectability: SelectableListSelectability.Multiple })

		it('should select multiple items', async () => {
			for (const item of fixture.items) {
				item.click()
				await fixture.updateComplete
				expect(item.selected).toBe(true)
			}
		})

		it('should dispatch change event with the selected items indices', async () => {
			const indices = new Array<number>()
			for (const item of fixture.items) {
				item.click()
				await fixture.updateComplete
				indices.push(fixture.items.indexOf(item))
				expect(fixture.dispatchedSelectedIndices).toEqual(indices)
			}
		})

		// The gesture the list has never had: it went straight to the item, which knew only itself.
		it('should extend the selection over the run when shift is held', async () => {
			fixture.items[0]!.click()
			await fixture.updateComplete

			fixture.shiftClick(fixture.items[2]!)
			await fixture.updateComplete

			expect(fixture.component.value).toEqual([0, 1, 2])
			expect(fixture.selectedIndices).toEqual([0, 1, 2])
			expect(fixture.dispatchedSelectedIndices).toEqual([0, 1, 2])
		})

		it('should remove the run instead, where the anchor was left deselected', async () => {
			for (const item of fixture.items) {
				item.click()
				await fixture.updateComplete
			}
			expect(fixture.selectedIndices).toEqual([0, 1, 2, 3])

			// The checkbox item toggles itself off, which leaves the anchor deselected.
			fixture.items[1]!.click()
			await fixture.updateComplete
			expect(fixture.selectedIndices).toEqual([0, 2, 3])

			// Shift onto the switch item: the run between the two goes, following the anchor.
			fixture.shiftClick(fixture.items[2]!)
			await fixture.updateComplete

			expect(fixture.selectedIndices).toEqual([0, 3])
		})

		// The radio item decides for itself that a click changing nothing is not worth reporting —
		// exclusivity and idempotence stay the item's business, not the list's.
		it('should never hear from an item that swallowed its own click', async () => {
			fixture.items[3]!.click()
			await fixture.updateComplete
			expect(fixture.selectedIndices).toEqual([3])

			fixture.items[3]!.click()
			await fixture.updateComplete
			expect(fixture.selectedIndices).toEqual([3])
		})

		it('should correct an item that put itself into a state the list did not agree with', async () => {
			fixture.items[0]!.click()
			await fixture.updateComplete

			// The item selects itself on click before anyone rules on it...
			fixture.shiftClick(fixture.items[2]!)
			expect(fixture.items[1]!.selected).toBe(true) // ...and the ones between it are brought along
			await fixture.updateComplete

			expect(fixture.selectedIndices).toEqual([0, 1, 2])
		})
	})

	describe('programmatic value', () => {
		const fixture = new SelectableListTestFixture({ selectability: SelectableListSelectability.Multiple })

		const resolvedIndices = () => fixture.items
			.map((item, index) => fixture.component.selectabilityController.isSelected(item) ? index : undefined)
			.filter(index => index !== undefined)

		it('should resolve an assigned value to its items without announcing a change', async () => {
			fixture.component.value = [0, 2]
			await fixture.updateComplete

			expect(resolvedIndices()).toEqual([0, 2])
			expect(fixture.dispatchedSelectedIndices).toBeUndefined()
		})

		it('should resolve out-of-range indices to nothing rather than failing', async () => {
			fixture.component.value = [42]
			await fixture.updateComplete

			expect(resolvedIndices()).toEqual([])
			expect(fixture.selectedIndices).toEqual([])
		})
	})
})