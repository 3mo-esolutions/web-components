import type { FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import type { DataGridKey, ModdableDataGridMode, ModdableDataGridModesAdapter, ModeId } from '@3mo/moddable-data-grid'

/** Keeps the views of a grid in memory instead of IndexedDB, so they are gone after a reload. */
export class InMemoryModesAdapter<TData, TParameters extends FetchableDataGridParametersType> implements ModdableDataGridModesAdapter<TData, TParameters> {
	private selectedId?: ModeId

	constructor(private modes = new Array<ModdableDataGridMode<TData, TParameters>>()) { }

	getAll = () => Promise.resolve(this.modes)

	get = (_: DataGridKey, modeId: ModeId) => Promise.resolve(this.modes.find(mode => mode.id === modeId))

	save = (_: DataGridKey, mode: ModdableDataGridMode<TData, TParameters>) => {
		this.modes = this.modes.some(m => m.id === mode.id)
			? this.modes.map(m => m.id === mode.id ? mode : m)
			: [mode, ...this.modes]
		return Promise.resolve(mode)
	}

	delete = (_: DataGridKey, mode: ModdableDataGridMode<TData, TParameters>) => {
		this.modes = this.modes.filter(m => m.id !== mode.id)
		return Promise.resolve()
	}

	getSelectedId = () => Promise.resolve(this.selectedId)

	setSelectedId = (_: DataGridKey, modeId: ModeId | undefined) => {
		this.selectedId = modeId
		return Promise.resolve()
	}
}