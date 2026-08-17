import { Controller } from '@a11d/lit'
import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { DialogDeletion } from '@3mo/standard-dialogs'
import { Localizer } from '@3mo/localization'
import { type ModdableDataGrid, type ModdableDataGridMode } from './index.js'

Localizer.dictionaries.add({
	de: {
		'view "${name:string}"': 'Ansicht "${name}"',
	}
})

export class DataGridModesController<TData, TParameters extends FetchableDataGridParametersType> extends Controller {
	readonly dataGridKey = `ModdableDataGrid.${this.host.tagName.toLowerCase()}`

	private _defaultMode?: ModdableDataGridMode<TData, TParameters>
	get defaultMode() { return this._defaultMode }

	private _selectedMode?: ModdableDataGridMode<TData, TParameters>
	get selectedMode() { return this._selectedMode }

	private _modes = new Array<ModdableDataGridMode<TData, TParameters>>()
	get modes() { return this._modes }

	get archivedModes() {
		return this.modes.filter(m => m.archived)
	}

	get visibleModes() {
		return this.modes.filter(m => !m.archived || m.id === this.selectedMode?.id)
	}

	private get adapter() {
		return this.host.modesAdapter
	}

	constructor(override readonly host: ModdableDataGrid<TData, TParameters, any>) {
		super(host)
		this.host.fetcherController.disabled = true
	}

	override hostUpdated() {
		if (!this._defaultMode && !!this.host.columns.length) {
			this._defaultMode = this.host.currentMode!.clone()
		}
	}

	override async hostConnected() {
		await this.fetch()
		this.host.fetcherController.disabled = false
		this.host.requestFetch()
	}

	private async fetch() {
		await this.fetchAll()
		await this.fetchSelected()
		this.host.requestUpdate()
	}

	private async fetchAll() {
		const modes = await this.adapter.getAll(this.dataGridKey)
		// Presented by the modes' own indices. The unindexed — created before any reorder, or stored
		// by an older version — keep the adapter's order at the start, where a new mode is expected.
		this._modes = [...modes].sort((a, b) => (a.index ?? -1) - (b.index ?? -1))
	}

	private async fetchSelected() {
		const selectedModeId = await this.adapter.getSelectedId(this.dataGridKey)
		await this.set(this._modes.find(m => m.id === selectedModeId))
	}

	async set(mode: ModdableDataGridMode<TData, TParameters> | undefined) {
		await this.adapter.setSelectedId(this.dataGridKey, mode?.id)
		this._selectedMode = mode
		this.host.modeChange.dispatch(mode);
		(this.selectedMode ?? this.defaultMode)?.apply(this.host)
	}

	/**
	 * Moves a mode to the given index within {@link modes}, then persists the new order by saving
	 * every mode whose {@link ModdableDataGridMode.index} it changed — the order is data on the
	 * modes themselves, so no adapter has to know reordering exists. The modes move at once rather
	 * than once the adapter acknowledges, so a dropped view settles in the frame it is released in.
	 */
	async move(mode: ModdableDataGridMode<TData, TParameters>, index: number) {
		const modes = [...this._modes]
		const from = modes.findIndex(m => m.id === mode.id)
		if (from === -1 || from === index) {
			return
		}
		modes.splice(index, 0, ...modes.splice(from, 1))
		const changed = modes.filter((mode, index) => mode.index !== index)
		modes.forEach((mode, index) => mode.index = index)
		this._modes = modes
		this.host.requestUpdate()
		// One at a time: a read-modify-write adapter — IndexedDb being one — loses writes to itself
		// when the changed modes race each other.
		for (const mode of changed) {
			await this.adapter.save(this.dataGridKey, mode)
		}
	}

	async save(mode: ModdableDataGridMode<TData, TParameters>) {
		await this.adapter.save(this.dataGridKey, mode)
		await this.fetch()
	}

	async delete(mode: ModdableDataGridMode<TData, TParameters>) {
		await new DialogDeletion({
			label: t('view "${name:string}"', { name: mode.name }),
			deletionAction: async () => {
				if (this.selectedMode?.id === mode.id) {
					this.set(undefined)
				}
				await this.adapter.delete(this.dataGridKey, mode)
				await this.fetch()
			},
		}).confirm()
	}
}