import { html, component, css, property, Component, style } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import { DialogAcknowledge, DialogAlert, DialogDeletion } from '@3mo/standard-dialogs'
import { Localizer } from '@3mo/localization'
import { DialogDataGridMode, type ModdableDataGrid, type Mode } from './index.js'
import { objectEquals } from './ObjectExtensions.js'

Localizer.register('de', {
	'Changing Filter': 'Filterwechsel',
	'Save changes': 'Änderungen speichern',
	'Copy': 'Kopieren',
	'Save as a new view': 'Als neue Ansicht speichern',
	'Discard changes': 'Änderungen verwerfen',
	'Archive': 'Archivieren',
	'Unarchive': 'Dearchivieren',
	'Edit': 'Bearbeiten',
	'Discard': 'Verwerfen',
	'More options': 'Weitere Optionen',
	'Do you want to delete the view?': 'Soll dieser Ansicht gelöscht werden?',
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
			:host {
				white-space: nowrap;
			}

			mo-popover {
				background-color: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-gray) 8%);
				color: black;
			}

			#chip {
				display: flex;
				align-items: center;
				height: 30px;
				box-sizing: border-box;
				padding: 8px 12px;
				border-radius: 16px;
				background-color: color-mix(in srgb, var(--mo-color-foreground), transparent 85%);
				cursor: grab;
				font-size: 12px;
			}

			:host([selected]) {
				#chip {
					background-color: var(--mo-color-accent);

					span {
						color: var(--mo-color-on-accent);
						font-weight: 500;
					}
				}
			}

			:host(:hover:not([selected])) #chip {
				background-color: color-mix(
					in srgb,
					color-mix(in srgb, var(--mo-color-foreground), transparent 85%),
					color-mix(in srgb, var(--mo-color-accent), transparent 75%)
				);
			}

			#changed {
				margin-right: 5px;
			}

			mo-icon-button {
				display: flex;
				align-items: center;
				color: var(--mo-color-on-accent);
				font-size: 18px;
			}

			:host([selected]:not([readOnly])) mo-icon-button:not([data-no-border])::before {
				content: '';
				border-inline-start: 1px solid rgba(255, 255, 255, 0.4);
				height: 70%;
				margin: 0 2px;
			}
		`
	}

	protected async handleClick(e: MouseEvent) {
		if ((e.target as HTMLElement).id !== 'chip' && (e.target as HTMLElement).tagName.toLowerCase() !== 'span') {
			return
		}

		if (this.moddableDataGrid.modesRepository.isSelected(this.mode)) {
			this.moddableDataGrid.mode = undefined
		} else {
			if (this.moddableDataGrid.modesRepository.isSelectedModeSaved === false) {
				const result = await new DialogAcknowledge({
					heading: t('Unsaved changes'),
					content: t('Do you want to save the new changes to "${name:string}" before switching views?', { name: this.mode.name }),
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

	protected override get template() {
		return html`
			<div id='chip' @click=${this.handleClick}>
				<span>
					${this.mode.isArchived ? `[${this.mode.name}]` : this.mode.name}
				</span>
				${this.trailingSlotTemplate}
			</div>
		`
	}

	private get contextMenuTemplate() {
		return html`
			<mo-popover-container fixed>
				<mo-icon-button icon='more_vert' dense
					?data-no-border=${this.moddableDataGrid.modesRepository.isSelectedModeSaved}
					${tooltip(t('More options'))}
				></mo-icon-button>
				<mo-popover slot='popover'>
					${this.moddableDataGrid.modesRepository.isSelectedModeSaved ? html.nothing : html`
						<mo-context-menu-item icon='undo' @click=${this.discardChanges}>${t('Discard changes')}</mo-context-menu-item>
						<mo-context-menu-item icon='done' @click=${this.saveChanges}>${t('Save changes')}</mo-context-menu-item>
						<mo-context-menu-item icon='check_circle' @click=${this.saveAsNew}>${t('Save as a new view')}</mo-context-menu-item>
						<mo-line role='separator'></mo-line>
					`}
					<mo-context-menu-item icon='edit' @click=${this.editMode}>${t('Edit')}</mo-context-menu-item>
					<mo-context-menu-item icon='content_copy' @click=${this.copyMode}>${t('Copy')}</mo-context-menu-item>
					<mo-context-menu-item
						icon=${this.mode?.isArchived ? 'unarchive' : 'archive'}
						@click=${() => this.mode.isArchived
							? this.moddableDataGrid.modesRepository.unarchive(this.mode)
							: this.moddableDataGrid.modesRepository.archive(this.mode)}
					>
						${t(this.moddableDataGrid.mode?.isArchived ? 'Unarchive' : 'Archive')}
					</mo-context-menu-item>
					<mo-line role='separator'></mo-line>
					<mo-context-menu-item icon='delete' @click=${this.deleteMode}>${t('Delete')}</mo-context-menu-item>
				</mo-popover>
			</mo-popover-container>
		`
	}

	protected get trailingSlotTemplate() {
		return this.readOnly || !this.selected ? html.nothing : html`
			<mo-flex direction='horizontal' slot='trailing' ${style({ margin: '0 -4px 0 4px' })}>
				${this.moddableDataGrid.modesRepository.isSelectedModeSaved
					? this.contextMenuTemplate
					: html`
						<span id='changed'>*</span>
						<mo-icon-button dense icon='undo' ${tooltip(t('Discard changes'))} @click=${this.discardChanges}></mo-icon-button>
						<mo-icon-button dense icon='done' ${tooltip(t('Save changes'))} @click=${this.saveChanges}></mo-icon-button>
						${this.contextMenuTemplate}
					`}
			</mo-flex>
		`
	}

	private readonly discardChanges = async () => {
		await new DialogAlert({
			heading: t('Discard changes'),
			content: t('Do you want to discard changes of "${name:string}"?', { name: this.mode.name }),
			primaryButtonText: t('Discard'),
		}).confirm()
		this.moddableDataGrid.modesRepository.save(this.mode)
	}

	private readonly saveChanges = () => {
		this.moddableDataGrid.modesRepository.save()
	}

	private readonly saveAsNew = async () => {
		const mode = await new DialogDataGridMode({ moddableDataGrid: this.moddableDataGrid, originMode: this.mode }).confirm()
		this.moddableDataGrid.modesRepository.save(this.mode)
		if (mode) {
			this.moddableDataGrid.mode = this.moddableDataGrid.modesRepository.value.find(m => objectEquals({ ...m, id: undefined }, mode))
		}
	}

	private readonly copyMode = async () => {
		const mode = await new DialogDataGridMode({ moddableDataGrid: this.moddableDataGrid, originMode: this.mode, copying: true }).confirm()
		this.moddableDataGrid.modesRepository.save(this.mode)
		if (mode) {
			this.moddableDataGrid.mode = this.moddableDataGrid.modesRepository.value.find(m => objectEquals({ ...m, id: undefined }, mode))
		}
	}

	private readonly editMode = async () => {
		await new DialogDataGridMode({ moddableDataGrid: this.moddableDataGrid, mode: this.mode }).confirm()
	}

	private readonly deleteMode = async () => {
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