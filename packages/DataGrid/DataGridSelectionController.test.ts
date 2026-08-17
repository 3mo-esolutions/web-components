import { component, Component, PureEventDispatcher } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { DataGridSelectability, DataGridSelectionBehaviorOnDataChange, DataGridSelectionController } from './DataGridSelectionController.js'
import type { DataRecord } from './DataRecord.js'

type Data = { id: number }

/** Stands in for the grid: the controller only ever asks a host for these. */
@component('data-grid-selection-controller-test-host')
class TestHost extends Component {
	selectability?: DataGridSelectability
	source = new Array<Data>()
	selectedData = new Array<Data>()
	isDataSelectable?: (data: Data) => boolean
	selectionBehaviorOnDataChange?: DataGridSelectionBehaviorOnDataChange

	readonly selectionChange = new PureEventDispatcher<Array<Data>>()

	get dataRecords() { return this.source.map((data, index) => ({ data, index }) as DataRecord<Data>) }

	readonly controller = new DataGridSelectionController<Data>(this)
}

describe('DataGridSelectionController', () => {
	const data = [{ id: 1 }, { id: 2 }, { id: 3 }]

	const create = (setup: Partial<TestHost> = {}) => new ComponentTestFixture(() =>
		Object.assign(new TestHost(), { source: [...data], selectability: DataGridSelectability.Multiple }, setup))

	describe('hasSelection', () => {
		const fixture = create()

		for (const [mode, hasSelection] of [[undefined, false], [DataGridSelectability.Single, true], [DataGridSelectability.Multiple, true]] as const) {
			it(`is ${hasSelection} when the selectability is ${mode}`, () => {
				fixture.component.selectability = mode!
				expect(fixture.component.controller.hasSelection).toBe(hasSelection)
			})
		}
	})

	describe('isSelectable', () => {
		const fixture = create()

		it('is true where the grid says nothing', () => {
			expect(fixture.component.controller.isSelectable(data[0]!)).toBe(true)
		})

		it('defers to isDataSelectable', () => {
			fixture.component.isDataSelectable = x => x.id % 2 === 0
			expect(fixture.component.controller.isSelectable(data[0]!)).toBe(false)
			expect(fixture.component.controller.isSelectable(data[1]!)).toBe(true)
		})
	})

	describe('isSelected', () => {
		const fixture = create()

		it('answers for what is selected', () => {
			fixture.component.controller.selection = [data[0]!]
			expect(fixture.component.controller.isSelected(data[0]!)).toBe(true)
			expect(fixture.component.controller.isSelected(data[1]!)).toBe(false)
		})

		it('answers by id, so a refetched instance of the same record counts', () => {
			fixture.component.controller.selection = [data[0]!]
			expect(fixture.component.controller.isSelected({ ...data[0]! })).toBe(true)
		})
	})

	describe('selectAll', () => {
		const fixture = create()

		for (const [mode, selectedData] of [[undefined, []], [DataGridSelectability.Single, []], [DataGridSelectability.Multiple, data]] as const) {
			it(`${selectedData.length ? 'selects' : 'selects nothing'} when the selectability is ${mode}`, () => {
				fixture.component.selectability = mode!
				fixture.component.controller.selectAll()
				expect(fixture.component.selectedData).toEqual([...selectedData])
			})
		}
	})

	describe('deselectAll', () => {
		const fixture = create()

		it('clears the selection', () => {
			fixture.component.controller.selectAll()
			fixture.component.controller.deselectAll()
			expect(fixture.component.selectedData).toEqual([])
		})
	})

	describe('assigning the selection', () => {
		const fixture = create()

		it('takes only the selectable data', () => {
			fixture.component.isDataSelectable = x => x.id % 2 === 0
			fixture.component.controller.selection = [...data]
			expect(fixture.component.selectedData).toEqual([data[1]!])
		})

		it('dispatches selectionChange with what is now selected', () => {
			spyOn(fixture.component.selectionChange, 'dispatch')
			fixture.component.controller.selection = [...data]
			expect(fixture.component.selectionChange.dispatch).toHaveBeenCalledWith([...data])
		})

		it('stays quiet where nothing actually changed', () => {
			fixture.component.controller.selection = [...data]
			spyOn(fixture.component.selectionChange, 'dispatch')
			fixture.component.controller.selection = [...data]
			expect(fixture.component.selectionChange.dispatch).not.toHaveBeenCalled()
		})
	})

	describe('selecting an item', () => {
		const fixture = create({ selectability: DataGridSelectability.Single })

		it('refuses unselectable data', () => {
			fixture.component.isDataSelectable = () => false
			fixture.component.controller.select(data[0]!, { selected: true })
			expect(fixture.component.selectedData).toEqual([])
		})

		it('selects and deselects', () => {
			fixture.component.controller.select(data[0]!, { selected: true })
			expect(fixture.component.selectedData).toEqual([data[0]!])

			fixture.component.controller.select(data[0]!, { selected: false })
			expect(fixture.component.selectedData).toEqual([])
		})

		it('accumulates when told to preserve, in multiple', () => {
			fixture.component.selectability = DataGridSelectability.Multiple
			fixture.component.controller.select(data[0]!, { selected: true, preserve: true })
			fixture.component.controller.select(data[2]!, { selected: true, preserve: true })
			expect(fixture.component.selectedData).toEqual([data[0]!, data[2]!])
		})
	})

	// Never covered before: the shift came from a global keyboard snapshot that no test event could
	// set, so the whole range branch went unexercised.
	describe('shift-clicking a checkbox', () => {
		const fixture = create()

		/** What the browser does: the shift arrives with the press, and the checkbox then reports
		 * itself with a plain CustomEvent that carries no modifier state whatsoever. */
		const shiftPress = () => fixture.component.dispatchEvent(
			new PointerEvent('pointerdown', { bubbles: true, composed: true, shiftKey: true }))

		it('extends the selection over the run', () => {
			fixture.component.controller.select(data[0]!, { selected: true, preserve: true })
			shiftPress()
			fixture.component.controller.select(data[2]!, { selected: true, preserve: true })

			expect(fixture.component.selectedData).toEqual([...data])
		})

		it('removes the run instead, where the anchor was left deselected', () => {
			fixture.component.controller.selectAll()
			fixture.component.controller.select(data[0]!, { selected: false, preserve: true })
			shiftPress()
			fixture.component.controller.select(data[1]!, { selected: false, preserve: true })

			expect(fixture.component.selectedData).toEqual([data[2]!])
		})

		it('takes no notice of a shift the grid never saw', () => {
			fixture.component.controller.select(data[0]!, { selected: true, preserve: true })
			fixture.component.controller.select(data[2]!, { selected: true, preserve: true })
			expect(fixture.component.selectedData).toEqual([data[0]!, data[2]!])
		})
	})

	describe('selectPreviouslySelectedData', () => {
		const fixture = create()

		it('re-resolves the selection onto the data now present', () => {
			fixture.component.controller.selection = [...data]
			fixture.component.source = [...data, { id: 4 }]

			fixture.component.controller.selectPreviouslySelectedData()

			expect(fixture.component.selectedData).toEqual([...data])
		})
	})

	describe('handleItemsChange', () => {
		const dataToSelect = [{ id: 3 }, { id: 99 }]

		for (const [behavior, selectedData] of [
			[DataGridSelectionBehaviorOnDataChange.Reset, []],
			[DataGridSelectionBehaviorOnDataChange.Maintain, [{ id: 3 }]],
			[DataGridSelectionBehaviorOnDataChange.Prevent, dataToSelect],
		] as const) {
			describe(behavior, () => {
				const fixture = create()

				it('leaves the right data selected', () => {
					fixture.component.selectedData = [...dataToSelect]
					fixture.component.controller.handleItemsChange(behavior)
					expect(fixture.component.selectedData).toEqual([...selectedData])
				})
			})
		}

		describe('maintain', () => {
			const fixture = create()

			it('points the selection at the instances that now exist, not the ones replaced', () => {
				fixture.component.controller.selection = [data[0]!]
				const refetched = data.map(d => ({ ...d }))
				fixture.component.source = refetched

				fixture.component.controller.handleItemsChange(DataGridSelectionBehaviorOnDataChange.Maintain)

				expect(fixture.component.selectedData[0]).toBe(refetched[0]!)
			})
		})

		describe('with data carrying no id', () => {
			const shapes = [{ name: 'a' }, { name: 'b' }] as unknown as Array<Data>
			const fixture = create({ source: [...shapes] })

			it('falls back on the data’s own shape to maintain the selection', () => {
				fixture.component.controller.selection = [shapes[0]!]
				fixture.component.source = shapes.map(d => ({ ...d }))

				fixture.component.controller.handleItemsChange(DataGridSelectionBehaviorOnDataChange.Maintain)

				expect(fixture.component.selectedData).toEqual([shapes[0]!])
			})
		})
	})
})