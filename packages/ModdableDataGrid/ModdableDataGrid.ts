/* eslint-disable @typescript-eslint/member-ordering */
import { css, html, property, event, style } from '@a11d/lit'
import { LocalStorage } from '@a11d/local-storage'
import { contextMenu } from '@3mo/context-menu'
import { tooltip } from '@3mo/tooltip'
import { DataGrid } from '@3mo/data-grid'
import { FetchableDataGridParametersType, FetchableDataGrid } from '@3mo/fetchable-data-grid'
import { DialogDataGridMode, Mode, ModeRepository } from './index.js'
import { sortable } from './SortableDirective.js'

/** @fires modeChange {CustomEvent<Mode<TData, TDataFetcherParameters> | undefined>} */
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
			this.setColumns((m.columns ?? defaultMode.columns).map(c => ({ ...c })))
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

			#modebarFlex {
				border-radius: var(--mo-border-radius) var(--mo-border-radius) 0 0;
				padding: 14px;
				background: var(--mo-color-transparent-gray-2);
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
				<mo-flex id='modebarFlex' direction='horizontal'>
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
			${this.hasModebar || ModdableDataGrid.disableModes ? html.nothing : html`<mo-icon-button icon='visibility' @click=${this.createNewMode} ${tooltip(t('New Mode'))}></mo-icon-button>`}
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
			<mo-flex ${style({ width: '*' })} direction='horizontal' alignItems='center' gap='14px'>
				<mo-scroller ${style({ overflow: 'auto hidden', maxWidth: 'calc(100% - 40px)' })}>
					<mo-flex direction='horizontal' gap='8px'>
						${this.modes.map(getModeChipTemplate)}
						${this.temporarySelectedModeTab}
						${sortable({
							data: this.modesRepository.getUnarchived(),
							sortedCallback: this.handleSort,
							getItemTemplate: getModeChipTemplate,
						})}
					</mo-flex>
				</mo-scroller>
				<mo-icon-button icon='add' ${tooltip('New Mode')} @click=${this.createNewMode}></mo-icon-button>
			</mo-flex>

			${this.modesRepository.getArchived().length === 0 ? html.nothing : html`
				<mo-icon-button icon='more_vert' ${contextMenu(this.archiveMenuTemplate)}></mo-icon-button>
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
			<mo-data-grid-mode-chip data-non-sortable .moddableDataGrid=${this as any} .mode=${this.mode} selected></mo-data-grid-mode-chip>
		`
	}

	private get archiveMenuTemplate() {
		return html`
			${this.modesRepository.getArchived().map(mode => html`
				<mo-context-menu-item
					?activated=${this.mode?.id === mode.id}
					@click=${() => this.mode = mode}
				>${mode.name}</mo-context-menu-item>
			`)}
		`
	}

	private readonly createNewMode = async () => {
		await new DialogDataGridMode({ moddableDataGrid: this as any }).confirm()
	}
}