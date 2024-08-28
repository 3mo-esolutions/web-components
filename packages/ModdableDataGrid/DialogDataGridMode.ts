import { html, component, state, style } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'
import { Localizer } from '@3mo/localization'
import { DialogDeletion } from '@3mo/standard-dialogs'
import { type ModdableDataGrid, Mode } from './index.js'

Localizer.dictionaries.add('de', {
	'Mode ${name:string}': 'Ansicht "${name}"',
	'New Mode': 'Neue Ansicht',
	'Name': 'Bezeichnung',
	'Archived': 'Archiviert',
	'Save': 'Speichern',
	'Edit': 'Bearbeiten',
	'Delete': 'Löschen',
})

Localizer.dictionaries.add('fa', {
	'Mode ${name:string}': 'نمایش "${name}"',
	'New Mode': 'نمایش جدید',
	'Name': 'نام',
	'Archived': 'بایگانی شده',
	'Save': 'ذخیره',
	'Edit': 'ویرایش',
	'Delete': 'حذف',
})

@component('mo-dialog-data-grid-mode')
export class DialogDataGridMode extends DialogComponent<{ readonly moddableDataGrid: ModdableDataGrid<unknown>, readonly mode?: Mode<unknown, any> }> {
	@state() private mode = this.parameters.mode ?? new Mode<unknown, any>()

	override confirm(...parameters: Parameters<DialogDeletion['confirm']>) {
		return this.parameters.mode && this.parameters.moddableDataGrid.modes.includes(this.parameters.mode)
			? Promise.reject('Pre-defined modes cannot be edited.')
			: super.confirm(...parameters)
	}

	private get heading() {
		return this.parameters.mode
			? t('View ${name:string}"', { name: this.parameters.mode.name })
			: t('New Mode')
	}

	protected override get template() {
		return html`
			<mo-dialog
				heading=${this.heading}
				primaryOnEnter
				primaryButtonText=${t('Save')}
				secondaryButtonText=${this.parameters.mode ? t('Delete') : ''}
			>
				<mo-field-text selectOnFocus autofocus
					label=${t('Name')}
					value=${this.mode.name}
					@input=${(e: CustomEvent<string>) => this.mode.name = e.detail.trim()}
				></mo-field-text>

				<mo-flex slot='footer'>
					<mo-checkbox ${style({ flex: '1' })}
						label=${t('Archived')}
						?selected=${this.mode.isArchived}
						@change=${(e: CustomEvent<boolean>) => this.mode.isArchived = e.detail}
					></mo-checkbox>
				</mo-flex>
			</mo-dialog>
		`
	}

	protected override primaryAction = () => {
		const currentMode = this.parameters.moddableDataGrid.modesRepository.currentMode
		this.mode.columns = currentMode.columns
		this.mode.pagination = currentMode.pagination
		this.mode.parameters = currentMode.parameters
		this.mode.sorting = currentMode.sorting
		this.parameters.moddableDataGrid.modesRepository.save(this.mode)
	}

	protected override secondaryAction = async () => {
		const mode = this.parameters.mode

		if (!mode) {
			return
		}

		await new DialogDeletion({
			content: t('Do you want to delete the view ${name:string}?', { name: mode.name }),
			deletionAction: () => this.parameters.moddableDataGrid.modesRepository.remove(mode)
		}).confirm()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-dialog-data-grid-mode': DialogDataGridMode
	}
}