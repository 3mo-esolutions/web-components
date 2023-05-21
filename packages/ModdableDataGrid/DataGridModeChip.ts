import { html, component, css, property, eventListener, Component, nothing, style, state } from '@a11d/lit'
import { DialogAcknowledge, DialogAlert, DialogDeletion } from '@3mo/standard-dialogs'
import { tooltip } from '@3mo/tooltip'
import { Localizer, LanguageCode } from '@3mo/localization'
import { DialogDataGridMode, ModdableDataGrid, Mode } from './index.js'

Localizer.register(LanguageCode.German, {
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

	@state() private open = false

	static override get styles() {
		return css`
			:host {
				white-space: nowrap;
			}

			:host(:hover) {
				--mo-chip-background-color: var(--mo-color-accent-transparent);
			}

			:host([selected]) {
				--mo-chip-background-color: var(--mo-color-accent);
				--mo-chip-foreground-color: var(--mo-color-on-accent);
			}

			mo-chip::part(ripple) {
				display: none;
			}

			mo-icon-button {
				color: var(--mo-color-on-accent);
				--mdc-icon-size: 18px;
			}

			:host([selected]:not([readOnly])) mo-icon-button:not([data-no-border]) {
				border-inline-start: 1px solid var(--mo-color-gray-transparent);
			}
		`
	}

	@eventListener('click')
	protected async handleClick() {
		if (this.moddableDataGrid.modesRepository.isSelected(this.mode)) {
			this.moddableDataGrid.mode = undefined
		} else {
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
	}

	@eventListener('contextmenu')
	protected handleRightClick(e: MouseEvent) {
		e.preventDefault()
		this.editMode(e)
	}

	protected override get template() {
		return html`
			<mo-chip>
				${this.mode.isArchived ? `[${this.mode.name}]` : this.mode.name}
				${this.trailingSlotTemplate}
			</mo-chip>
		`
	}

	protected get trailingSlotTemplate() {
		return this.readOnly || !this.selected ? nothing : html`
			<mo-flex direction='horizontal' slot='trailing'>
				${this.moddableDataGrid.modesRepository.isSelectedModeSaved ? nothing : html`
					<span id='spanUnsaved'>*</span>

					<mo-icon-button icon='undo' tabindex='-1' dense ${style({ marginInlineStart: '0 0 0 12px' })}
						${tooltip(t('Discard changes'))}
						@click=${this.discardChanges}
					></mo-icon-button>

					<mo-icon-button icon='save' tabindex='-1' dense
						${tooltip(t('Save changes'))}
						@click=${this.saveChanges}
					></mo-icon-button>
				`}

				<mo-icon-button ?data-no-border=${this.moddableDataGrid.modesRepository.isSelectedModeSaved} icon='more_vert' tabindex='-1' dense
					${tooltip(t('More options'))}
					@click=${() => this.open = true}
				></mo-icon-button>

				${this.menuTemplate}
			</mo-flex>
		`
	}

	protected get menuTemplate() {
		return html`
			<mo-menu .anchor=${this}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.open = e.detail}
			>
				${this.moddableDataGrid.modesRepository.isSelectedModeSaved ? nothing : html`
					<mo-menu-item icon='undo' @click=${this.discardChanges}>${t('Discard changes')}</mo-menu-item>
					<mo-menu-item icon='save' @click=${this.saveChanges}>${t('Save changes')}</mo-menu-item>
					<mo-line ${style({ margin: '4px 0' })}></mo-line>
				`}
				<mo-menu-item icon='edit' @click=${this.editMode}>${t('Edit')}</mo-menu-item>
				${this.mode.isArchived === false ? html`
					<mo-menu-item icon='archive'
						@click=${() => this.moddableDataGrid.modesRepository.archive(this.mode)}
					>${t('Archive')}</mo-menu-item>
				` : html`
					<mo-menu-item icon='unarchive'
						@click=${() => this.moddableDataGrid.modesRepository.unarchive(this.mode)}
					>${t('Unarchive')}</mo-menu-item>
				`}
				<mo-menu-item icon='delete' @click=${this.deleteMode}>${t('Delete')}</mo-menu-item>
			</mo-menu>
		`
	}

	private readonly discardChanges = async (e: MouseEvent) => {
		e.stopImmediatePropagation()
		await new DialogAlert({
			heading: t('Discard changes'),
			content: t('Do you want to discard changes of "${name:string}"?', { name: this.mode.name }),
			primaryButtonText: t('Discard'),
		}).confirm()
		this.moddableDataGrid.modesRepository.save(this.mode)
	}

	private readonly saveChanges = (e: MouseEvent) => {
		e.stopImmediatePropagation()
		this.moddableDataGrid.modesRepository.save()
	}

	private readonly editMode = async (e: MouseEvent) => {
		e.stopImmediatePropagation()
		await new DialogDataGridMode({ moddableDataGrid: this.moddableDataGrid, mode: this.mode }).confirm()
	}

	private readonly deleteMode = async (e: MouseEvent) => {
		e.stopImmediatePropagation()
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