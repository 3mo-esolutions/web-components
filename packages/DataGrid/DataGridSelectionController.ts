import { type Selectability, SelectabilityBehaviorOnItemsChange, SelectabilityController, SelectabilityInteraction, SelectabilityStamping } from '@3mo/selectability'
import type { ReactiveElement } from '@a11d/lit'
import type { DataRecord } from './DataRecord.js'

export { Selectability as DataGridSelectability, SelectabilityBehaviorOnItemsChange as DataGridSelectionBehaviorOnDataChange } from '@3mo/selectability'

interface SelectableComponent<TData> extends ReactiveElement {
	selectability?: Selectability
	readonly dataRecords: Array<DataRecord<TData>>
	selectedData: Array<TData>
	isDataSelectable?(data: TData): boolean
	readonly selectionChange?: EventDispatcher<Array<TData>>
	readonly selectionBehaviorOnDataChange?: SelectabilityBehaviorOnItemsChange
}

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

	constructor(override readonly host: SelectableComponent<TData>) {
		super(host, {
			interaction: SelectabilityInteraction.Manual,
			stamping: SelectabilityStamping.None,
			get selectability() { return host.selectability },
			get items() { return host.dataRecords.map(record => record.data) },
			get selection() { return host.selectedData },
			get isSelectable() { return host.isDataSelectable?.bind(host) },
			get behaviorOnItemsChange() { return host.selectionBehaviorOnDataChange },
			key: DataGridSelectionController.keyOf,
			handleChange: ({ selection }) => {
				host.selectedData = [...selection]
				host.selectionChange?.dispatch([...selection])
			},
		})
	}

	get hasSelection() { return this.enabled }

	selectPreviouslySelectedData() {
		this.handleItemsChange(SelectabilityBehaviorOnItemsChange.Maintain)
	}
}