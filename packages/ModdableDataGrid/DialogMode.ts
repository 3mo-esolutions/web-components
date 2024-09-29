import { html, style, state, component, Binder } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'
import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { Localizer } from '@3mo/localization'
import { ModdableDataGridMode } from './ModdableDataGridMode.js'
import { type ModdableDataGrid } from './ModdableDataGrid.js'

Localizer.dictionaries.add({
	de: {
		'View "${name:string}"': 'Ansicht "${name}"',
		'${name:string} (Copy)': '${name} (Kopie)',
		'New view': 'Neue Ansicht',
		'Name': 'Bezeichnung',
		'Archive': 'Archivieren',
		'Save': 'Speichern',
		'Edit': 'Bearbeiten',
		'Delete': 'Löschen',
		'Please enter a valid name!': 'Bitte eine Bezeichnung eingeben!',
	}
})

type Parameters<T, P extends FetchableDataGridParametersType> = {
	readonly dataGrid: ModdableDataGrid<T, P>
	readonly mode?: ModdableDataGridMode<T, P>
	readonly isCopying?: boolean
	readonly isNew?: boolean
}

@component('mo-dialog-mode')
export class DialogMode<T, P extends FetchableDataGridParametersType> extends DialogComponent<Parameters<T, P>, ModdableDataGridMode<T, P> | void> {
	@state() mode = this.parameters.isCopying
		? new ModdableDataGridMode<T, P>({ ...this.parameters.mode, id: undefined, name: '' + t('${name:string} (Copy)', { name: this.parameters.mode!.name }) })
		: this.parameters.mode ?? new ModdableDataGridMode<T, P>()

	private readonly binder = new Binder<ModdableDataGridMode<T, P>>(this, 'mode')

	private get dataGrid() {
		return this.parameters.dataGrid
	}

	private get heading() {
		return this.parameters.mode && !this.parameters.isNew
			? t('View "${name:string}"', { name: this.mode.name })
			: t('New view')
	}

	protected override get template() {
		const { bind } = this.binder

		return html`
			<mo-dialog heading=${this.heading} primaryOnEnter primaryButtonText=${t('Save')}>
				<mo-field-text autofocus required label=${t('Name')}
					${bind({ keyPath: 'name', event: 'input' })}
				></mo-field-text>

				${!this.parameters.mode?.id || this.parameters.isNew || this.parameters.isCopying ? html.nothing : html`
					<mo-flex slot='footer'>
						<mo-checkbox label=${t('Archive')} ${bind('archived')} ${style({ marginInlineStart: '8px' })}></mo-checkbox>
					</mo-flex>

					<mo-button type='raised' slot='secondaryAction' ${style({ '--mo-button-accent-color': 'var(--mo-color-red)' })}>
						${t('Delete')}
					</mo-button>
				`}
			</mo-dialog>
		`
	}

	protected override primaryAction() {
		if (!this.mode.name) {
			throw new Error(t('Please enter a valid name!'))
		}
		this.mode = new ModdableDataGridMode({ ...this.dataGrid.currentMode, ...this.mode })
		this.dataGrid.repository.save(this.mode)
		return this.mode
	}

	protected override secondaryAction() {
		this.parameters.dataGrid.deleteMode(this.mode)
	}
}