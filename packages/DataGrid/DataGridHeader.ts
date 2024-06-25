import { component, Component, css, html, ifDefined, property, event, style, live } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import { observeResize } from '@3mo/resize-observer'
import { Localizer } from '@3mo/localization'
import { DataGridSelectionMode, DataGridSortingStrategy, type DataGridColumn, type DataGrid, DataGridSidePanelTab } from './index.js'
import type { DataGridColumnsController } from './DataGridColumnsController.js'

Localizer.register('en', {
	'Options for ${count:pluralityNumber} selected entries': [
		'Options for the selected entry',
		'Options for ${count} selected entries',
	],
})

Localizer.register('de', {
	'Options for ${count:pluralityNumber} selected entries': [
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

	protected override connected() {
		this.dataGrid.dataChange.subscribe(this.handleDataGridDataChange)
	}

	protected override disconnected() {
		this.dataGrid.dataChange.unsubscribe(this.handleDataGridDataChange)
	}

	private readonly handleDataGridDataChange = () => {
		this.requestUpdate()
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

			.headerContent {
				padding: 0 var(--mo-data-grid-cell-padding);
				display: inline-block;
				overflow: hidden !important;
				color: var(--mo-color-foreground);
				font-weight: 500;
				line-height: var(--mo-data-grid-header-height);
				white-space: nowrap;
				text-overflow: ellipsis;
				user-select: none;
			}

			.sort-rank {
				background: var(--mo-color-transparent-gray-3);
				color: var(--mo-color-foreground);
				border: 1px solid var(--mo-color-gray-transparent);
				border-radius: 50%;
				width: fit-content;
				user-select: none;
				height: 20px;
				aspect-ratio: 1 / 1;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.cell {
				position: relative;
			}

			.cell[data-sticky] {
				position: sticky;
			}

			.cell[data-sticky] /*[data-sticking]*/ {
				z-index: 6;
				background: var(--mo-data-grid-sticky-part-color);
			}

			mo-data-grid-header-separator {
				z-index: 5;
			}

			.cell[data-sticky] /*[data-sticking]*/ mo-data-grid-header-separator {
				z-index: 7;
			}

			.details, .selection, .more, .context-menu {
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

			.more, .context-menu {
				cursor: pointer;
				inset-inline-end: 0px;
			}

			.more {
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
			${this.moreTemplate}
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
		return this.dataGrid.hasSelection === false || this.dataGrid.selectionCheckboxesHidden ? html.nothing : html`
			<mo-flex class='selection' justifyContent='center' alignItems='center'
				${style({ insetInlineStart: this.dataGrid.hasDetails ? '20px' : '0px' })}
				${this.getResizeObserver('selectionColumnWidthInPixels')}
			>
				${this.dataGrid.selectionMode !== DataGridSelectionMode.Multiple ? html.nothing : html`
					<mo-checkbox .selected=${live(this.selection)} @click=${this.toggleSelection}></mo-checkbox>
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

	private readonly toggleSelection = (e: PointerEvent) => {
		e.stopPropagation()
		const selection = this.selection === 'indeterminate' ? false : !this.selection
		if (selection === true) {
			this.dataGrid.selectAll()
		} else {
			this.dataGrid.deselectAll()
		}
	}

	private get contentTemplate() {
		return html`
			${this.dataGrid.visibleColumns.map(this.getHeaderCellTemplate)}
		`
	}

	private readonly getHeaderCellTemplate = (column: DataGridColumn<TData>, index: number, columns: Array<DataGridColumn<TData>>) => {
		const sortingDefinition = column.sortingDefinition
		const sortIcon = !sortingDefinition ? undefined : sortingDefinition.strategy === DataGridSortingStrategy.Ascending ? 'arrow_upward' : 'arrow_downward'
		const sortingRank = !sortingDefinition || this.dataGrid.getSorting().length <= 1 ? undefined : sortingDefinition.rank
		const observeResizeDeferred = (callback: ResizeObserverCallback) => observeResize((e, o) => {
			// It is necessary to defer the callback to avoid
			// this resize-observer triggering other resize-observers in a loop
			requestIdleCallback(() => callback(e, o))
		})
		return html`
			<mo-flex class='cell' alignItems='center' direction=${column.alignment === 'end' ? 'horizontal-reversed' : 'horizontal'}
				data-sticky=${ifDefined(column.sticky)}
				data-sticking=${column.intersecting === false}
				${!column.sticky || column.intersecting ? html.nothing : style({ insetInline: column.stickyColumnInsetInline })}
				${observeResizeDeferred(([entry]) => column.widthInPixels = entry?.contentRect.width ?? 0)}
			>
				<mo-flex direction=${column.alignment === 'end' ? 'horizontal-reversed' : 'horizontal'} alignItems='center'
					${style({ overflow: 'hidden', cursor: 'pointer', flex: '1' })}
					@click=${() => this.sort(column)}
				>
					<div class='headerContent'
						${style({ width: '100%', textAlign: column.alignment })}
						${!column.description ? html.nothing : tooltip(column.description)}
					>${column.heading}</div>

					${sortIcon === undefined ? html.nothing : html`
						${!sortingRank ? html.nothing : html`<span class='sort-rank'>${sortingRank}</span>`}
						<mo-icon ${style({ color: 'var(--mo-color-accent)', marginInline: '3px' })} icon=${ifDefined(sortIcon)}></mo-icon>
					`}
				</mo-flex>
				<mo-data-grid-header-separator
					?data-last=${columns.length - 1 === index}
					.dataGrid=${this.dataGrid as any}
					.column=${this.dataGrid.visibleColumns[index]}
				></mo-data-grid-header-separator>
			</mo-flex>
		`
	}

	private get fillerTemplate() {
		return html`<span></span>`
	}

	private get moreTemplate() {
		if (this.dataGrid.hasContextMenu && this.dataGrid.selectedData.length > 1) {
			return html`
				<mo-flex class='context-menu' alignItems='end' justifyContent='center' ${this.getResizeObserver('moreColumnWidthInPixels')}>
					<mo-popover-container fixed>
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
				<mo-flex class='more' alignItems='end' justifyContent='center' ${this.getResizeObserver('moreColumnWidthInPixels')}>
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

	private sort(column: DataGridColumn<TData>) {
		if (column.sortable) {
			this.dataGrid.sortingController.toggle(column.sortDataSelector)
			this.requestUpdate()
		}
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