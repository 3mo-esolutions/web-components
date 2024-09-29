import { html, style, state, component, Binder } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'
import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { Localizer } from '@3mo/localization'
import { ModdableDataGridMode } from './ModdableDataGridMode.js'
import { type ModdableDataGrid } from './ModdableDataGrid.js'

Localizer.dictionaries.add({
	de: {
		'View "${name:string}"': 'Ansicht "${name}"',
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
}

@component('mo-dialog-mode')
export class DialogMode<T, P extends FetchableDataGridParametersType> extends DialogComponent<Parameters<T, P>, ModdableDataGridMode<T, P> | undefined> {
	@state() mode = this.parameters.mode ?? new ModdableDataGridMode<T, P>()

	private readonly binder = new Binder<ModdableDataGridMode<T, P>>(this, 'mode')

	private get dataGrid() {
		return this.parameters.dataGrid
	}

	private get heading() {
		return this.parameters.mode?.name
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

				${!this.parameters.mode?.id ? html.nothing : html`
					<mo-checkbox slot='footer' label=${t('Archive')} ${bind('archived')} ${style({ marginInlineStart: '8px' })}></mo-checkbox>

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
		this.mode = this.dataGrid.currentMode.with(this.mode)
		this.dataGrid.modesAdapter.save(this.mode)
		return this.mode
	}

	protected override secondaryAction() {
		this.parameters.dataGrid.deleteMode(this.mode)
		return undefined
	}
}