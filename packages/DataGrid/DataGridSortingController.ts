import { KeyboardController } from '@3mo/keyboard-controller'

export enum DataGridSortingStrategy {
	Descending = 'descending',
	Ascending = 'ascending',
}

export type DataGridSortingDefinition<TData> = {
	readonly selector: KeyPath.Of<TData>
	readonly strategy: DataGridSortingStrategy
}

export type DataGridRankedSortDefinition<TData> = DataGridSortingDefinition<TData> & {
	readonly rank: number
}

export type DataGridSorting<TData> =
	| DataGridSortingDefinition<TData>
	| Array<DataGridSortingDefinition<TData>>

interface SortableComponent<TData> {
	sorting?: DataGridSorting<TData> | undefined
	readonly sortingChange?: EventDispatcher<Array<DataGridRankedSortDefinition<TData>>>
}

export class DataGridSortingController<TData> {
	constructor(readonly host: SortableComponent<TData>) { }

	get enabled() {
		return !!this.host.sorting
	}

	get() {
		return this.toNormalizedRanked(this.host.sorting ?? [])
	}

	set(sorting: DataGridSorting<TData>) {
		const normalized = this.toNormalizedRanked(sorting ?? [])
		this.host.sorting = normalized
		this.host.sortingChange?.dispatch(normalized)
	}

	private toNormalizedRanked(sorting: DataGridSorting<TData>) {
		return (Array.isArray(sorting) ? sorting : [sorting])
			.map((d, i): DataGridRankedSortDefinition<TData> => ({ ...d, rank: i + 1 }))
	}

	reset() {
		this.set([])
	}

	/**
	 * Toggles the sorting strategy of the provided key path.
	 * If a modifier key is pressed, the sorting will be added to the existing sorting definitions.
	 *
	 * @param selector - The key path of the data to sort by
	 * @param strategy - The sorting strategy to use forcefully. If not provided, the strategy will be toggled between ascending, descending, and unsorted
	 */
	toggle(selector: KeyPath.Of<TData>, strategy?: DataGridSortingStrategy) {
		const defaultSortingStrategy = DataGridSortingStrategy.Descending

		const sortings = this.get()
		const existing = sortings.find(x => x.selector === selector)

		const allowMultiple = KeyboardController.shift || KeyboardController.meta || KeyboardController.ctrl

		switch (true) {
			case allowMultiple && !!strategy:
				this.set([...sortings, { selector, strategy }])
				break
			case allowMultiple && existing?.selector !== selector:
				this.set([...sortings, { selector, strategy: defaultSortingStrategy }])
				break
			case allowMultiple && existing?.strategy === DataGridSortingStrategy.Descending:
				this.set(
					sortings.map(x => x.selector !== selector ? x : {
						selector,
						strategy: DataGridSortingStrategy.Ascending,
					})
				)
				break
			case allowMultiple:
				this.set(sortings.filter(x => x.selector !== selector))
				break
			case !!strategy:
				this.set({ selector, strategy })
				break
			case existing?.selector !== selector:
				this.set({ selector, strategy: defaultSortingStrategy })
				break
			case existing?.strategy === DataGridSortingStrategy.Descending:
				this.set({ selector, strategy: DataGridSortingStrategy.Ascending })
				break
			default:
				this.reset()
				break
		}
	}

	/**
	 * Sorts the provided data based on the current sorting definitions
	 * @param data - The data to sort
	 * @returns - The sorted data
	 */
	toSorted(data: Array<TData>) {
		return this.toSortedBy(data, d => d)
	}

	toSortedBy<T>(data: Array<T>, extractor: (data: T) => TData) {
		const sorting = this.get()

		if (!sorting?.length) {
			return data
		}

		return data.sort((a, b) => {
			for (const definition of sorting) {
				const { selector, strategy } = definition
				const aValue = KeyPath.get(extractor(a), selector) ?? Infinity as any
				const bValue = KeyPath.get(extractor(b), selector) ?? Infinity as any

				if (aValue < bValue) {
					return strategy === DataGridSortingStrategy.Ascending ? -1 : 1
				} else if (aValue > bValue) {
					return strategy === DataGridSortingStrategy.Ascending ? 1 : -1
				}
				// If values are equal, continue to the next level of sorting
			}

			return 0 // Items are equal in all sorting criteria
		})
	}
}