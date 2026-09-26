import { SelectabilityController, SelectabilityInteraction } from '@3mo/selectability'
import type { DataGridController } from './DataGridController.js'

export { Selectability as DataGridSelectability, SelectabilityBehaviorOnItemsChange as DataGridSelectionBehaviorOnDataChange } from '@3mo/selectability'

export class DataGridSelectionController<TData> extends SelectabilityController<TData> {
	private static readonly keys = new WeakMap<object, string>()

	static keyOf(data: unknown) {
		if (typeof data !== 'object' || data === null) {
			return data
		}
		if ('id' in data) {
			return (data as { id: unknown }).id
		}
		let key = DataGridSelectionController.keys.get(data)
		if (key === undefined) {
			key = JSON.stringify(data)
			DataGridSelectionController.keys.set(data, key)
		}
		return key
	}

	/** `handleChange` runs once the grid's owner holds the new selection. */
	constructor(controller: DataGridController<TData>, options?: { readonly handleChange?: () => void }) {
		super(controller.host, {
			interaction: SelectabilityInteraction.Manual,
			get selectability() { return controller.options.selectability },
			get items() { return controller.records.records.map(record => record.data) },
			get selection() { return controller.options.selectedData },
			get isSelectable() { return controller.options.isDataSelectable },
			get behaviorOnItemsChange() { return controller.options.selectionBehaviorOnDataChange },
			key: DataGridSelectionController.keyOf,
			handleChange: ({ selection }) => {
				controller.options.handleSelectionChange?.([...selection])
				options?.handleChange?.()
			},
		})
	}

	get hasSelection() { return this.enabled }
}