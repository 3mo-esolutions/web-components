import { css, html, style, event, property, repeat, queryAll } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import { FetchableDataGrid, type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { type DataGridColumn } from '@3mo/data-grid'
import { Localizer } from '@3mo/localization'
import { ModdableDataGridMode } from './ModdableDataGridMode.js'
import { DialogMode } from './DialogMode.js'
import { equals } from '@a11d/equals'
import { IndexedDbAdapter, type ModdableDataGridChip, type ModdableDataGridModesAdapter } from './index.js'
import { DataGridModesController } from './DataGridModesController.js'

Localizer.dictionaries.add({
	de: {
		'Add new view': 'Neue Ansicht erstellen',
		'Archive': 'Archiv',
		'Edit view': 'Ansicht bearbeiten',
		'Delete view': 'Ansicht löschen',
		'Keep in Dock': 'Ansicht im Dock anheften',
		'Archive view': 'Archivansicht',
	}
})

/**
 * @prop modesAdapter - Adapter for modes storage. Defaults to IndexedDbAdapter.
 * @fires modeChange
 */
export abstract class ModdableDataGrid<TData, TParameters extends FetchableDataGridParametersType = Record<string, never>, TDetailsElement extends Element | undefined = undefined> extends FetchableDataGrid<TData, TParameters, TDetailsElement> {
	static defaultAdapter: Constructor<ModdableDataGridModesAdapter<any, any>> = IndexedDbAdapter

	@event() readonly modeChange!: EventDispatcher<ModdableDataGridMode<TData, TParameters> | void>

	@property({ type: Object }) modesAdapter = new ModdableDataGrid.defaultAdapter() as ModdableDataGridModesAdapter<TData, TParameters>

	@queryAll('mo-moddable-data-grid-chip') readonly modeChips!: Array<ModdableDataGridChip<TData, TParameters>>

	get mode() { return this.modesController.selectedMode }

	readonly modesController = new DataGridModesController<TData, TParameters>(this)

	protected override updated(...parameters: Parameters<FetchableDataGrid<TData, TParameters, TDetailsElement>['updated']>) {
		super.updated(...parameters)
		this.modeChips.forEach(chip => chip.requestUpdate())
	}

	override extractedColumnsUpdated(columns: Array<DataGridColumn<TData, unknown>>) {
		if (!this.mode) {
			return super.extractedColumnsUpdated(columns)
		}
	}

	static override get styles() {
		return css`
			${super.styles}

			:host {
				--mo-data-grid-toolbar-padding: 14px;
			}

			mo-card {
				--mo-card-body-padding: 0;
				border-radius: 0 0 var(--mo-border-radius) var(--mo-border-radius);
				height: 100%;
			}

			:host(:not([hasModebar])) mo-card {
				border-radius: var(--mo-border-radius);
			}

			#container {
				height: 100%;
			}

			#modebar {
				border-radius: var(--mo-border-radius) var(--mo-border-radius) 0 0;
				background-color: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-accent) 8%);
				min-height: 40px;
				padding: 6px 12px;

				white-space: nowrap;

				mo-scroller {
					overflow: auto hidden;
					max-width: calc(100% - 40px);

					&::part(container) {
						display: flex;
						align-items: center;
					}
				}
			}

			.archived {
				min-width: 320px;
				font-size: 0.8rem;

				span {
					max-width: min(420px, calc(100vw - 160px));
					overflow: hidden;
					text-overflow: ellipsis;
					display: block;
				}

				mo-icon-button {
					font-size: 18px;
					color: var(--mo-color-gray);
				}

				&:not(:last-of-type) {
					border-bottom: solid 1px color-mix(in srgb, var(--mo-color-gray), transparent 80%);
				}
			}

			#archive-title {
				font-size: 12px;
				padding: 8px 16px;
				display: block;
				font-weight: 500;
			}
		`
	}

	private get hasModebar() {
		const hasModebar = this.modesController.modes.length > 0
		this.toggleAttribute('hasModebar', hasModebar)
		return hasModebar
	}

	get currentMode() {
		return ModdableDataGridMode.fromDataGrid(this)
	}

	get hasUnsavedChanges() {
		return this.mode && !this.currentMode[equals](this.mode)
	}

	protected override get template() {
		return html`
			${this.modebarTemplate}

			<mo-card>
				<mo-flex id='container'>
					${super.template}
				</mo-flex>
			</mo-card>
		`
	}

	protected get modebarTemplate() {
		return !this.hasModebar ? html.nothing : html`
			<mo-flex id='modebar' direction='horizontal'>
				<mo-flex ${style({ flexGrow: '1' })} direction='horizontal' alignItems='center' gap='14px'>
					<mo-scroller>
						<mo-flex id='modes' direction='horizontal' alignItems='center' gap='0.5rem'>
							${repeat(this.modesController.visibleModes, mode => mode.id, mode => html`
								<mo-moddable-data-grid-chip ?data-temporary=${mode.archived} data-mode-id=${mode.id!}
									.dataGrid=${this}
									.mode=${mode}
									?selected=${this.mode?.id === mode.id}
								></mo-moddable-data-grid-chip>
							`)}
						</mo-flex>
					</mo-scroller>

					<mo-icon-button icon='add'
						${style({ color: 'var(--mo-color-gray)' })}
						${tooltip(t('Add new view'))}
						@click=${() => this.createOrEditMode()}
					></mo-icon-button>
				</mo-flex>

				${!this.modesController.archivedModes.length ? html.nothing : html`
					<mo-popover-container alignment='end'>
						<mo-icon-button icon='archive' data-test-id='archive'
							${tooltip(t('Archive'))}
							${style({ color: 'var(--mo-color-gray)', alignSelf: 'center' })}
						></mo-icon-button>
						<mo-menu slot='popover'>
							${this.archiveMenuTemplate}
						</mo-menu>
					</mo-popover-container>
				`}
			</mo-flex>
		`
	}

	protected override get toolbarActionsTemplate() {
		return html`
			${this.hasModebar ? html.nothing : html`
				<mo-icon-button icon='playlist_add' data-test-id='add-mode'
					@click=${() => this.createOrEditMode()}
					${tooltip(t('Add new view'))}
				></mo-icon-button>
			`}
			${super.toolbarActionsTemplate}
		`
	}

	private get archiveMenuTemplate() {
		return html`
			<span id='archive-title'>${t('Archive view')}</span>
			${this.modesController.archivedModes.map((mode: ModdableDataGridMode<TData, TParameters>) => html`
				<mo-menu-item class='archived'
					${style({
						backgroundColor: this.currentMode.id === mode.id
							? 'color-mix(in srgb, var(--mo-color-foreground), transparent 95%)'
							: 'unset',
					})}
					@click=${() => this.modesController.set(this.mode?.id === mode.id ? undefined : mode)}
				>
					<span>${mode.name}</span>

					<mo-flex direction='horizontal' alignItems='center' gap='8px' ${style({ marginLeft: 'auto' })}>
						<mo-icon-button dense icon='push_pin'
							${tooltip(t('Keep in Dock'))}
							@click=${() => mode.unarchive(this)}
						></mo-icon-button>

						<mo-icon-button dense icon='edit'
							${tooltip(t('Edit view'))}
							@click=${() => this.createOrEditMode(mode)}
						></mo-icon-button>

						<mo-icon-button dense icon='delete'
							${tooltip(t('Delete view'))}
							${style({ color: 'var(--mo-color-red)' })}
							@click=${() => this.modesController.delete(mode)}
						></mo-icon-button>
					</mo-flex>
				</mo-menu-item>
			`)}
		`
	}

	private async createOrEditMode(mode?: ModdableDataGridMode<TData, TParameters>) {
		const savedMode = await new DialogMode<TData, TParameters>({ dataGrid: this, mode }).confirm()
		await this.modesController.set(savedMode)
	}
}