import { css, html, style, event, property, repeat } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import { FetchableDataGrid, type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { DataGridColumn } from '@3mo/data-grid'
import { Localizer } from '@3mo/localization'
import { ModdableDataGridMode } from './ModdableDataGridMode.js'
import { DialogMode } from './DialogMode.js'
import { equals } from '@a11d/equals'
import { IndexedDbAdapter, type ModdableDataGridModesAdapter } from './adapter/index.js'
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
export abstract class ModdableDataGrid<TData, TParameters extends FetchableDataGridParametersType> extends FetchableDataGrid<TData, TParameters> {
	static defaultAdapter: Constructor<ModdableDataGridModesAdapter<any, any>> = IndexedDbAdapter

	@event() readonly modeChange!: EventDispatcher<ModdableDataGridMode<TData, TParameters> | void>

	@property({ type: Object }) modesAdapter: ModdableDataGridModesAdapter<TData, TParameters> = new ModdableDataGrid.defaultAdapter()

	get mode() { return this.modesController.selectedMode }

	readonly modesController = new DataGridModesController<TData, TParameters>(this)

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

	private preventFetch = false

	override requestFetch() {
		return this.preventFetch ? Promise.resolve() : super.requestFetch()
	}

	private get hasModebar() {
		const hasModebar = this.modesController.modes.length > 0
		this.toggleAttribute('hasModebar', hasModebar)
		return hasModebar
	}

	get currentMode() {
		return ModdableDataGridMode.from(this)
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
						<mo-flex id='modes' direction='horizontal' alignItems='center' gap='var(--mo-thickness-l)'>
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
					<mo-popover-container fixed alignment='end'>
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
				<mo-context-menu-item class='archived'
					${style({
						backgroundColor: this.currentMode.id === mode.id
							? 'color-mix(in srgb, var(--mo-color-foreground), transparent 95%)'
							: 'unset',
					})}
					?activated=${this.mode?.id === mode.id}
					@click=${(e: MouseEvent) => this.temporaryUnarchiveMode(e, mode)}
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
				</mo-context-menu-item>
			`)}
		`
	}

	private temporaryUnarchiveMode(e: MouseEvent, mode: ModdableDataGridMode<TData, TParameters>) {
		if (['mo-context-menu-item', 'span'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
			this.modesController.set(this.mode?.id === mode.id ? undefined : mode)
		}
	}

	private createOrEditMode(mode?: ModdableDataGridMode<TData, TParameters>) {
		new DialogMode<TData, TParameters>({ dataGrid: this, mode }).confirm()
	}

	/* As we don't have any back-end to order the modes, we ignore it for now

	async deleteMode(mode: ModdableDataGridMode<TData, TParameters>) {
		const requiresDirectDOMUpdate = !mode.archived || this.currentMode.id === mode.id
		await this.modesController.delete(mode)
		if (requiresDirectDOMUpdate) {
			this.eliminateModeElementDirectly(mode.id!)
		}
	}

	private isReorderingEnabled = false

	private get supportsReordering() {
		return System.detect()?.os !== 'Android OS'
	}

	private enableReordering() {
		if (!this.modesListNode) {
			this.isReorderingEnabled = false
			return
		}

		if (this.isReorderingEnabled) {
			return
		}

		this.isReorderingEnabled = true

		if (!this.supportsReordering) {
			return
		}

		new Sortable(this.renderRoot.querySelector('#modes')!, {
			filter: '[data-temporary]',
			animation: 500,
			onEnd: () => this.onReorder(),
		})
	}

	private onReorder = async () => {
		const visibleModesIds = [...this.renderRoot.querySelectorAll('mo-moddable-data-grid-chip')]
			.map(mode => mode.dataset.modeId)
		this.modesController.modes = [
			...visibleModesIds
				.map(modeId => this.modesController.modes.find(mode => mode.id === modeId)!)
				.filter(mode => !mode.archived),
			...this.modesAdapter.getArchived(),
		]
	}

	// Changing arrangement mutates DOM directly and lit does not like it ¯\_(ツ)_/¯
	// TODO: Find a way to make it work without direct DOM manipulation. Sortable ignore?
	eliminateModeElementDirectly = (modeId = this.mode?.id) => {
		(this.renderRoot.querySelector(`[data-mode-id="${modeId}"]`) as HTMLElement)?.remove()
		requestIdleCallback(() => this.requestUpdate())
	}
	*/
}