/* eslint-disable @typescript-eslint/member-ordering */
import { css, html, property, event, style } from '@a11d/lit'
import { LocalStorage } from '@a11d/local-storage'
import { tooltip } from '@3mo/tooltip'
import { DataGridColumn, type DataGrid } from '@3mo/data-grid'
import { type FetchableDataGridParametersType, FetchableDataGrid } from '@3mo/fetchable-data-grid'
import { DialogDataGridMode, type Mode, ModeRepository } from './index.js'
import { sortable } from './SortableDirective.js'
import { Localizer } from '@3mo/localization'
import { DialogDeletion } from '@3mo/standard-dialogs'

Localizer.register('de', {
	'New Mode': 'Neue Ansicht erstellen',
	'Archive': 'Archiv',
	'Edit mode': 'Ansicht bearbeiten',
	'Delete mode': 'Ansicht löschen',
	'Keep in Dock': 'Ansicht im Dock anheften',
})

/** @fires modeChange */
export abstract class ModdableDataGrid<TData, TDataFetcherParameters extends FetchableDataGridParametersType = Record<string, never>, TDetailsElement extends Element | undefined = undefined> extends FetchableDataGrid<TData, TDataFetcherParameters, TDetailsElement> {
	static disableModes = false

	readonly modesRepository = new ModeRepository<TData, TDataFetcherParameters>(this as any)
	private readonly modeStorage = new LocalStorage<number | undefined>(`ModdableDataGrid.${this.tagName.toLowerCase()}.Mode`, undefined, (_, value) => Number(value))
	private readonly dataCache = new Map<number, { page: number, data: Array<TData> }>()

	@event() readonly modeChange!: EventDispatcher<Mode<TData, TDataFetcherParameters> | undefined>

	@property({ type: Boolean }) disableModeCache = false
	@property({ type: Array }) modes = new Array<Mode<TData, TDataFetcherParameters>>()
	@property({
		type: Object,
		updated(
			this: ModdableDataGrid<TData, TDataFetcherParameters, TDetailsElement>,
			mode: Mode<TData, TDataFetcherParameters> | undefined,
		) {
			this.modeStorage.value = mode?.id

			this.deselectAll()

			this.modesRepository.updateDefaultIfNeeded()

			const defaultMode = this.modesRepository.defaultMode
			const m = mode ?? defaultMode

			this.preventFetch = true
			this.setColumns((m.columns ?? defaultMode.columns).map(c => new DataGridColumn(c as Partial<DataGridColumn<TData>>)))
			if (!this.columns.length) {
				this.extractColumns()
			}
			this.sort(m.sorting ?? defaultMode.sorting)
			this.setPagination(m.pagination ?? defaultMode.pagination)
			this.setParameters(m.parameters ?? defaultMode.parameters)
			this.preventFetch = false

			const cache = !this.mode?.id ? undefined : this.dataCache.get(this.mode.id)
			this.page = cache?.page ?? 1

			this.requestFetch()
			this.modeChange.dispatch(mode)
		}
	}) mode = !this.modeStorage.value ? undefined : this.modesRepository.get(this.modeStorage.value)

	static override get styles() {
		return css`
			${super.styles}

			:host {
				--mo-data-grid-toolbar-padding: 14px;
			}

			mo-card {
				border-radius: 0 0 var(--mo-border-radius) var(--mo-border-radius);
			}

			:host(:not([hasModebar])) mo-card {
				border-radius: var(--mo-border-radius);
			}

			#modes {
				border-radius: var(--mo-border-radius) var(--mo-border-radius) 0 0;
				padding: 14px;
				background-color: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-accent) 8%);

				mo-scroller::part(container) {
					display: flex;
					align-items: center;
				}
			}

			.archived {
				min-width: 320px;
				font-size: 12px;

				mo-icon-button {
					font-size: 18px;
					color: var(--mo-color-gray);
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

	private preventFetch = false
	override requestFetch() {
		return this.preventFetch
			? Promise.resolve()
			: super.requestFetch()
	}

	override setData(...parameters: Parameters<DataGrid<TData, TDetailsElement>['setData']>) {
		super.setData(...parameters)
		if (this.mode?.id) {
			this.dataCache.set(this.mode.id, { page: this.page, data: parameters[0] })
		}
	}

	protected override fetchDirty() {
		return this.disableModeCache || !this.mode?.id ? undefined : this.dataCache.get(this.mode.id)?.data
	}

	private get hasModebar() {
		const hasModebar = ModdableDataGrid.disableModes === false && (this.modesRepository.getAll().length !== 0 || this.modes.length !== 0)
		this.toggleAttribute('hasModebar', hasModebar)
		return hasModebar
	}

	protected override get template() {
		return html`
			${!this.hasModebar ? html.nothing : html`
				<mo-flex id='modes' direction='horizontal'>
					${this.modebarTemplate}
				</mo-flex>
			`}
			<mo-card ${style({ height: '100%', '--mo-card-body-padding': '0px' })}>
				<mo-flex ${style({ height: '100%' })}>
					${super.template}
				</mo-flex>
			</mo-card>
		`
	}

	protected override get toolbarActionsTemplate() {
		return html`
			${this.hasModebar || ModdableDataGrid.disableModes ? html.nothing : html`
				<mo-icon-button icon='playlist_add'
					@click=${() => this.createOrEditMode()}
					${tooltip(t('New Mode'))}
				></mo-icon-button>
			`}
			${super.toolbarActionsTemplate}
		`
	}

	private get modebarTemplate() {
		const getModeChipTemplate = (mode: Mode<TData, TDataFetcherParameters>) => html`
			<mo-data-grid-mode-chip
				?readOnly=${this.modes.includes(mode)}
				?data-non-sortable=${this.modes.includes(mode)}
				.moddableDataGrid=${this as any}
				.mode=${mode}
				?selected=${this.mode?.id === mode.id}
			></mo-data-grid-mode-chip>
		`

		return html`
			<mo-flex ${style({ flex: '1' })} direction='horizontal' alignItems='center' gap='14px'>
				<mo-scroller ${style({ overflow: 'auto hidden', maxWidth: 'calc(100% - 40px)' })}>
					<mo-flex direction='horizontal' alignItems='center' gap='var(--mo-thickness-l)'>
						${this.temporarySelectedModeTab}
						${sortable({
							data: this.modesRepository.getUnarchived(),
							sortedCallback: this.handleSort,
							getItemTemplate: getModeChipTemplate,
						})}
					</mo-flex>
				</mo-scroller>

				<mo-icon-button icon='add'
					${style({ color: 'var(--mo-color-gray)' })}
					${tooltip(t('New Mode'))}
					@click=${() => this.createOrEditMode()}
				></mo-icon-button>
			</mo-flex>

			${this.modesRepository.getArchived().length === 0 ? html.nothing : html`
				<mo-popover-container fixed alignment='end'>
					<mo-icon-button icon='archive'
						${tooltip(t('Archive'))}
						${style({ color: 'var(--mo-color-gray)' })}
					></mo-icon-button>
					<mo-menu slot='popover'>
						${this.archiveMenuTemplate}
					</mo-menu>
				</mo-popover-container>
			`}
		`
	}

	private readonly handleSort = (sortedModes: Array<Mode<TData, TDataFetcherParameters>>) => {
		this.modesRepository.value = [
			...sortedModes,
			...this.modesRepository.getArchived(),
		]
	}

	private get temporarySelectedModeTab() {
		return !this.mode || this.modes.includes(this.mode) || this.mode.isArchived === false ? html.nothing : html`
			<mo-data-grid-mode-chip data-non-sortable selected
				.moddableDataGrid=${this as any}
				.mode=${this.mode}
			></mo-data-grid-mode-chip>
		`
	}

	private get archiveMenuTemplate() {
		return html`
			<span id='archive-title'>Ansichten Archiv</span>
			${this.modesRepository.getArchived().map(mode => html`
				<mo-context-menu-item class='archived'
					?activated=${this.mode?.id === mode.id}
					@click=${() => this.mode = mode}
				>
					${mode.name}

					<mo-flex direction='horizontal' alignItems='center' gap='8px' ${style({ marginLeft: 'auto' })}>
						<mo-icon-button dense icon='push_pin'
							${tooltip(t('Keep in Dock'))}
							@click=${(e: MouseEvent) => (e.stopPropagation(), this.modesRepository.unarchive(mode))}
						></mo-icon-button>

						<mo-icon-button dense icon='edit'
							${tooltip(t('Edit mode'))}
							@click=${(e: MouseEvent) => (e.stopPropagation(), this.createOrEditMode(mode))}
						></mo-icon-button>

						<mo-icon-button dense icon='delete'
							${tooltip(t('Delete mode'))}
							${style({ color: 'var(--mo-color-red)' })}
							@click=${(e: MouseEvent) => (e.stopPropagation(), this.deleteMode(mode as any))}
						></mo-icon-button>
					</mo-flex>
				</mo-context-menu-item>
			`)}
		`
	}

	private readonly createOrEditMode = async (mode?: Mode<TData, TDataFetcherParameters>) => {
		await new DialogDataGridMode({ moddableDataGrid: this as any, mode: mode as any }).confirm()
	}

	private readonly deleteMode = async (mode: Mode<TData, TDataFetcherParameters>) => {
		await new DialogDeletion({
			content: `${t('Do you want to delete the view "${name:string}"?', { name: mode.name })} ${t('This process is irreversible.')}`,
			deletionAction: () => this.modesRepository.remove(mode)
		}).confirm()
	}
}