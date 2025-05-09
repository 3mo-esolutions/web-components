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
	}

	override hostUpdated() {
		if (!this._defaultMode && !!this.host.columns.length) {
			this._defaultMode = this.host.currentMode!.clone()
		}
	}

	private _initialized = false
	get initialized() { return this._initialized }

	override async hostConnected() {
		await this.fetch()
		this._initialized = true
		this.host.requestFetch()
	}

	private async fetch() {
		await this.fetchAll()
		await this.fetchSelected()
		this.host.requestUpdate()
	}

	private async fetchAll() {
		this._modes = await this.adapter.getAll(this.dataGridKey)
	}

	private async fetchSelected() {
		const selectedModeId = await this.adapter.getSelectedId(this.dataGridKey)
		await this.set(this._modes.find(m => m.id === selectedModeId))
	}

	async set(mode: ModdableDataGridMode<TData, TParameters> | undefined) {
		await this.adapter.setSelectedId(this.dataGridKey, mode?.id)
		this._selectedMode = mode
		this.host.modeChange.dispatch(mode)
		this.host.runPreventingFetch(() => (this.selectedMode ?? this.defaultMode)?.apply(this.host))
		this.host.requestFetch()
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