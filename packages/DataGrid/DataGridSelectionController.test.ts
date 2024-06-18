import { PureEventDispatcher } from '@a11d/lit'
import { DataGridSelectionBehaviorOnDataChange, DataGridSelectionController, DataGridSelectionMode } from './DataGridSelectionController'

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
			selectionMode: DataGridSelectionMode.None,
			flattenedData: data,
			selectedData: [],
			selectionChange: new PureEventDispatcher<Array<Data>>()
		})
	})

	describe('hasSelection', () => {
		for (const [mode, hasSelection] of [[DataGridSelectionMode.None, false], [DataGridSelectionMode.Single, true], [DataGridSelectionMode.Multiple, true]] as const) {
			it(`should return ${hasSelection} when mode is ${mode}`, () => {
				controller.host.selectionMode = mode
				expect(controller.hasSelection).toBe(hasSelection)
			})
		}
	})

	describe('selectAll', () => {
		for (const [mode, selectedData] of [[DataGridSelectionMode.None, []], [DataGridSelectionMode.Single, []], [DataGridSelectionMode.Multiple, [...data]]] as const) {
			it(`should ${!data.length ? 'not' : ''} select data when mode is ${mode}`, () => {
				controller.host.selectionMode = mode
				Object.defineProperty(controller.host, 'flattenedData', { value: [...data] })

				controller.selectAll()

				expect(controller.host.selectedData).toEqual(selectedData)
			})
		}
	})

	describe('deselectAll', () => {
		it('should deselect all data', () => {
			controller.host.selectionMode = DataGridSelectionMode.Multiple
			controller.host.selectedData = [...data]

			controller.deselectAll()

			expect(controller.host.selectedData).toEqual([])
		})
	})

	describe('select', () => {
		it('should select only selectable data', () => {
			controller.host.selectionMode = DataGridSelectionMode.Multiple
			controller.host.isDataSelectable = (x: Data) => x.id % 2 === 0

			controller.select([...data])

			expect(controller.host.selectedData).toEqual([data[1]])
		})

		it('should dispatch selectionChange with selected data', () => {
			controller.host.selectionMode = DataGridSelectionMode.Multiple
			spyOn(controller.host.selectionChange!, 'dispatch')

			controller.select([...data])

			expect(controller.host.selectionChange?.dispatch).toHaveBeenCalledWith([...data])
		})
	})

	describe('setSelection', () => {
		it('should not select unselectable data', () => {
			controller.host.selectionMode = DataGridSelectionMode.Single
			controller.host.isDataSelectable = () => false

			controller.setSelection(data[0], true)

			expect(controller.host.selectedData).toEqual([])
		})

		it('should select data when selected is true', () => {
			controller.host.selectionMode = DataGridSelectionMode.Single

			controller.setSelection(data[0], true)

			expect(controller.host.selectedData).toEqual([data[0]])
		})

		it('should deselect data when selected is false', () => {
			controller.host.selectionMode = DataGridSelectionMode.Single
			controller.host.selectedData = [data[0]]

			controller.setSelection(data[0], false)

			expect(controller.host.selectedData).toEqual([])
		})
	})

	describe('selectPreviouslySelectedData', () => {
		it('should select previously selected data', () => {
			controller.host.selectionMode = DataGridSelectionMode.Multiple
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
				controller.host.selectionMode = DataGridSelectionMode.Multiple
				controller.host.selectedData = dataToSelect

				controller.handleDataChange(behavior)

				expect(controller.host.selectedData).toEqual(selectedData)
			})
		}
	})
})