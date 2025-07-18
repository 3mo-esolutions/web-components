import { PureEventDispatcher } from '@a11d/lit'
import { DataGridSelectionBehaviorOnDataChange, DataGridSelectionController, DataGridSelectability } from './DataGridSelectionController'
import type { DataRecord } from '.'

type Data = { id: number }

describe('DataGridSelectionController', () => {
	let controller: DataGridSelectionController<Data>

	const data = [
		{ id: 1 },
		{ id: 2 },
		{ id: 3 },
	]

	beforeEach(() => {
		controller = new DataGridSelectionController<Data>({
			dataRecords: data.map((data, index) => ({ data, index } as DataRecord<Data>)),
			selectedData: [],
			selectionChange: new PureEventDispatcher<Array<Data>>()
		})
	})

	describe('hasSelection', () => {
		for (const [mode, hasSelection] of [[undefined, false], [DataGridSelectability.Single, true], [DataGridSelectability.Multiple, true]] as const) {
			it(`should return ${hasSelection} when mode is ${mode}`, () => {
				controller.host.selectability = mode
				expect(controller.hasSelection).toBe(hasSelection)
			})
		}
	})

	describe('selectability', () => {
		it('should default to "undefined" normally', () => {
			controller.hasSelection
			expect(controller.host.selectability).toBe(undefined)
		})
		it('should default to "single" when has context menu', () => {
			controller = new DataGridSelectionController<Data>({
				hasContextMenu: true,
				dataRecords: [],
				selectedData: [],
			})
			controller.hasSelection
			expect(controller.host.selectability).toBe(DataGridSelectability.Single)
		})

		it('should not change when already defined', () => {
			for (const selectability of [undefined, DataGridSelectability.Multiple]) {
				controller = new DataGridSelectionController<Data>({
					selectability,
					hasContextMenu: true,
					dataRecords: [],
					selectedData: [],
				})
				expect(controller.host.selectability).toBe(selectability)
			}
		})
	})

	describe('isSelectable', () => {
		it('should return true when isDataSelectable is not defined', () => {
			expect(controller.isSelectable(data[0])).toBe(true)
		})

		it('should return isDataSelectable result', () => {
			controller.host.isDataSelectable = (x: Data) => x.id % 2 === 0

			expect(controller.isSelectable(data[0])).toBe(false)
			expect(controller.isSelectable(data[1])).toBe(true)
		})
	})

	describe('isSelected', () => {
		it('should return true when data is selected', () => {
			controller.host.selectability = DataGridSelectability.Single
			controller.select([data[0]])

			expect(controller.isSelected(data[0])).toBe(true)
		})

		it('should return false when data is not selected', () => {
			controller.select([data[0]])

			expect(controller.isSelected(data[1])).toBe(false)
		})
	})

	describe('selectAll', () => {
		for (const [mode, selectedData] of [[undefined, []], [DataGridSelectability.Single, []], [DataGridSelectability.Multiple, [...data]]] as const) {
			it(`should ${!data.length ? 'not' : ''} select data when mode is ${mode}`, () => {
				controller.host.selectability = mode
				Object.defineProperty(controller.host, 'flattenedData', { value: [...data] })

				controller.selectAll()

				expect(controller.host.selectedData).toEqual(selectedData)
			})
		}
	})

	describe('deselectAll', () => {
		it('should deselect all data', () => {
			controller.host.selectability = DataGridSelectability.Multiple
			controller.host.selectedData = [...data]

			controller.deselectAll()

			expect(controller.host.selectedData).toEqual([])
		})
	})

	describe('select', () => {
		it('should select only selectable data', () => {
			controller.host.selectability = DataGridSelectability.Multiple
			controller.host.isDataSelectable = (x: Data) => x.id % 2 === 0

			controller.select([...data])

			expect(controller.host.selectedData).toEqual([data[1]])
		})

		it('should dispatch selectionChange with selected data', () => {
			controller.host.selectability = DataGridSelectability.Multiple
			spyOn(controller.host.selectionChange!, 'dispatch')

			controller.select([...data])

			expect(controller.host.selectionChange?.dispatch).toHaveBeenCalledWith([...data])
		})
	})

	describe('setSelection', () => {
		it('should not select unselectable data', () => {
			controller.host.selectability = DataGridSelectability.Single
			controller.host.isDataSelectable = () => false

			controller.setSelection(data[0], true)

			expect(controller.host.selectedData).toEqual([])
		})

		it('should select data when selected is true', () => {
			controller.host.selectability = DataGridSelectability.Single

			controller.setSelection(data[0], true)

			expect(controller.host.selectedData).toEqual([data[0]])
		})

		it('should deselect data when selected is false', () => {
			controller.host.selectability = DataGridSelectability.Single
			controller.host.selectedData = [data[0]]

			controller.setSelection(data[0], false)

			expect(controller.host.selectedData).toEqual([])
		})
	})

	describe('selectPreviouslySelectedData', () => {
		it('should select previously selected data', () => {
			controller.host.selectability = DataGridSelectability.Multiple
			controller.host.selectedData = [...data]
			Object.defineProperty(controller.host, 'flattenedData', { value: [...data, { id: 4 }] })

			controller.selectPreviouslySelectedData()

			expect(controller.host.selectedData).toEqual([...data])
		})
	})

	describe('handleDataChange', () => {
		const dataToSelect = [{ id: 3 }, { id: 99 }]
		for (const [behavior, selectedData] of [
			[DataGridSelectionBehaviorOnDataChange.Reset, []],
			[DataGridSelectionBehaviorOnDataChange.Maintain, [{ id: 3 }]],
			[DataGridSelectionBehaviorOnDataChange.Prevent, dataToSelect],
		] as const) {
			it(`should ${!data.length ? 'not' : ''} select data on data change when behavior is ${behavior}`, () => {
				controller.host.selectability = DataGridSelectability.Multiple
				controller.host.selectedData = dataToSelect

				controller.handleDataChange(behavior)

				expect(controller.host.selectedData).toEqual(selectedData)
			})
		}
	})
})