import { component, Component, css, html, ifDefined, property, event, join, style } from '@a11d/lit'
import { KeyboardController } from '@3mo/keyboard-controller'
import { Checkbox } from '@3mo/checkbox'
import { DataGridSelectionMode, DataGridSortingStrategy, ColumnDefinition, DataGrid, DataGridSidePanelTab } from './index.js'

@component('mo-data-grid-header')
export class DataGridHeader<TData> extends Component {
	@event() readonly pageChange!: EventDispatcher<number>
	@event() readonly modeSelectionChange!: EventDispatcher<string>

	@property({ type: Object }) dataGrid!: DataGrid<TData, any>
	@property() selection: CheckboxSelection = false
	@property({ type: Boolean, reflect: true }) overlayOpen = false

	protected override connected() {
		this.dataGrid.dataChange.subscribe(this.handleDataGridDataChange)
		this.dataGrid.selectionChange.subscribe(this.handleDataGridSelectionChange)
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

			#header {
				border-top: var(--mo-data-grid-border);
				border-bottom: var(--mo-data-grid-border);
				position: relative;
				height: var(--mo-data-grid-header-height);
				background: var(--mo-data-grid-header-background);
			}

			.headerContent {
				padding: 0 var(--mo-data-grid-cell-padding, 3px);
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
			'1fr',
			this.dataGrid.moreColumnWidth
		].filter((c): c is string => c !== undefined).join(' ')
	}

	private get separatorAdjustedColumns() {
		return this.dataGrid.dataColumnsWidths.join(' var(--mo-data-grid-columns-gap) ')
	}

	protected override get template() {
		return html`
			<mo-grid id='header' columns=${this.skeletonColumns} columnGap='var(--mo-data-grid-columns-gap)'>
				${this.detailsExpanderTemplate}
				${this.selectionTemplate}
				${this.contentTemplate}
				${this.moreTemplate}
			</mo-grid>
		`
	}

	private get detailsExpanderTemplate() {
		return this.dataGrid.hasDetails === false ? html.nothing : html`
			<mo-flex justifyContent='center' alignItems='center'>
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
			<mo-flex justifyContent='center' alignItems='center'>
				${this.dataGrid.selectionMode !== DataGridSelectionMode.Multiple ? html.nothing : html`
					<mo-checkbox ${style({ position: 'absolute' })} .selected=${this.selection} @change=${this.handleSelectionChange}></mo-checkbox>
				`}
			</mo-flex>
		`
	}

	private get contentTemplate() {
		return html`
			<mo-grid columns=${this.separatorAdjustedColumns}>
				${join(this.dataGrid.visibleColumns.map(column => this.getHeaderCellTemplate(column)), index => html`
					<mo-data-grid-header-separator
						.dataGrid=${this.dataGrid as any}
						.column=${this.dataGrid.visibleColumns[index]}
						@columnUpdate=${() => this.dataGrid.requestUpdate()}
					></mo-data-grid-header-separator>
				`)}
			</mo-grid>
		`
	}

	private getHeaderCellTemplate(column: ColumnDefinition<TData>) {
		const sortingDefinition = this.dataGrid.getSortingDefinition(column)
		const sortIcon = !sortingDefinition ? undefined : sortingDefinition.strategy === DataGridSortingStrategy.Ascending ? 'arrow_upward' : 'arrow_downward'
		const sortingRank = !sortingDefinition || this.dataGrid.getSorting().length <= 1 ? undefined : sortingDefinition.rank

		return html`
			<mo-flex direction=${column.alignment === 'end' ? 'horizontal-reversed' : 'horizontal'} alignItems='center'
				${style({ overflow: 'hidden', position: 'relative', cursor: 'pointer', userSelect: 'none' })}
				@click=${() => this.sort(column)}
			>
				<div class='headerContent' ${style({ width: '100%', textAlign: column.alignment })} title=${column.title || column.heading}>${column.heading}</div>

				${sortIcon === undefined ? html.nothing : html`
					${!sortingRank ? html.nothing : html`<span class='sort-rank'>${sortingRank}</span>`}
					<mo-icon ${style({ color: 'var(--mo-color-accent)' })} icon=${ifDefined(sortIcon)}></mo-icon>
				`}
			</mo-flex>
		`
	}

	private get moreTemplate() {
		return this.dataGrid.hasToolbar || this.dataGrid.sidePanelHidden ? html.nothing : html`
			<mo-flex alignItems='center' justifyContent='center' ${style({ marginInlineEnd: '8px', cursor: 'pointer', position: 'relative' })}>
				<mo-icon-button dense icon='settings' ${style({ color: 'var(--mo-color-accent)', fontSize: 'large' })}
					@click=${() => this.dataGrid.navigateToSidePanelTab(this.dataGrid.sidePanelTab ? undefined : DataGridSidePanelTab.Settings)}
				></mo-icon-button>
			</mo-flex>
		`
	}

	private sort(column: ColumnDefinition<TData>) {
		if (column.sortable === false) {
			return
		}

		const defaultSortingStrategy = DataGridSortingStrategy.Descending
		const sortDataSelector = column.sortDataSelector || column.dataSelector

		const sortingDefinition = this.dataGrid.getSortingDefinition(column)

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