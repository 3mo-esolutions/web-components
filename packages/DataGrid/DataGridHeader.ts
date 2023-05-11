import { component, Component, css, html, ifDefined, property, event, join, style, nothing } from '@a11d/lit'
import { Checkbox } from '@3mo/checkbox'
import { DataGridSelectionMode, DataGridSortingStrategy, ColumnDefinition, DataGrid, DataGridSidePanelTab } from './index.js'

@component('mo-data-grid-header')
export class DataGridHeader<TData> extends Component {
	@event() readonly pageChange!: EventDispatcher<number>
	@event() readonly modeSelectionChange!: EventDispatcher<string>

	@property({ type: Object }) dataGrid!: DataGrid<TData, any>
	@property() selection: CheckboxValue = 'unchecked'
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
			this.selection = 'unchecked'
		} else if (selectedData.length === this.dataGrid.dataLength) {
			this.selection = 'checked'
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
				font-size: var(--mo-font-size-s);
			}

			#grdHeader {
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
			<mo-grid id='grdHeader' columns=${this.skeletonColumns} columnGap='var(--mo-data-grid-columns-gap)'>
				${this.detailsExpanderTemplate}
				${this.selectionTemplate}
				${this.contentTemplate}
				${this.moreTemplate}
			</mo-grid>
		`
	}

	private get detailsExpanderTemplate() {
		return this.dataGrid.hasDetails === false ? nothing : html`
			<mo-flex justifyContent='center' alignItems='center'>
				${!this.dataGrid.hasDetails || !this.dataGrid.multipleDetails ? nothing : html`
					<mo-icon-button dense ${style({ padding: '-10px 0px 0 -10px' })}
						${style({ display: 'inherit' })}
						icon=${this.areAllDetailsOpen ? 'unfold_less' : 'unfold_more'}
						@click=${() => this.toggleAllDetails()}
					></mo-icon-button>
				`}
			</mo-flex>
		`
	}

	private get selectionTemplate() {
		return this.dataGrid.hasSelection === false ? nothing : html`
			<mo-flex justifyContent='center' alignItems='center'>
				${this.dataGrid.selectionMode !== DataGridSelectionMode.Multiple ? nothing : html`
					<mo-checkbox ${style({ position: 'absolute' })} value=${this.selection} @change=${this.handleSelectionChange}></mo-checkbox>
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
		const sortIcon = !this.dataGrid.sorting || !column.dataSelector || this.dataGrid.sorting.selector !== column.dataSelector ? undefined
			: this.dataGrid.sorting.strategy === DataGridSortingStrategy.Ascending ? 'arrow_upward' : 'arrow_downward'

		return html`
			<mo-flex direction=${column.alignment === 'end' ? 'horizontal-reversed' : 'horizontal'} alignItems='center'
				${style({ overflow: 'hidden', position: 'relative', cursor: 'pointer', userSelect: 'none' })}
				@click=${() => this.sort(column)}
			>
				<div class='headerContent' ${style({ width: '100%', textAlign: column.alignment })} title=${column.title || column.heading}>${column.heading}</div>

				${sortIcon === undefined ? nothing : html`
					<mo-icon ${style({ color: 'var(--mo-color-accent)' })} icon=${ifDefined(sortIcon)}></mo-icon>
				`}
			</mo-flex>
		`
	}

	private get moreTemplate() {
		return this.dataGrid.hasToolbar || this.dataGrid.sidePanelHidden ? nothing : html`
			<mo-flex alignItems='center' justifyContent='center' ${style({ marginInlineEnd: '8px', cursor: 'pointer', position: 'relative' })}>
				<mo-icon-button dense icon='settings' ${style({ color: 'var(--mo-color-accent)', fontSize: 'var(--mo-font-size-l)' })}
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

		if (this.dataGrid.sorting?.selector !== column.dataSelector) {
			this.dataGrid.handleSortChange({ selector: column.dataSelector, strategy: defaultSortingStrategy })
		} else if (this.dataGrid.sorting.strategy === DataGridSortingStrategy.Descending) {
			this.dataGrid.handleSortChange({ selector: column.dataSelector, strategy: DataGridSortingStrategy.Ascending })
		} else {
			this.dataGrid.handleSortChange(undefined)
		}

		this.requestUpdate()
	}

	private get areAllDetailsOpen() {
		return this.dataGrid.detailedRows.length !== 0
			&& this.dataGrid.detailedRows.every(row => row.detailsOpen)
	}

	private async toggleAllDetails() {
		if (this.areAllDetailsOpen) {
			await this.dataGrid.closeRowDetails()
		} else {
			await this.dataGrid.openRowDetails()
		}
		this.requestUpdate()
	}

	private readonly handleSelectionChange = (e: CustomEvent) => {
		const selection = (e.target as Checkbox).value
		if (selection === 'checked') {
			this.dataGrid.selectAll()
		} else if (selection === 'unchecked') {
			this.dataGrid.deselectAll()
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-header': DataGridHeader<unknown>
	}
}