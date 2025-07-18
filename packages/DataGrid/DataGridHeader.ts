import { component, Component, css, html, property, event, style, live, queryAll } from '@a11d/lit'
import { observeResize } from '@3mo/resize-observer'
import { Localizer } from '@3mo/localization'
import { DataGridSelectability, type DataGrid, DataGridSidePanelTab, type DataGridColumnHeader } from './index.js'
import type { DataGridColumnsController } from './DataGridColumnsController.js'

Localizer.dictionaries.add('en', {
	'Actions for ${count:pluralityNumber} selected entries': [
		'Actions for the selected entry',
		'Actions for ${count} selected entries',
	],
})

Localizer.dictionaries.add('de', {
	'Actions for ${count:pluralityNumber} selected entries': [
		'Optionen für den ausgewählten Eintrag',
		'Optionen für ${count} ausgewählte Einträge',
	],
})

@component('mo-data-grid-header')
export class DataGridHeader<TData> extends Component {
	@event() readonly pageChange!: EventDispatcher<number>
	@event() readonly modeSelectionChange!: EventDispatcher<string>

	@property({ type: Object }) dataGrid!: DataGrid<TData, any>
	@property({ type: Boolean, reflect: true }) overlayOpen = false

	@queryAll('mo-data-grid-column-header') private readonly columnHeaders!: Array<DataGridColumnHeader>

	protected override connected() {
		this.dataGrid.dataChange.subscribe(this.handleDataGridDataChange)
	}

	protected override disconnected() {
		this.dataGrid.dataChange.unsubscribe(this.handleDataGridDataChange)
	}

	private readonly handleDataGridDataChange = () => {
		this.requestUpdate()
	}

	protected override updated(...parameters: Parameters<Component['updated']>) {
		super.updated(...parameters)
		this.columnHeaders.forEach(h => h.requestUpdate())
	}

	static override get styles() {
		return css`
			:host {
				--mo-data-grid-header-separator-height: 15px;
				--mo-data-grid-header-separator-width: 2px;
				display: grid;
				grid-template-columns: subgrid;
				position: sticky;
				grid-column: -1 / 1;
				background: var(--mo-data-grid-header-background, var(--mo-data-grid-sticky-part-color));
				top: 0;
				z-index: 4;
				font-size: small;
				border-block: var(--mo-data-grid-border);
				height: var(--mo-data-grid-header-height);
			}

			.details, .selection, .actions, .context-menu {
				position: sticky;
				background: var(--mo-data-grid-sticky-part-color);
				z-index: 5;
			}

			.details {
				inset-inline-start: 0px;
			}

			.selection {
				inset-inline-start: 0px;
			}

			.actions, .context-menu {
				cursor: pointer;
				inset-inline-end: 0px;
			}

			.actions {
				mo-icon-button {
					color: var(--mo-color-accent);
					font-size: large;
				}
			}

			.context-menu {
				background-color: var(--mo-color-accent);

				mo-icon-button {
					color: var(--mo-color-on-accent);
					font-size: 20px;
				}
			}
		`
	}

	protected override get template() {
		return html`
			${this.detailsExpanderTemplate}
			${this.selectionTemplate}
			${this.contentTemplate}
			${this.fillerTemplate}
			${this.actionsTemplate}
		`
	}

	private get detailsExpanderTemplate() {
		return this.dataGrid.hasDetails === false ? html.nothing : html`
			<mo-flex class='details' justifyContent='center' alignItems='center'
				${style({ insetInlineStart: '0px' })}
				${this.getResizeObserver('detailsColumnWidthInPixels')}
			>
				${!this.dataGrid.hasDetails || !this.dataGrid.multipleDetails ? html.nothing : html`
					<mo-icon-button dense
						icon=${this.dataGrid.allRowDetailsOpen ? 'unfold_less' : 'unfold_more'}
						@click=${() => this.toggleAllDetails()}
					></mo-icon-button>
				`}
			</mo-flex>
		`
	}

	private get selectionTemplate() {
		return !this.dataGrid.hasSelection ? html.nothing : html`
			<mo-flex class='selection' justifyContent='center' alignItems='center'
				${style({ insetInlineStart: this.dataGrid.hasDetails ? '20px' : '0px' })}
				${this.getResizeObserver('selectionColumnWidthInPixels')}
			>
				${this.dataGrid.selectability !== DataGridSelectability.Multiple ? html.nothing : html`
					<mo-checkbox .selected=${live(this.selection)} @change=${this.handleSelectionChange}></mo-checkbox>
				`}
			</mo-flex>
		`
	}

	private get selection() {
		switch (this.dataGrid.selectedData.length) {
			case 0:
				return false
			case this.dataGrid.dataLength:
				return true
			default:
				return 'indeterminate'
		}
	}

	private readonly handleSelectionChange = (e: CustomEvent<CheckboxSelection>) => {
		const previousSelection = this.selection
		const selection = e.detail
		if (previousSelection === 'indeterminate' || selection === false) {
			this.dataGrid.deselectAll()
		} else {
			this.dataGrid.selectAll()
		}
	}

	private get contentTemplate() {
		return html`
			${this.dataGrid.visibleColumns.map(column => html`
				<mo-data-grid-column-header .column=${column}></mo-data-grid-column-header>
			`)}
		`
	}

	private get fillerTemplate() {
		return html`<span></span>`
	}

	private get actionsTemplate() {
		if (this.dataGrid.hasContextMenu && this.dataGrid.selectedData.length > 1) {
			return html`
				<mo-flex class='context-menu' alignItems='end' justifyContent='center' ${this.getResizeObserver('actionsColumnWidthInPixels')}>
					<mo-popover-container>
						<mo-icon-button dense icon='more_vert' title=${t('Actions for ${count:pluralityNumber} selected entries', { count: this.dataGrid.selectedData.length })}></mo-icon-button>

						<mo-menu slot='popover'>
							${this.dataGrid.contextMenuController.getMenuContentTemplate()}
						</mo-menu>
					</mo-popover-container>
				</mo-flex>
			`
		}

		if (!this.dataGrid.hasToolbar && !this.dataGrid.sidePanelHidden) {
			return html`
				<mo-flex class='actions' alignItems='end' justifyContent='center' ${this.getResizeObserver('actionsColumnWidthInPixels')}>
					<mo-icon-button dense icon='settings'
						@click=${() => this.dataGrid.navigateToSidePanelTab(this.dataGrid.sidePanelTab ? undefined : DataGridSidePanelTab.Settings)}
					></mo-icon-button>
				</mo-flex>
			`
		}

		return html.nothing
	}

	private getResizeObserver(property: keyof DataGridColumnsController<TData>) {
		// @ts-expect-error Readonly property set here
		return observeResize(([entry]) => this.dataGrid.columnsController[property] = entry?.contentRect.width ?? 0)
	}

	private toggleAllDetails() {
		this.dataGrid.toggleRowDetails()
		this.requestUpdate()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-header': DataGridHeader<unknown>
	}
}