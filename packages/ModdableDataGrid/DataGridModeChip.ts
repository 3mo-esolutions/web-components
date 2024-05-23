import { html, component, css, property, Component, style } from '@a11d/lit'
import { DialogAcknowledge, DialogAlert, DialogDeletion } from '@3mo/standard-dialogs'
import { tooltip } from '@3mo/tooltip'
import { Localizer } from '@3mo/localization'
import { DialogDataGridMode, type ModdableDataGrid, type Mode } from './index.js'

Localizer.register('de', {
	'Changing Filter': 'Filterwechsel',
	'Save changes': 'Änderungen speichern',
	'Discard changes': 'Änderungen verwerfen',
	'Archive': 'Archivieren',
	'Unarchive': 'Dearchivieren',
	'Edit': 'Bearbeiten',
	'Discard': 'Verwerfen',
	'More options': 'Weitere Optionen',
	'Do you want to delete the view "${name:string}"?': 'Soll die Ansicht "${name}" gelöscht werden?',
	'This process is irreversible.': 'Dieser Vorgang ist unwiderruflich.',
	'Don\'t Save': 'Nicht speichern',
	'Unsaved changes': 'Ungespeicherte Änderungen',
	'Do you want to save the new changes to "${name:string}" before switching views?': 'Sollen die neuen Änderungen vor dem Ansichtswechsel in "${name}" gespeichert werden?',
	'Do you want to discard changes of "${name:string}"?': 'Sollen die Änderungen vor "${name}" verworfen werden?'
})

/**
 * @element mo-data-grid-mode-chip
 *
 * @attr moddableDataGrid
 * @attr mode
 * @attr selected
 * @attr readOnly
 */
@component('mo-data-grid-mode-chip')
export class DataGridModeChip extends Component {
	@property({
		type: Object,
		updated(this: DataGridModeChip) {
			const handler = () => this.requestUpdate()
			this.moddableDataGrid.columnsChange.subscribe(handler)
			this.moddableDataGrid.sortingChange.subscribe(handler)
			this.moddableDataGrid.parametersChange.subscribe(handler)
			this.moddableDataGrid.paginationChange.subscribe(handler)
			this.moddableDataGrid.modeChange.subscribe(handler)
		}
	}) moddableDataGrid!: ModdableDataGrid<unknown>

	@property({ type: Object }) mode!: Mode<unknown, any>

	@property({ type: Boolean, reflect: true }) selected = false
	@property({ type: Boolean, reflect: true }) readOnly = false

	static override get styles() {
		return css`
			#chip {
				--_background-color-opacity: 85%;
				border-radius: 16px;
    		background-color: color-mix(in srgb, var(--mo-color-foreground), transparent var(--_background-color-opacity));
				color: color-mix(in srgb, var(--mo-color-foreground), transparent 20%);
				font-weight: 500;
				padding: 6px 12px;
				font-size: 14px;
				cursor: pointer;
				transition: background-color 0.1s;
			}

			:host([selected]) #chip {
				padding: 4px 12px;
				font-size: unset;
				background-color: var(--mo-color-accent);
				color: var(--mo-color-on-accent);
			}

			#chip:hover {
				--_background-color-opacity: 82%;
			}

			#chip:active {
				--_background-color-opacity: 80%;
			}

			mo-icon-button:first-of-type {
				margin-left: 2px;
			}
		`
	}

	protected override get template() {
		const isReadOnly = this.readOnly || !this.selected

		return html`
			<mo-flex id='chip' gap='2px' direction='horizontal' alignItems='center' @click=${this.handleClick}>
				${this.mode.isArchived ? `[${this.mode.name}]` : this.mode.name}

				${isReadOnly ? html.nothing
						: this.moddableDataGrid.modesRepository.isSelectedModeSaved
							? this.actionsTemplate
							: this.unsavedChangesTemplate}
			</mo-flex>
		`
	}

	private get actionsTemplate() {
		return html`
			<mo-icon-button dense icon='edit' tabIndex='-1'
				${tooltip(t('Edit'))}
				@click=${this.handleEdit}
			></mo-icon-button>

			${this.mode.isArchived === false ? html`
				<mo-icon-button dense icon='archive' tabIndex='-1'
					${tooltip(t('Archive'))}
					@click=${this.handleArchive}>
				</mo-icon-button>
			` : html`
				<mo-icon-button dense icon='unarchive' tabIndex='-1'
					${tooltip(t('Unarchive'))}
					@click=${this.handleUnarchive}>
				</mo-icon-button>
			`}

			<mo-icon-button dense icon='delete'
				${tooltip(t('Delete'))}
				@click=${this.handleDelete}
			></mo-icon-button>
		`
	}

	private get unsavedChangesTemplate() {
		return html`
			<span id='spanUnsaved'>*</span>

			<mo-icon-button dense icon='undo' tabIndex='-1' ${style({ marginInlineStart: '0 0 0 12px' })}
				${tooltip(t('Discard changes'))}
				@click=${this.handleDiscardChanges}
			></mo-icon-button>

			<mo-icon-button dense icon='save' tabIndex='-1'
				${tooltip(t('Save changes'))}
				@click=${this.handleSave}
			></mo-icon-button>
		`
	}

	private handleUnarchive = (e: MouseEvent) => {
		e.stopPropagation()
		this.moddableDataGrid.modesRepository.unarchive(this.mode)
	}

	private handleArchive = (e: MouseEvent) => {
		e.stopPropagation()
		this.moddableDataGrid.modesRepository.archive(this.mode)
	}

	protected handleClick = async () => {
		if (this.moddableDataGrid.modesRepository.isSelected(this.mode)) {
			this.moddableDataGrid.mode = undefined
			return
		}

		if (this.moddableDataGrid.modesRepository.isSelectedModeSaved === false) {
			const result = await new DialogAcknowledge({
				heading: t('Unsaved changes'),
				content: t('Do you want to save the new changes to "${name:string}" before switching views?'),
				primaryButtonText: t('Save'),
				secondaryButtonText: t('Don\'t Save'),
			}).confirm()

			if (result === true) {
				this.moddableDataGrid.modesRepository.save()
			}
		}

		this.moddableDataGrid.mode = this.mode
	}

	private readonly handleDiscardChanges = async (e: MouseEvent) => {
		e.stopPropagation()

		await new DialogAlert({
			heading: t('Discard changes'),
			content: t('Do you want to discard changes of "${name:string}"?', { name: this.mode.name }),
			primaryButtonText: t('Discard'),
		}).confirm()

		this.moddableDataGrid.modesRepository.save(this.mode)
	}

	private readonly handleSave = (e: MouseEvent) => {
		e.stopPropagation()
		this.moddableDataGrid.modesRepository.save()
	}

	private readonly handleEdit = async (e: MouseEvent) => {
		e.stopPropagation()
		await new DialogDataGridMode({
			moddableDataGrid: this.moddableDataGrid,
			mode: this.mode,
		}).confirm()
	}

	private readonly handleDelete = async (e: MouseEvent) => {
		e.stopPropagation()

		await new DialogDeletion({
			content: `${t('Do you want to delete the view "${name:string}"?', { name: this.mode.name })} ${t('This process is irreversible.')}`,
			deletionAction: () => this.moddableDataGrid.modesRepository.remove(this.mode)
		}).confirm()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-mode-chip': DataGridModeChip
	}
}