import { component, Component, css, html, ifDefined, property, event, style, join, queryAll } from '@a11d/lit'
import { KeyboardController } from '@3mo/keyboard-controller'
import { type Checkbox } from '@3mo/checkbox'
import { tooltip } from '@3mo/tooltip'
import { observeResize } from '@3mo/resize-observer'
import { DataGridSelectionMode, DataGridSortingStrategy, type DataGridColumn, DataGrid, DataGridSidePanelTab } from './index.js'

@component('mo-data-grid-header')
export class DataGridHeader<TData> extends Component {
	@event() readonly pageChange!: EventDispatcher<number>
	@event() readonly modeSelectionChange!: EventDispatcher<string>

	@property({ type: Object }) dataGrid!: DataGrid<TData, any>
	@property() selection: CheckboxSelection = false
	@property({ type: Boolean, reflect: true }) overlayOpen = false

	@queryAll('.headerContent') readonly cells!: Array<HTMLElement>

	protected override connected() {
		this.dataGrid.dataChange.subscribe(this.handleDataGridDataChange)
		this.dataGrid.selectionChange.subscribe(this.handleDataGridSelectionChange)
		this.toggleAttribute('subgrid', this.dataGrid.isUsingSubgrid)
		this.toggleAttribute('details', this.dataGrid.hasDetails)
	}

	protected override disconnected() {
		this.dataGrid.dataChange.unsubscribe(this.handleDataGridDataChange)
		this.dataGrid.selectionChange.unsubscribe(this.handleDataGridSelectionChange)
	}

	private readonly handleDataGridDataChange = () => {
		this.requestUpdate()
	}

	private readonly handleDataGridSelectionChange = (selectedData: Array<TData>) => {
		if (selectedData.length === 0) {
			this.selection = false
		} else if (selectedData.length === this.dataGrid.dataLength) {
			this.selection = true
		} else {
			this.selection = 'indeterminate'
		}
	}

	static override get styles() {
		return css`
			:host {
				--mo-data-grid-header-separator-height: 15px;
				--mo-data-grid-header-separator-width: 2px;
				display: inherit;
				font-size: small;
			}

			:host([subgrid]) {
				--mo-data-grid-column-width: 102px;
				position: sticky;
				display: grid;
				grid-template-columns: subgrid;
				grid-column: -1 / 1;
				background: var(--mo-data-grid-sticky-part-color);
				top: 0;
				z-index: 4;

				.details, .selection, .more {
					position: sticky;
					background: var(--mo-data-grid-sticky-part-color);
					z-index: 10;
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

				.details {
					inset-inline-start: 0px;
				}

				.selection {
					inset-inline-start: 0px;
				}

				.more {
					cursor: pointer;
					inset-inline-end: 0px;
				}
			}

			:host([subgrid][details]) .selection {
				inset-inline-start: 20px;
			}

			:host([subgrid]), #header {
				border-top: var(--mo-data-grid-border);
				border-bottom: var(--mo-data-grid-border);
			}

			#header {
				position: relative;
				height: var(--mo-data-grid-header-height);
				background-color: var(--mo-data-grid-sticky-part-color);
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
			}

			.sort-rank {
				background: var(--mo-color-transparent-gray-3);
				color: var(--mo-color-foreground);
				border: 1px solid var(--mo-color-gray-transparent);
				border-radius: 50%;
				width: 20px;
				height: 20px;
				aspect-ratio: 1 / 1;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		`
	}

	private get skeletonColumns() {
		return [
			this.dataGrid.detailsColumnWidth,
			this.dataGrid.selectionColumnWidth,
			this.dataGrid.isUsingSubgrid ? undefined : '1fr',
			this.dataGrid.hasToolbar || this.dataGrid.sidePanelHidden || this.dataGrid.isUsingSubgrid ? undefined : this.dataGrid.moreColumnWidth,
		].filter((c): c is string => c !== undefined).join(' ')
	}

	private get separatorAdjustedColumns() {
		const hasMoreColumn = (!this.dataGrid.hasToolbar && !this.dataGrid.sidePanelHidden) || this.dataGrid.hasContextMenu

		return [...this.dataGrid.dataColumnsWidths, !hasMoreColumn ? undefined : this.dataGrid.moreColumnWidth]
			.filter(Boolean)
			.join(' var(--mo-data-grid-columns-gap) ')
	}

	protected override get template() {
		if (!this.dataGrid.isUsingSubgrid) {
			return html`
				<mo-grid id='header' columns=${this.skeletonColumns}>
					${this.detailsExpanderTemplate}
					${this.selectionTemplate}
					${this.contentTemplate}
					${this.moreTemplate}
				</mo-grid>
			`
		}

		return html`
			${this.detailsExpanderTemplate}
			${this.selectionTemplate}
			${this.contentTemplate}
			${this.fillerTemplate}
			${this.moreTemplate}
		`
	}

	protected get fillerTemplate() {
		return !this.dataGrid.isUsingSubgrid || !this.dataGrid.hasToolbar || this.dataGrid.sidePanelHidden ? html.nothing : html`
			<span></span>
		`
	}

	private get detailsExpanderTemplate() {
		return this.dataGrid.hasDetails === false ? html.nothing : html`
			<mo-flex class='details' justifyContent='center' alignItems='center' ${this.getResizeObserver('detailsColumnWidthInPixels')}>
				${!this.dataGrid.hasDetails || !this.dataGrid.multipleDetails ? html.nothing : html`
					<mo-icon-button dense ${style({ padding: '-10px 0px 0 -10px' })}
						${style({ display: 'inherit' })}
						icon=${this.dataGrid.allRowDetailsOpen ? 'unfold_less' : 'unfold_more'}
						@click=${() => this.toggleAllDetails()}
					></mo-icon-button>
				`}
			</mo-flex>
		`
	}

	private get selectionTemplate() {
		return this.dataGrid.hasSelection === false || this.dataGrid.selectionCheckboxesHidden ? html.nothing : html`
			<mo-flex class='selection' justifyContent='center' alignItems='center' ${this.getResizeObserver('selectionColumnWidthInPixels')}>
				${this.dataGrid.selectionMode !== DataGridSelectionMode.Multiple ? html.nothing : html`
					<mo-checkbox ${style({ position: 'absolute' })} .selected=${this.selection} @change=${this.handleSelectionChange}></mo-checkbox>
				`}
			</mo-flex>
		`
	}

	private get contentTemplate() {
		if (!this.dataGrid.isUsingSubgrid) {
			return html`
				<mo-grid columns=${this.separatorAdjustedColumns}>
					${join(this.dataGrid.visibleColumns.map(this.getHeaderCellTemplate), index => html`
						<mo-data-grid-header-separator
							.dataGrid=${this.dataGrid as any}
							.column=${this.dataGrid.visibleColumns[index]}
							@columnUpdate=${() => this.dataGrid.requestUpdate()}
						></mo-data-grid-header-separator>
					`)}
				</mo-grid>
			`
		}

		return html`
			${this.dataGrid.visibleColumns.map(this.getHeaderCellTemplate)}
		`
	}

	private readonly getHeaderCellTemplate = (column: DataGridColumn<TData>, index: number, columns: Array<DataGridColumn<TData>>) => {
		const sortingDefinition = column.sortingDefinition
		const sortIcon = !sortingDefinition ? undefined : sortingDefinition.strategy === DataGridSortingStrategy.Ascending ? 'arrow_upward' : 'arrow_downward'
		const sortingRank = !sortingDefinition || this.dataGrid.getSorting().length <= 1 ? undefined : sortingDefinition.rank
		const observeResizeDeferred = (callback: ResizeObserverCallback) => observeResize((e, o) => {
			// It is necessary to defer the callback to the next frame to avoid
			// this resize-observer triggering other resize-observers in a loop
			requestAnimationFrame(() => callback(e, o))
		})
		return html`
			<mo-flex class='cell' alignItems='center' direction=${column.alignment === 'end' ? 'horizontal-reversed' : 'horizontal'}
				data-sticky=${ifDefined(this.dataGrid.isUsingSubgrid ? column.sticky : undefined)}
				data-sticking=${column.intersecting === false}
				${!column.sticky || column.intersecting || this.dataGrid.isUsingSubgrid ? html.nothing : style({ insetInline: column.stickyColumnInsetInline })}
				${observeResizeDeferred(([entry]) => column.widthInPixels = entry?.contentRect.width ?? 0)}
			>
				<mo-flex direction=${column.alignment === 'end' ? 'horizontal-reversed' : 'horizontal'} alignItems='center'
					${style({ overflow: 'hidden', cursor: 'pointer', flex: '1' })}
					@click=${() => this.sort(column)}
				>
					<div class='headerContent' data-selector=${column.dataSelector}
						${style({ width: '100%', textAlign: column.alignment })}
						${!column.description ? html.nothing : tooltip(column.description)}
					>${column.heading}</div>

					${sortIcon === undefined ? html.nothing : html`
						${!sortingRank ? html.nothing : html`<span class='sort-rank'>${sortingRank}</span>`}
						<mo-icon ${style({ color: 'var(--mo-color-accent)' })} icon=${ifDefined(sortIcon)}></mo-icon>
					`}
				</mo-flex>
				${!this.dataGrid.isUsingSubgrid ? html.nothing : html`
					<mo-data-grid-header-separator
						?data-last=${columns.length - 1 === index}
						.dataGrid=${this.dataGrid as any}
						.column=${this.dataGrid.visibleColumns[index]}
					></mo-data-grid-header-separator>
				`}
			</mo-flex>
		`
	}

	private get moreTemplate() {
		return this.dataGrid.hasToolbar || this.dataGrid.sidePanelHidden ? html.nothing : html`
			<mo-flex class='more' alignItems='end' justifyContent='center' ${this.getResizeObserver('moreColumnWidthInPixels')}>
				<mo-icon-button dense icon='settings' ${style({ color: 'var(--mo-color-accent)', fontSize: 'large' })}
					@click=${() => this.dataGrid.navigateToSidePanelTab(this.dataGrid.sidePanelTab ? undefined : DataGridSidePanelTab.Settings)}
				></mo-icon-button>
			</mo-flex>
		`
	}

	private getResizeObserver(property: keyof DataGrid<TData>) {
		// @ts-expect-error Readonly property set here
		return observeResize(([entry]) => this.dataGrid[property] = entry?.contentRect.width ?? 0)
	}

	private sort(column: DataGridColumn<TData>) {
		if (column.sortable === false) {
			return
		}

		const defaultSortingStrategy = DataGridSortingStrategy.Descending
		const sortDataSelector = column.sortDataSelector
		const sortingDefinition = column.sortingDefinition

		if (KeyboardController.shift || KeyboardController.meta || KeyboardController.ctrl) {
			const sortings = this.dataGrid.getSorting()
			if (sortingDefinition?.selector !== sortDataSelector) {
				this.dataGrid.handleSortChange([...sortings, { selector: sortDataSelector, strategy: defaultSortingStrategy }])
			} else if (sortingDefinition.strategy === DataGridSortingStrategy.Descending) {
				this.dataGrid.handleSortChange(
					sortings.map(x => x.selector !== sortDataSelector ? x : {
						selector: sortDataSelector,
						strategy: DataGridSortingStrategy.Ascending,
					})
				)
			} else {
				this.dataGrid.handleSortChange(this.dataGrid.getSorting().filter(x => x.selector !== sortDataSelector))
			}
		} else {
			if (sortingDefinition?.selector !== sortDataSelector) {
				this.dataGrid.handleSortChange({ selector: sortDataSelector, strategy: defaultSortingStrategy })
			} else if (sortingDefinition.strategy === DataGridSortingStrategy.Descending) {
				this.dataGrid.handleSortChange({ selector: sortDataSelector, strategy: DataGridSortingStrategy.Ascending })
			} else {
				this.dataGrid.handleSortChange(undefined)
			}
		}

		this.requestUpdate()
	}

	private toggleAllDetails() {
		this.dataGrid.toggleRowDetails()
		this.requestUpdate()
	}

	private readonly handleSelectionChange = (e: CustomEvent) => {
		const selected = (e.target as Checkbox).selected
		if (selected === true) {
			this.dataGrid.selectAll()
		} else if (selected === false) {
			this.dataGrid.deselectAll()
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-header': DataGridHeader<unknown>
	}
}