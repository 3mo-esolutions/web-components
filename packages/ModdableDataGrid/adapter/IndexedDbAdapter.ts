import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { ModdableDataGridMode } from '../ModdableDataGridMode.js'
import type { DataGridKey, ModdableDataGridModesAdapter, ModeId } from './ModdableDataGridModesAdapter.js'
import localForage from 'localforage'

export class IndexedDbAdapter<T, P extends FetchableDataGridParametersType> implements ModdableDataGridModesAdapter<T, P> {
	static {
		localForage.setDriver([localForage.INDEXEDDB, localForage.LOCALSTORAGE])
	}

	private modesKey(dataGridKey: DataGridKey) {
		return `${dataGridKey}.Modes`
	}

	async getAll(dataGridKey: DataGridKey) {
		const modes = await localForage.getItem<Array<ModdableDataGridMode<T, P>>>(this.modesKey(dataGridKey)) ?? []
		return modes.map(m => ModdableDataGridMode.fromObject<T, P>(m))
	}

	async get(dataGridKey: DataGridKey, modeId: ModeId) {
		const all = await this.getAll(dataGridKey)
		return all.find(m => m.id === modeId)
	}

	async save(dataGridKey: DataGridKey, mode: ModdableDataGridMode<T, P>) {
		const all = await this.getAll(dataGridKey)
		const existing = all.find(m => m.id === mode.id)
		if (existing) {
			all.splice(all.indexOf(existing), 1, mode)
		} else {
			all.unshift(mode)
		}
		await localForage.setItem(this.modesKey(dataGridKey), all)
		return mode
	}

	async delete(dataGridKey: DataGridKey, mode: ModdableDataGridMode<T, P>) {
		const all = await this.getAll(dataGridKey)
		await localForage.setItem(this.modesKey(dataGridKey), all.filter(m => m.id !== mode.id))
	}

	async getSelectedId(dataGridKey: DataGridKey) {
		return await localForage.getItem<ModeId>(`${dataGridKey}.Mode`) ?? undefined
	}

	async setSelectedId(dataGridKey: DataGridKey, modeId: ModeId) {
		await localForage.setItem(`${dataGridKey}.Mode`, modeId)
	}
}