import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { type ModdableDataGridMode } from './ModdableDataGridMode.js'

export type DataGridKey = string
export type ModeId = string

export interface ModdableDataGridModesAdapter<TData, TParameters extends FetchableDataGridParametersType> {
	getAll(dataGridKey: DataGridKey): Promise<Array<ModdableDataGridMode<TData, TParameters>>>
	get(dataGridKey: DataGridKey, modeId: ModeId): Promise<ModdableDataGridMode<TData, TParameters> | undefined>
	save(dataGridKey: DataGridKey, mode: ModdableDataGridMode<TData, TParameters>): Promise<ModdableDataGridMode<TData, TParameters>>
	delete(dataGridKey: DataGridKey, mode: ModdableDataGridMode<TData, TParameters>): Promise<void>
	getSelectedId(dataGridKey: DataGridKey): Promise<ModeId | undefined>
	setSelectedId(dataGridKey: DataGridKey, modeId: ModeId | undefined): Promise<void>
}