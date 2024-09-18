import { html } from '@a11d/lit'
import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { type DataGridColumn } from '@3mo/data-grid'
import { DialogDeletion } from '@3mo/standard-dialogs'
import { Localizer } from '@3mo/localization'
import { LocalForageController } from './LocalForageController.js'
import { Mode } from './Mode.js'
import { type ModdableDataGrid } from './ModdableDataGrid.js'

Localizer.dictionaries.add({
	de: {
		'Do you want to delete the view <b>${name:string}</b>? This process is irreversible.': 'Soll die Ansicht <b>${name}</b> gelöscht werden? Dieser Vorgang ist unwiderruflich.',
	}
})

export const getPlainColumn = <T>(c: DataGridColumn<T>) => (<DataGridColumn<T>>{
	dataSelector: c.dataSelector,
	width: c.width,
	hidden: c.hidden,
	sticky: c.sticky,
})

export class RepositoryController<T, P extends FetchableDataGridParametersType> extends LocalForageController<Array<Mode<T, P>>> {
	private _defaultMode?: Required<Mode<T, P>>

	get defaultMode() {
		return this._defaultMode!.clone()
	}

	updateDefaultIfNeeded = () => {
		if (!this._defaultMode) {
			this._defaultMode = this.host.currentMode!.clone() as Required<Mode<T, P>>
		}
	}

	constructor(
		override readonly host: ModdableDataGrid<any, any>
	) {
		super(host, `ModdableDataGrid.${host.tagName.toLowerCase()}.Modes`, [], (modes: any) => {
			return modes.map((mode: any) => {
				if (mode.parameters) {
					Object.keys(mode.parameters)
						.forEach(parameterName =>
							mode.parameters[parameterName] = this.revive(mode.parameters![parameterName]))
				}
				return mode
			})
		})
	}

	revive = (value: any) => {
		if (value && DateTime.isoRegularExpression.test(value)) {
			return new Date(value)
		}
		if (value && typeof value === 'object' && ('start' in value || 'end' in value)) {
			return new DateTimeRange(value.start, value.end)
		}
		return value
	}

	override get value() {
		return (super.value ?? []).map(mode => new Mode<T, P>(mode))
	}

	override set value(value) {
		// console.log('setting value', value[0]!.columns)
		// console.log('expected to be after json', value[0]!.toJSON().columns)
		super.value = value.map(mode => mode.toJSON()) as Array<Mode<T, P>>
		this.host.requestUpdate()
	}

	find = (id?: string) => {
		return this.value.find(mode => mode.id === id)
	}

	save = (mode: Mode<T, P>) => {
		const existingMode = !mode.id ? undefined : this.find(mode.id)

		if (existingMode) {
			this.value = this.value.map(m => m.id !== mode.id ? m : mode)
		} else {
			this.value = [mode, ...this.value]
		}

		if (this.host.mode?.id === mode.id || !existingMode) {
			this.host.mode = mode
		}
	}

	async delete(mode: Mode<T, P>) {
		await new DialogDeletion({
			content: html`
				<span
					.innerHTML=${t('Do you want to delete the view <b>${name:string}</b>? This process is irreversible.', {
						name: mode.name,
					})}
				></span>
			`,
			deletionAction: () => {
				if (this.host.mode?.id === mode.id) {
					this.host.mode = undefined
				}
				this.value = this.value.filter(m => m.id !== mode.id)
			},
		}).confirm()
	}

	getArchived = () => {
		return this.value.filter(mode => mode.archived)
	}

	getVisible = (currentModeId?: string) => {
		return this.value.filter(mode => !mode.archived || currentModeId === mode.id)
	}
}