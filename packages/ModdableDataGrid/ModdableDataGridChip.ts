import { css, html, style, Component, component, property, query } from '@a11d/lit'
import { NotificationComponent } from '@a11d/lit-application'
import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { tooltip } from '@3mo/tooltip'
import { DialogAlert, DialogAcknowledge } from '@3mo/standard-dialogs'
import { equals } from '@a11d/equals'
import { Localizer } from '@3mo/localization'
import { type Menu } from '@3mo/menu'
import { Mode } from './Mode.js'
import { DialogMode } from './DialogMode.js'
import { type ModdableDataGrid } from './ModdableDataGrid.js'

Localizer.dictionaries.add({
	de: {
		'Save changes': 'Änderungen speichern',
		'Copy': 'Kopieren',
		'Move to archive': 'Ins Archiv verschieben',
		'Save as a new view': 'Als neue Ansicht speichern',
		'Discard changes (Änderungen verwerfen)': 'Änderungen verwerfen',
		'Discard changes (Änderungen)': 'Änderungen',
		'Archive': 'Archivieren',
		'Unarchive': 'Dearchivieren',
		'Edit': 'Bearbeiten',
		'Discard': 'Verwerfen',
		'More options': 'Weitere Optionen',
		'Unsaved changes': 'Änderungen',
		'Do you want to save the new changes for <b>${name:string}</b> before switching view?': 'Sollen die Änderungen in der Ansicht <b>${name}</b> vor dem Fortfahren gespeichert werden?',
		'Do you want to discard changes of <b>${name:string}</b>?': 'Sollen die Änderungen in der Ansicht <b>${name}</b> verworfen werden?',
		'View "${name:string}" is archived!': 'Ansicht "${name}" erfolgreich ins Archiv verschoben!',
	},
	en: {
		'Discard changes (Änderungen verwerfen)': 'Discard changes',
		'Discard changes (Änderungen)': 'Discard changes',
	},
})

@component('mo-moddable-data-grid-chip')
export class ModdableDataGridChip<T, P extends FetchableDataGridParametersType> extends Component {
	@property({
		type: Object,
		updated(this: ModdableDataGridChip<T, P>) {
			const onChange = () => {
				this.requestUpdate()
			}

			this.dataGrid.columnsChange.subscribe(onChange)
			this.dataGrid.sortingChange.subscribe(onChange)
			this.dataGrid.parametersChange.subscribe(onChange)
			this.dataGrid.paginationChange.subscribe(onChange)
		}
	}) dataGrid!: ModdableDataGrid<T, P>

	@property({
		type: Object,
		updated(this: ModdableDataGridChip<T, P>, mode?: Mode<T, P>) {
			this.toggleAttribute('data-archived', mode?.archived)
		}
	}) mode!: Mode<T, P>

	@property({ type: Boolean, reflect: true }) selected = false
	@property({ type: Boolean, reflect: true }) readOnly = false

	@query('mo-menu') readonly menuNode!: Menu

	static override get styles() {
		return css`
			#container {
				display: flex;
				align-items: center;
				height: 30px;
				padding: 8px 12px;
				box-sizing: border-box;
				border-radius: 16px;
				background-color: color-mix(in srgb, var(--mo-color-foreground), transparent 85%);
				cursor: grab;
				font-size: 12px;
			}

			:host([selected]) {
				#container {
					background-color: var(--mo-color-accent);

					#title, #changed {
						color: var(--mo-color-on-accent);
						font-weight: 500;
					}
				}
			}

			:host(:hover:not([selected])) #container {
				background-color: color-mix(
					in srgb,
					color-mix(in srgb, var(--mo-color-foreground), transparent 85%),
					color-mix(in srgb, var(--mo-color-accent), transparent 75%)
				);
			}

			:host([selected][data-archived]) #container {
				background-color: color-mix(
					in srgb,
					color-mix(in srgb, var(--mo-color-foreground), transparent 45%),
					color-mix(in srgb, var(--mo-color-accent), transparent 25%)
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

	private get hasUnsavedChanges() {
		return !this.dataGrid.currentMode[equals](this.mode)
	}

	protected override get template() {
		return html`
			<div id='container' @click=${this.onClick}>
				<span id='title'>
					${this.mode.archived ? `[${this.mode.name}]` : this.mode.name}
				</span>

				${this.readOnly || !this.selected ? html.nothing : html`
					<mo-flex direction='horizontal' slot='trailing' ${style({ margin: '0 -4px 0 4px' })}>
						${!this.hasUnsavedChanges
							? this.contextMenuTemplate
							: html`
								<span id='changed'>*</span>
								<mo-icon-button dense icon='undo' ${tooltip(t('Discard changes (Änderungen verwerfen)'))} @click=${this.discard}></mo-icon-button>
								<mo-icon-button dense icon='done' ${tooltip(t('Save changes'))} @click=${this.saveChanges}></mo-icon-button>
								${this.contextMenuTemplate}
							`}
					</mo-flex>
				`}
			</div>
		`
	}

	private get contextMenuTemplate() {
		return html`
			<mo-popover-container fixed>
				<mo-icon-button icon='more_vert' dense
					?data-no-border=${!this.hasUnsavedChanges}
					${tooltip(t('More options'))}
				></mo-icon-button>

				<mo-menu slot='popover'>
					${!this.hasUnsavedChanges ? html.nothing : html`
						<mo-context-menu-item icon='undo' @click=${() => this.discard()}>
							${t('Discard changes (Änderungen verwerfen)')}
						</mo-context-menu-item>
						<mo-context-menu-item icon='done' @click=${() => this.saveChanges()}>
							${t('Save changes')}
						</mo-context-menu-item>
						<mo-context-menu-item icon='check_circle' data-qa-id='saveAsNew' @click=${() => this.saveAsNew()}>
							${t('Save as a new view')}
						</mo-context-menu-item>
						<mo-line role='separator'></mo-line>
					`}

					<mo-context-menu-item icon='edit' data-qa-id='edit' @click=${() => this.edit()}>${t('Edit')}</mo-context-menu-item>
					<mo-context-menu-item icon='content_copy' data-qa-id='copy' @click=${() => this.copy()}>${t('Copy')}</mo-context-menu-item>

					${this.mode.archived ? html.nothing : html`
						<mo-context-menu-item data-qa-id='archive' icon='archive' @click=${() => this.archive()}>
							${t('Move to archive')}
						</mo-context-menu-item>
					`}

					<mo-line role='separator'></mo-line>

					<mo-context-menu-item icon='delete' data-qa-id='delete' @click=${() => this.delete()}>
						${t('Delete')}
					</mo-context-menu-item>
				</mo-menu>
			</mo-popover-container>
		`
	}

	private discard = async () => {
		await new DialogAlert({
			heading: t('Discard changes (Änderungen)'),
			content: html`
				<span
					.innerHTML=${t('Do you want to discard changes of <b>${name:string}</b>?', { name: this.mode.name })}
				></span>
			`,
			primaryButtonText: t('Discard'),
		}).confirm()

		this.dataGrid.repository.save(this.mode)
	}

	private edit = async () => {
		const changes = this.dataGrid.currentMode
		await new DialogMode<T, P>({ dataGrid: this.dataGrid, mode: this.mode }).confirm()
		const mode = new Mode<T, P>({
			...this.dataGrid.currentMode,
			columns: changes.columns,
			sorting: changes.sorting,
			pagination: changes.pagination,
			parameters: changes.parameters,
		})
		mode.apply(this.dataGrid)
	}

	private copy = () => {
		new DialogMode<T, P>({ dataGrid: this.dataGrid, mode: this.mode, isCopying: true }).confirm()
	}

	private saveChanges = () => {
		this.dataGrid.repository.save(this.dataGrid.currentMode as Mode<T, P>)
		this.mode = this.dataGrid.currentMode as Mode<T, P>
	}

	private saveAsNew = async () => {
		await new DialogMode<T, P>({
			dataGrid: this.dataGrid,
			mode: new Mode({ ...this.dataGrid.currentMode, id: undefined, name: '' }),
			isNew: true,
		}).confirm()
	}

	private archive = () => {
		this.mode.archived = true
		this.dataGrid.repository.save(this.mode)
		NotificationComponent.notifySuccess(t('View "${name:string}" is archived!', { name: this.mode.name }))
		this.menuNode.removeAttribute('open')
	}

	private delete = () => {
		this.dataGrid.deleteMode(this.mode)
	}

	private onClick = async (e: MouseEvent) => {
		if (!['container', 'title'].includes((e.target as HTMLElement).id)) {
			return
		}

		if (this.dataGrid.mode?.id === this.mode.id) {
			this.dataGrid.mode = undefined
		} else {
			const currentModeId = this.dataGrid.mode?.id

			if (this.dataGrid.mode
					&& !this.dataGrid.selectedModeNode?.hasUnsavedChanges
					&& this.dataGrid.mode.archived) {
				this.dataGrid.eliminateModeElementDirectly(currentModeId!)
			}

			if (this.dataGrid.mode && this.dataGrid.selectedModeNode?.hasUnsavedChanges) {
				const saveChanges = await new DialogAcknowledge({
					heading: t('Unsaved changes'),
					content: html`
						<span
							.innerHTML=${t('Do you want to save the new changes for <b>${name:string}</b> before switching view?', {
								name: this.dataGrid.mode.name,
							})}
						></span>
					`,
					primaryButtonText: t('Save'),
					secondaryButtonText: t('Don\'t Save'),
				}).confirm()

				if (saveChanges) {
					this.dataGrid.repository.save(this.dataGrid.currentMode as Mode<T, P>)

					if (this.dataGrid.currentMode.archived) {
						this.dataGrid.eliminateModeElementDirectly(currentModeId!)
					}
				}
			}

			this.dataGrid.mode = this.mode
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-moddable-data-grid-chip': ModdableDataGridChip<unknown, any>
	}
}