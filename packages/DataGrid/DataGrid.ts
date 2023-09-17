import { property, component, Component, html, css, live, query, nothing, ifDefined, PropertyValues, event, queryAll, style, literal, staticHtml, HTMLTemplateResult, cache, state } from '@a11d/lit'
import { NotificationHost } from '@a11d/lit-application'
import { LocalStorage } from '@a11d/local-storage'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
import { SlotController } from '@3mo/slot-controller'
import { tooltip } from '@3mo/tooltip'
import { ThemeController } from '@3mo/theme'
import { observeMutation } from '@3mo/mutation-observer'
import { MediaQueryController } from '@3mo/media-query-observer'
import { observeResize } from '@3mo/resize-observer'
import { Localizer } from '@3mo/localization'
import { ContextMenu } from '@3mo/context-menu'
import { CsvGenerator, ColumnDefinition, DataGridCell, DataGridColumn, DataGridFooter, DataGridHeader, DataGridRow, DataGridSidePanel, DataGridSidePanelTab } from './index.js'

Localizer.register('en', {
	'${count:pluralityNumber} entries selected': [
		'1 entry selected',
		'${count} entries selected',
	]
})

Localizer.register('de', {
	'Exporting excel file': 'Die Excel-Datei wird exportiert',
	'No results': 'Kein Ergebnis',
	'${count:pluralityNumber} entries selected': [
		'1 Eintrag ausgewählt',
		'${count} Einträge ausgewählt',
	],
	'Options': 'Optionen',
	'More Filters': 'Weitere Filter',
	'Deselect All': 'Alle deselektieren',
})

export type DataGridPagination = 'auto' | number

export enum DataGridSelectionMode {
	None = 'none',
	Single = 'single',
	Multiple = 'multiple',
}

export enum DataGridSortingStrategy {
	Descending = 'descending',
	Ascending = 'ascending',
}

export enum DataGridSelectionBehaviorOnDataChange {
	Reset = 'reset',
	Prevent = 'prevent',
	Maintain = 'maintain',
}

export enum DataGridEditability {
	Never = 'never',
	Cell = 'cell',
	Always = 'always',
}

export type DataGridSorting<TData> = {
	selector: KeyPathOf<TData>
	strategy: DataGridSortingStrategy
}

/**
 * @element mo-data-grid
 *
 * @attr data - The data to be displayed in the DataGrid. It is an array of objects, where each object represents a row.
 * @attr columns - The columns to be displayed in the DataGrid. It is an array of objects, where each object represents a column.
 * @attr headerHidden - Whether the header should be hidden.
 * @attr preventVerticalContentScroll - Whether the content should be prevented from scrolling vertically.
 * @attr page - The current page.
 * @attr pagination - The pagination mode. It can be either `auto` or a number.
 * @attr sorting - The sorting mode. It is an object with `selector` and `strategy` properties.
 * @attr selectionMode - The selection mode.
 * @attr isDataSelectable - Whether data of a given row is selectable.
 * @attr selectedData - The selected data.
 * @attr selectOnClick - Whether the row should be selected on click.
 * @attr selectionCheckboxesHidden - Whether the selection checkboxes should be hidden. This activates selection on row click ignoring the `selectOnClick` attribute.
 * @attr selectionBehaviorOnDataChange - The behavior of the selection when the data changes.
 * @attr multipleDetails - Whether multiple details can be opened at the same time.
 * @attr subDataGridDataSelector - The key path of the sub data grid data.
 * @attr hasDataDetail - Whether the data has a detail.
 * @attr detailsOnClick - Whether the details should be opened on click.
 * @attr primaryContextMenuItemOnDoubleClick - The primary context menu item on double click.
 * @attr editability - The editability mode.
 * @attr getRowDetailsTemplate - A function which returns a template for the details of a given row.
 * @attr getRowContextMenuTemplate - A function which returns a template for the context menu of a given row.
 * @attr sidePanelTab - The side panel tab.
 * @attr sidePanelHidden - Whether the side panel should be hidden.
 * @attr selectionToolbarDisabled - Whether the selection toolbar should be disabled.
 * @attr hasAlternatingBackground - Whether the rows should have alternating background.
 * @attr preventFabCollapse - Whether the FAB should be prevented from collapsing.
 *
 * @slot - Use this slot only for declarative DataGrid APIs e.g. setting ColumnDefinitions via `mo-data-grid-columns` tag.
 * @slot toolbar - The horizontal bar above DataGrid's contents.
 * @slot filter - A vertical bar for elements which filter DataGrid's data. It is opened through an icon-button in the toolbar.
 * @slot sum - A horizontal bar in the DataGrid's footer for showing sums. Calculated sums are also placed here by default.
 * @slot settings - A vertical bar for elements which change DataGrid's settings. It is pre-filled with columns' settings and can be opened through an icon-button in the toolbar.
 * @slot fab - A wrapper at the bottom right edge, floating right above the footer, expecting Floating Action Button to be placed in.
 * @slot error-no-content - A slot for displaying an error message when no data is available.
 *
 * @cssprop --mo-data-grid-min-visible-rows - The minimum number of visible rows. Default to 2.5.
 *
 * @fires dataChange {CustomEvent<Array<TData>>}
 * @fires selectionChange {CustomEvent<Array<TData>>}
 * @fires pageChange {CustomEvent<number>}
 * @fires paginationChange {CustomEvent<DataGridPagination | undefined>}
 * @fires columnsChange {CustomEvent<Array<ColumnDefinition<TData>>>}
 * @fires sidePanelOpen {CustomEvent<DataGridSidePanelTab>}
 * @fires sidePanelClose {CustomEvent}
 * @fires sortingChange {CustomEvent<DataGridSorting<TData>>}
 * @fires rowDetailsOpen {CustomEvent<DataGridRow<TData, TDetailsElement>>}
 * @fires rowDetailsClose {CustomEvent<DataGridRow<TData, TDetailsElement>>}
 * @fires rowClick {CustomEvent<DataGridRow<TData, TDetailsElement>>}
 * @fires rowDoubleClick {CustomEvent<DataGridRow<TData, TDetailsElement>>}
 * @fires rowMiddleClick {CustomEvent<DataGridRow<TData, TDetailsElement>>}
 * @fires cellEdit {CustomEvent<DataGridCell<any, TData, TDetailsElement>>}
 */
@component('mo-data-grid')
export class DataGrid<TData, TDetailsElement extends Element | undefined = undefined> extends Component {
	static readonly rowHeight = new LocalStorage<number>('DataGrid.RowHeight', 35)
	static readonly cellRelativeFontSize = new LocalStorage<number>('DataGrid.CellRelativeFontSize', 0.8)
	static readonly pageSize = new LocalStorage<Exclude<DataGridPagination, 'auto'>>('DataGrid.PageSize', 25)
	static readonly hasAlternatingBackground = new LocalStorage('DataGrid.HasAlternatingBackground', true)
	protected static readonly virtualizationThreshold: number = 50

	@event() readonly dataChange!: EventDispatcher<Array<TData>>
	@event() readonly selectionChange!: EventDispatcher<Array<TData>>
	@event() readonly pageChange!: EventDispatcher<number>
	@event() readonly paginationChange!: EventDispatcher<DataGridPagination | undefined>
	@event() readonly columnsChange!: EventDispatcher<Array<ColumnDefinition<TData>>>
	@event() readonly sidePanelOpen!: EventDispatcher<DataGridSidePanelTab>
	@event() readonly sidePanelClose!: EventDispatcher
	@event() readonly sortingChange!: EventDispatcher<DataGridSorting<TData> | undefined>
	@event() readonly rowDetailsOpen!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowDetailsClose!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowClick!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowDoubleClick!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowMiddleClick!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly cellEdit!: EventDispatcher<DataGridCell<any, TData, TDetailsElement>>

	@property({ type: Array }) data = new Array<TData>()
	@property({ type: Array }) columns = new Array<ColumnDefinition<TData>>()

	@property({ type: Boolean, reflect: true }) headerHidden = false
	@property({ type: Boolean, reflect: true }) preventVerticalContentScroll = false
	@property({ type: Number }) page = 1
	@property({ reflect: true, converter: (value: string | null | undefined) => value === null || value === undefined ? undefined : Number.isNaN(Number(value)) ? value : Number(value) }) pagination?: DataGridPagination

	@property({ type: Object }) sorting?: DataGridSorting<TData>

	@property({ reflect: true }) selectionMode = DataGridSelectionMode.None
	@property({ type: Object }) isDataSelectable?: (data: TData) => boolean
	@property({ type: Array }) selectedData = new Array<TData>()
	@property({ type: Boolean }) selectOnClick = false
	@property({ type: Boolean }) selectionCheckboxesHidden = false
	@property() selectionBehaviorOnDataChange = DataGridSelectionBehaviorOnDataChange.Reset

	@property({ type: Object }) getRowDetailsTemplate?: (data: TData) => HTMLTemplateResult
	@property({ type: Boolean }) multipleDetails = false
	@property({ updated: subDataGridSelectorChanged }) subDataGridDataSelector?: KeyPathOf<TData>
	@property({ type: Object }) hasDataDetail?: (data: TData) => boolean
	@property({ type: Boolean }) detailsOnClick = false
	@property({ type: Array }) protected openDetailedData = new Array<TData>()

	@property({ type: Object }) getRowContextMenuTemplate?: (data: Array<TData>) => HTMLTemplateResult
	@property({ type: Boolean }) primaryContextMenuItemOnDoubleClick = false

	@property({ reflect: true }) editability = DataGridEditability.Never

	@property() sidePanelTab: DataGridSidePanelTab | undefined
	@property({ type: Boolean }) sidePanelHidden = false
	@property({ type: Boolean }) selectionToolbarDisabled = false
	@property({ type: Boolean }) hasAlternatingBackground = DataGrid.hasAlternatingBackground.value

	@property({ type: Boolean }) preventFabCollapse = false
	@property({ type: Boolean, reflect: true }) protected fabSlotCollapsed = false

	@state({
		updated(this: DataGrid<TData, TDetailsElement>) {
			const fontSize = Math.max(0.8, Math.min(1.2, this.cellFontSize))
			this.style.setProperty('--mo-data-grid-cell-font-size', `${fontSize}rem`)
		}
	}) cellFontSize = DataGrid.cellRelativeFontSize.value

	@queryAll('[mo-data-grid-row]') readonly rows!: Array<DataGridRow<TData, TDetailsElement>>
	@query('mo-data-grid-header') readonly header?: DataGridHeader<TData>
	@query('#rowsContainer') private readonly rowsContainer?: HTMLElement
	@query('mo-data-grid-footer') private readonly footer?: DataGridFooter<TData>
	@query('mo-data-grid-side-panel') private readonly sidePanel?: DataGridSidePanel<TData>
	@query('slot[name=column]') private readonly columnsSlot?: HTMLSlotElement

	lastActiveSelection?: { data: TData, selected: boolean }

	setPage(page: number) {
		this.page = page
		this.pageChange.dispatch(page)
	}

	handlePageChange(page: number) {
		this.setPage(page)
	}

	setPagination(pagination?: DataGridPagination) {
		this.pagination = pagination
		this.paginationChange.dispatch(pagination)
	}

	handlePaginationChange(pagination?: DataGridPagination) {
		this.setPagination(pagination)
	}

	setData(data: Array<TData>, selectionBehavior = this.selectionBehaviorOnDataChange) {
		this.data = data
		switch (selectionBehavior) {
			case DataGridSelectionBehaviorOnDataChange.Reset:
				this.deselectAll()
				break
			case DataGridSelectionBehaviorOnDataChange.Maintain:
				this.select(this.previouslySelectedData)
				break
		}
		this.dataChange.dispatch(data)
	}

	selectAll() {
		if (this.selectionMode === DataGridSelectionMode.Multiple) {
			this.select([...this.data])
		}
	}

	deselectAll() {
		this.select([])
	}

	select(data: Array<TData>) {
		if (this.hasSelection) {
			const selectableData = data.filter(d => this.isSelectable(d))
			this.selectedData = selectableData
			this.selectionChange.dispatch(selectableData)
		}
	}

	isSelectable(data: TData) {
		return this.isDataSelectable?.(data) ?? true
	}

	get detailedData() {
		return this.data.filter(data => this.hasDetail(data))
	}

	get hasDetails() {
		return !!this.getRowDetailsTemplate && this.detailedData.length > 0
	}

	hasDetail(data: TData) {
		const hasAutomatedSubDataGrid = !this.subDataGridDataSelector || this.subDataGridDataSelector && Array.isArray(getValueByKeyPath(data, this.subDataGridDataSelector))
		return hasAutomatedSubDataGrid && (this.hasDataDetail?.(data) ?? true)
	}

	get allRowDetailsOpen() {
		return this.openDetailedData.length === this.detailedData.length
	}

	openRowDetails() {
		this.openDetailedData = this.detailedData
	}

	closeRowDetails() {
		this.openDetailedData = []
	}

	toggleRowDetails() {
		if (this.allRowDetailsOpen) {
			this.closeRowDetails()
		} else {
			this.openRowDetails()
		}
	}

	sort(sorting?: DataGridSorting<TData>) {
		this.sorting = sorting
		this.sortingChange.dispatch(sorting)
	}

	unsort() {
		this.sort(undefined)
	}

	handleSortChange(sorting?: DataGridSorting<TData>) {
		this.sort(sorting)
	}

	setColumns(columns: Array<ColumnDefinition<TData>>) {
		this.columns = columns
		this.columnsChange.dispatch(columns)
		this.requestUpdate()
	}

	extractColumnsIfNotSetExplicitly() {
		if (this.columns.length === 0) {
			this.extractColumns()
		}
	}

	extractColumns() {
		const extractedColumns = this.elementExtractedColumns.length > 0
			? this.elementExtractedColumns
			: this.autoGeneratedColumns
		this.setColumns(extractedColumns)
	}

	handleEdit(data: TData, dataSelector: KeyPathOf<TData>, value: KeyPathValueOf<TData, KeyPathOf<TData>> | undefined) {
		const row = this.rows.find(r => r.data === data)
		const cell = row?.cells.find(c => c.dataSelector === dataSelector)
		if (row && cell && value !== undefined && cell.value !== value) {
			row.requestUpdate()
			setValueByKeyPath(data, dataSelector, value)
			this.cellEdit.dispatch(cell)
		}
	}

	navigateToSidePanelTab(tab?: DataGridSidePanelTab) {
		this.sidePanelTab = tab
		!tab ? this.sidePanelClose.dispatch() : this.sidePanelOpen.dispatch(tab)
	}

	exportExcelFile() {
		try {
			const selectors = this.visibleColumns.map(c => c.dataSelector)
			CsvGenerator.generate(this.data, selectors)
			NotificationHost.instance?.notifyInfo(t('Exporting excel file'))
		} catch (error: any) {
			NotificationHost.instance?.notifyError(error.message)
			throw error
		}
	}

	get hasSelection() {
		return this.selectionMode !== DataGridSelectionMode.None
	}

	get hasContextMenu() {
		return this.getRowContextMenuTemplate !== undefined
	}

	get toolbarElements() {
		return Array.from(this.children).filter(c => c.slot === 'toolbar' && c.getAttribute('hidden') !== '')
	}

	get filterElements() {
		return Array.from(this.children).filter(c => c.slot === 'filter' && c.getAttribute('hidden') !== '')
	}

	get hasToolbar() {
		return this.toolbarElements.length > 0
	}

	get hasFilters() {
		return this.filterElements.length > 0
	}

	get hasSums() {
		const hasSums = !!this.columns.find(c => c.sumHeading) || !!this.querySelector('* [slot="sum"]') || !!this.renderRoot?.querySelector('slot[name="sum"] > *')
		this.toggleAttribute('hasSums', hasSums)
		return hasSums
	}

	get hasFabs() {
		const hasFabs = !!this.querySelector('* [slot=fab]') || !!this.renderRoot?.querySelector('#fab *:not(slot[name=fab])')
		this.toggleAttribute('hasFabs', hasFabs)
		return hasFabs
	}

	get hasPagination() {
		return this.pagination !== undefined
	}

	get supportsDynamicPageSize() {
		return this.hasPagination
	}

	get pageSize() {
		const dynamicPageSize = (pageSize: number) =>
			this.supportsDynamicPageSize ? pageSize : DataGrid.pageSize.value

		if (!this.pagination) {
			return dynamicPageSize(this.data.length)
		}

		if (this.pagination === 'auto') {
			const rowsHeight = this.rowsContainer?.clientHeight
			const rowHeight = DataGrid.rowHeight.value
			const pageSize = Math.floor((rowsHeight || 0) / rowHeight) || 1
			return dynamicPageSize(pageSize)
		}

		return this.pagination
	}

	get hasFooter() {
		const value = this.hasPagination || this.hasSums
		this.toggleAttribute('hasFooter', value)
		return value
	}

	get dataLength() {
		return this.data.length
	}

	get maxPage() {
		return Math.ceil(this.dataLength / this.pageSize)
	}

	get hasNextPage() {
		return this.page !== this.maxPage
	}

	protected readonly slotController = new SlotController(this, async () => {
		this.hasSums
		this.hasFabs
		await this.updateComplete
		this.style.setProperty('--mo-data-grid-fab-slot-width', `${this.renderRoot.querySelector('slot[name=fab]')?.getBoundingClientRect().width || 75}px`)
	})

	protected readonly instanceofAttributeController = new InstanceofAttributeController(this)

	protected readonly smallScreenObserverController = new MediaQueryController(this, '(max-width: 768px)')

	readonly themeController = new ThemeController(this)

	protected override updated(...parameters: Parameters<Component['updated']>) {
		this.header?.requestUpdate()
		this.sidePanel?.requestUpdate()
		this.footer?.requestUpdate()
		this.rows.forEach(row => row.requestUpdate())
		return super.updated(...parameters)
	}

	protected override firstUpdated(props: PropertyValues) {
		super.firstUpdated(props)
		this.extractColumnsIfNotSetExplicitly()
		this.cellEdit.subscribe(() => this.requestUpdate())
		this.setPage(1)
	}

	static override get styles() {
		return css`
			:host {
				--mo-data-grid-column-details-width: 20px;
				--mo-data-grid-column-selection-width: 40px;
				--mo-data-grid-column-more-width: 20px;

				--mo-data-grid-header-height: 32px;
				--mo-data-grid-footer-min-height: 40px;
				--mo-data-grid-toolbar-padding: 0px 14px 14px 14px;
				--mo-data-grid-border: 1px solid var(--mo-color-transparent-gray-3);

				/* --mo-data-grid-columns Generated in JS */
				--mo-data-grid-columns-gap: 6px;

				--mo-data-grid-row-tree-line-width: 8px;
				--mo-details-data-grid-start-margin: 26px;
				--mo-data-grid-cell-padding: 3px;

				--mo-data-grid-selection-background: rgba(var(--mo-color-accent-base), 0.5);

				--mo-data-grid-row-height: ${DataGrid.rowHeight.value}px;
				display: flex;
				flex-direction: column;
				height: 100%;
				overflow-x: hidden;
			}

			:host([data-theme=light]) {
				--mo-data-grid-alternating-background: rgba(var(--mo-color-foreground-base), 0.05);
			}

			:host([data-theme=dark]) {
				--mo-data-grid-alternating-background: rgba(var(--mo-color-background-base), 0.2);
			}

			:host([preventVerticalContentScroll]) mo-scroller {
				overflow-y: hidden;
			}

			:host([preventVerticalContentScroll]) mo-scroller::part(container) {
				position: relative;
			}

			:host(:not([selectionMode="none"])) {
				--mo-data-grid-row-tree-line-width: 18px;
			}

			:host([hasDetails]) {
				--mo-data-grid-row-tree-line-width: 18px;
			}

			#toolbar {
				position: relative;
				padding: var(--mo-data-grid-toolbar-padding);
			}

			#toolbar mo-icon-button {
				align-self: flex-start;
				color: var(--mo-color-gray);
			}

			#flexSelectionToolbar {
				background: var(--mo-color-surface);
				position: absolute;
				inset: 0px;
				width: 100%;
				height: 100%;
				z-index: 1;
			}

			#flexSelectionToolbar > mo-flex {
				background: var(--mo-data-grid-selection-background);
				height: 100%;
				align-items: center;
			}

			#flexSelectionToolbar mo-icon-button {
				align-self: center;
				color: var(--mo-color-foreground);
			}

			#flexActions {
				align-items: center;
				justify-content: center;
				padding-inline: 14px 6px;
				margin: 6px 0;
				cursor: pointer;
				background: var(--mo-color-accent-transparent);
				height: calc(100% - calc(2 * 6px));
				max-height: 45px;
			}

			#fab {
				position: absolute;
				top: -72px;
				inset-inline-end: 16px;
				transition: var(--mo-data-grid-fab-transition, 250ms);
			}

			:host([hasFooter]) #fab {
				top: -28px;
			}

			:host([fabSlotCollapsed][hasFabs]) #fab {
				transform: scale(0);
				opacity: 0;
			}

			mo-data-grid-footer {
				transition: var(--mo-data-grid-fab-transition, 250ms);
			}

			:host([hasSums][hasFabs]:not([fabSlotCollapsed])) mo-data-grid-footer {
				--mo-data-grid-footer-trailing-padding: calc(var(--mo-data-grid-fab-slot-width, 56px) + 16px);
			}

			slot[name=fab] {
				display: block;
				z-index: 1;
			}

			mo-empty-state, ::slotted(mo-empty-state) {
				height: 100%;
			}

			#overlayModeContainer {
				position: relative;
				height: 100%;
				width: 100%;
			}

			#overlayModeContainer mo-data-grid-side-panel {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
				z-index: 1;
				background-color: var(--mo-color-surface);
			}
		`
	}

	protected override get template() {
		return html`
			<slot name='column' hidden ${observeMutation(() => this.requestUpdate())}>${this.columnsTemplate}</slot>
			${this.toolbarTemplate}
			${this.smallScreenObserverController.matches ? this.overlayModeTemplate : this.splitterModeTemplate}
		`
	}

	private get splitterModeTemplate() {
		return html`
			<mo-splitter direction='horizontal-reversed' ${style({ height: '100%' })} .resizerTemplate=${html`
				<mo-splitter-resizer-line style='--mo-splitter-resizer-line-thickness: 1px; --mo-splitter-resizer-line-idle-background: var(--mo-color-transparent-gray-3); --mo-splitter-resizer-line-horizontal-transform: scaleX(5);'></mo-splitter-resizer-line>
			`}>
				${cache(this.sidePanelTab === undefined ? nothing : html`
					<mo-splitter-item size='min(25%, 300px)' min='max(15%, 250px)' max='clamp(100px, 50%, 750px)'>
						${this.sidePanelTemplate}
					</mo-splitter-item>
				`)}

				<mo-splitter-item min='0px' ${style({ position: 'relative' })}>
					${this.dataGridTemplate}
				</mo-splitter-item>
			</mo-splitter>
		`
	}

	private get overlayModeTemplate() {
		return html`
			<mo-flex id='overlayModeContainer'>
				${this.dataGridTemplate}
				${this.sidePanelTab === undefined ? nothing : this.sidePanelTemplate}
			</mo-flex>
		`
	}

	private get sidePanelTemplate() {
		return html`
			<mo-data-grid-side-panel
				.dataGrid=${this as any}
				tab=${ifDefined(this.sidePanelTab)}
			>
				<slot slot='settings' name='settings'>${this.settingsDefaultTemplate}</slot>
				<slot slot='filter' name='filter'>${this.filtersDefaultTemplate}</slot>
			</mo-data-grid-side-panel>
		`
	}

	protected get settingsDefaultTemplate() {
		return nothing
	}

	protected get filtersDefaultTemplate() {
		return nothing
	}

	protected get columnsTemplate() {
		return nothing
	}

	protected get rowElementTag() {
		return literal`mo-data-grid-default-row`
	}

	protected get fabTemplate() {
		// These also update the respective attributes for now
		this.hasSums
		this.hasFabs
		return html`
			<slot name='fab' @slotchange=${() => { this.hasSums; this.hasFabs }}></slot>
		`
	}

	protected get contentTemplate() {
		return !this.data.length ? this.noContentTemplate : this.rowsTemplate
	}

	protected get noContentTemplate() {
		return html`
			<slot name='error-no-content'>
				<mo-empty-state icon='youtube_searched_for'>${t('No results')}</mo-empty-state>
			</slot>
		`
	}

	protected get dataGridTemplate() {
		this.provideCssColumnsProperties()
		this.toggleAttribute('hasDetails', this.hasDetails)
		return html`
			<mo-flex ${style({ width: '*', position: 'relative' })}>
				<mo-grid ${style({ height: '*' })} rows='* auto'>
					<mo-scroller ${style({ minHeight: 'var(--mo-data-grid-content-min-height, calc(var(--mo-data-grid-min-visible-rows, 2.5) * var(--mo-data-grid-row-height) + var(--mo-data-grid-header-height)))', paddingBottom: '2px' })}>
						<mo-grid ${style({ height: '100%' })} rows='auto *'>
							${this.headerTemplate}
							${this.contentTemplate}
						</mo-grid>
					</mo-scroller>
					${this.footerTemplate}
				</mo-grid>
			</mo-flex>
		`
	}

	protected get headerTemplate() {
		return this.headerHidden ? nothing : html`
			<mo-data-grid-header .dataGrid=${this as any}></mo-data-grid-header>
		`
	}

	private get rowsTemplate() {
		const getRowTemplate = (data: TData, index: number) => this.getRowTemplate(data, index)
		const shallVirtualize = !this.preventVerticalContentScroll && this.renderData.length > DataGrid.virtualizationThreshold
		const content = shallVirtualize === false
			? this.renderData.map(getRowTemplate)
			: html`<mo-virtualized-scroller .items=${this.renderData} .getItemTemplate=${getRowTemplate as any}></mo-virtualized-scroller>`
		return html`
			<mo-scroller id='rowsContainer'
				${style({ gridRow: '2', gridColumn: '1 / last-line' })}
				${observeResize(() => this.requestUpdate())}
				@scroll=${this.handleScroll}
			>
				${content}
			</mo-scroller>
		`
	}

	protected getRowTemplate(data: TData, index: number) {
		return staticHtml`
			<${this.rowElementTag} part='row'
				.dataGrid=${this as any}
				.data=${data}
				?data-has-alternating-background=${this.hasAlternatingBackground && index % 2 === 1}
				?selected=${live(this.selectedData.includes(data))}
				?detailsOpen=${live(this.openDetailedData.includes(data))}
				@detailsOpenChange=${(event: CustomEvent<boolean>) => this.handleRowDetailsOpenChange(data, event.detail)}
			></${this.rowElementTag}>
		`
	}

	private handleRowDetailsOpenChange(data: TData, open: boolean) {
		if (this.hasDetail(data) === false) {
			return
		}

		if (open && this.multipleDetails === false) {
			this.closeRowDetails()
		}

		this.openDetailedData = open
			? [...this.openDetailedData, data]
			: this.openDetailedData.filter(d => d !== data)
	}

	protected get footerTemplate() {
		return html`
			<mo-flex ${style({ position: 'relative' })}>
				<mo-flex id='fab' direction='vertical-reversed' gap='8px'>
					${this.fabTemplate}
				</mo-flex>
				${this.hasFooter === false ? nothing : html`
					<mo-data-grid-footer
						.dataGrid=${this as any}
						page=${this.page}
					>
						<slot name='sum' slot='sum'>${this.sumDefaultTemplate}</slot>
					</mo-data-grid-footer>
				`}
			</mo-flex>
		`
	}

	get sumsData() {
		return this.selectedData.length > 0 ? this.selectedData : this.renderData
	}

	get sumsTemplate() {
		return html`
			<mo-flex direction='horizontal' gap='10px' wrap='wrap-reverse' alignItems='center' ${style({ padding: '2px 4px' })}>
				${this.columns.map(column => this.getSumTemplate(column))}
			</mo-flex>
		`
	}

	getSumTemplate(column: ColumnDefinition<TData>) {
		if (column.sumHeading === undefined || column.getSumTemplate === undefined) {
			return
		}

		const sum = this.sumsData
			.map(data => parseFloat(getValueByKeyPath(data, column.dataSelector) as unknown as string))
			.filter(n => isNaN(n) === false)
			.reduce(((a, b) => a + b), 0)
			|| 0

		return html`
			<mo-data-grid-footer-sum heading=${column.sumHeading + ''} ${style({ color: this.selectedData.length > 0 ? 'var(--mo-color-accent)' : 'currentColor' })}>
				${column.getSumTemplate(sum)}
			</mo-data-grid-footer-sum>
		`
	}

	protected get toolbarTemplate() {
		return this.hasToolbar === false ? nothing : html`
			<mo-flex id='toolbar' direction='horizontal' gap='8px' wrap='wrap' justifyContent='end' alignItems='center'>
				<mo-flex direction='horizontal' alignItems='inherit' gap='8px' wrap='wrap' ${style({ width: '*' })}>
					<slot name='toolbar'>${this.toolbarDefaultTemplate}</slot>
				</mo-flex>
				<mo-flex direction='horizontal' gap='8px'>
					<slot name='toolbarAction'>${this.toolbarActionDefaultTemplate}</slot>
					${this.toolbarActionsTemplate}
					${this.selectionToolbarTemplate}
				</mo-flex>
			</mo-flex>
		`
	}

	protected get toolbarDefaultTemplate() {
		return nothing
	}

	protected get toolbarActionDefaultTemplate() {
		return nothing
	}

	protected get sumDefaultTemplate() {
		return nothing
	}

	protected get selectionToolbarTemplate() {
		return this.selectionToolbarDisabled === true || this.selectedData.length === 0 ? nothing : html`
			<mo-flex id='flexSelectionToolbar'>
				<mo-flex direction='horizontal' gap='30px' ${style({ placeSelf: 'stretch' })}>
					<div ${style({ fontWeight: '500', margin: '0 6px' })}>
						${t('${count:pluralityNumber} entries selected', { count: this.selectedData.length })}
					</div>
					${!this.getRowContextMenuTemplate ? nothing : html`
						<mo-flex id='flexActions' direction='horizontal' @click=${(e: PointerEvent) => ContextMenu.open(e, this.getRowContextMenuTemplate?.(this.selectedData) ?? nothing)}>
							<div ${style({ width: '*' })}>${t('Options')}</div>
							<mo-icon-button dense icon='arrow_drop_down' ${style({ display: 'flex', alignItems: 'center', justifyContent: 'center' })}></mo-icon-button>
						</mo-flex>
					`}
					<div ${style({ width: '*' })}></div>
					<mo-icon-button icon='close'
						${tooltip(t('Deselect All'))}
						@click=${() => this.deselectAll()}
					></mo-icon-button>
				</mo-flex>
			</mo-flex>
		`
	}

	protected get toolbarActionsTemplate() {
		return html`
			${!this.hasFilters ? nothing : html`
				<mo-icon-button icon='filter_list'
					${tooltip(t('More Filters'))}
					${style({ color: this.sidePanelTab === DataGridSidePanelTab.Filters ? 'var(--mo-color-accent)' : 'var(--mo-color-gray)' })}
					@click=${() => this.navigateToSidePanelTab(this.sidePanelTab === DataGridSidePanelTab.Filters ? undefined : DataGridSidePanelTab.Filters)}
				></mo-icon-button>
			`}

			<mo-icon-button icon='settings'
				${tooltip(t('Settings'))}
				${style({ color: this.sidePanelTab === DataGridSidePanelTab.Settings ? 'var(--mo-color-accent)' : 'var(--mo-color-gray)' })}
				@click=${() => this.navigateToSidePanelTab(this.sidePanelTab === DataGridSidePanelTab.Settings ? undefined : DataGridSidePanelTab.Settings)}
			></mo-icon-button>
		`
	}

	// The reason for not doing this in the CSS is that we need to trim all the 0px values out of the columns
	// because the 'grid column gap' renders a gap no matter if the column is 0px or not
	private provideCssColumnsProperties() {
		this.style.setProperty('--mo-data-grid-content-width', this.dataColumnsWidths.join(' '))
		this.style.setProperty('--mo-data-grid-columns', this.columnsWidths.join(' '))
	}

	get columnsWidths() {
		return [
			this.detailsColumnWidth,
			this.selectionColumnWidth,
			...this.dataColumnsWidths,
			this.moreColumnWidth
		].filter((c): c is string => c !== undefined)
	}

	get detailsColumnWidth() {
		return !this.hasDetails ? undefined : window.getComputedStyle(this).getPropertyValue('--mo-data-grid-column-details-width')
	}

	get selectionColumnWidth() {
		return !this.hasSelection || this.selectionCheckboxesHidden ? undefined : window.getComputedStyle(this).getPropertyValue('--mo-data-grid-column-selection-width')
	}

	get dataColumnsWidths() {
		return this.visibleColumns
			.map(c => c.width)
			.filter((c): c is string => c !== undefined)
	}

	get moreColumnWidth() {
		return this.sidePanelHidden && !this.hasContextMenu ? undefined : window.getComputedStyle(this).getPropertyValue('--mo-data-grid-column-more-width')
	}

	// eslint-disable-next-line @typescript-eslint/member-ordering
	private lastScrollElementTop = 0
	private readonly handleScroll = (e: Event) => {
		if (this.preventFabCollapse === false) {
			if (!e.composed) {
				e.preventDefault()
				e.target?.dispatchEvent(new Event('scroll', { composed: true, bubbles: true }))

				if (this.hasFabs) {
					const targetElement = e.composedPath()[0] as HTMLElement
					const scrollTop = targetElement.scrollTop
					const isUpScrolling = scrollTop <= this.lastScrollElementTop
					this.fabSlotCollapsed = !isUpScrolling
					this.lastScrollElementTop = scrollTop <= 0 ? 0 : scrollTop
				}
			}
		}
	}

	protected get sortedData() {
		const sorting = this.sorting

		if (!sorting) {
			return this.data
		}

		const dataClone = [...this.data]

		const compare = (a: TData, b: TData) => {
			const valueA = getValueByKeyPath(a, sorting.selector) ?? Infinity as any
			const valueB = getValueByKeyPath(b, sorting.selector) ?? Infinity as any
			return valueB?.localeCompare?.(valueA) ?? (valueB - valueA)
		}

		switch (sorting.strategy) {
			case DataGridSortingStrategy.Ascending:
				return dataClone.sort((a, b) => compare(a, b))
			case DataGridSortingStrategy.Descending:
				return dataClone.sort((a, b) => compare(b, a))
		}
	}

	get renderData() {
		if (this.hasPagination === false) {
			return this.sortedData
		}
		const from = (this.page - 1) * this.pageSize
		const to = this.page * this.pageSize
		return this.sortedData.slice(from, to)
	}

	private get elementExtractedColumns(): Array<ColumnDefinition<TData, KeyPathValueOf<TData>>> {
		if (!this.columnsSlot) {
			return []
		}
		const children = this.columnsSlot.children.length > 0 ? Array.from(this.columnsSlot.children) : undefined
		const assigned = this.columnsSlot.assignedElements().length > 0 ? Array.from(this.columnsSlot.assignedElements()) : undefined
		return Array.from(assigned ?? children ?? [])
			.filter((c): c is DataGridColumn<TData, KeyPathValueOf<TData>> => {
				const isColumn = c instanceof DataGridColumn
				if (isColumn) {
					c.dataGrid = this
				}
				return isColumn
			})
			.map(c => c.definition)
	}

	private get autoGeneratedColumns() {
		if (!this.dataLength) {
			return []
		}

		const getDefaultColumnElement = (value: unknown) => {
			switch (typeof value) {
				case 'number':
				case 'bigint':
					return 'mo-data-grid-column-number'
				case 'boolean':
					return 'mo-data-grid-column-boolean'
				default:
					return 'mo-data-grid-column-text'
			}
		}
		const sampleData = this.data[0]
		return Object.keys(sampleData || {})
			.filter(key => !key.startsWith('_'))
			.map(key => {
				const columnElement = document.createElement(getDefaultColumnElement(getValueByKeyPath(sampleData, key as any)))
				columnElement.heading = key.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').slice(1)
				columnElement.dataGrid = key as any
				const definition = columnElement.definition
				columnElement.remove()
				return definition
			}) as Array<ColumnDefinition<TData>>
	}

	get visibleColumns() {
		return this.columns.filter(c => c.hidden === false)
	}

	get previouslySelectedData() {
		const hasId = this.selectedData.every(d => Object.keys(d as any).includes('id'))
		if (hasId) {
			const selectedIds = this.selectedData.map((d: any) => d.id) as Array<number>
			return this.data.filter((d: any) => selectedIds.includes(d.id))
		} else {
			const selectedDataJson = this.selectedData.map(d => JSON.stringify(d))
			return this.data.filter(d => selectedDataJson.includes(JSON.stringify(d)))
		}
	}
}

function subDataGridSelectorChanged<TData>(this: DataGrid<TData>) {
	const selector = this.subDataGridDataSelector

	if (selector === undefined || !!this.getRowDetailsTemplate) {
		return
	}

	this.getRowDetailsTemplate = (data: TData) => html`
		<mo-data-grid ${style({ padding: '0px' })}
			.data=${getValueByKeyPath(data, selector)}
			headerHidden
			sidePanelHidden
			.columns=${this.columns}
			.subDataGridDataSelector=${this.subDataGridDataSelector}
			.hasDataDetail=${this.hasDataDetail}
			.selectionMode=${this.selectionMode}
			.isDataSelectable=${this.isDataSelectable}
			?selectOnClick=${this.selectOnClick}
			?selectionCheckboxesHidden=${this.selectionCheckboxesHidden}
			?primaryContextMenuItemOnDoubleClick=${this.primaryContextMenuItemOnDoubleClick}
			?multipleDetails=${this.multipleDetails}
			?detailsOnClick=${this.detailsOnClick}
			.getRowContextMenuTemplate=${this.getRowContextMenuTemplate}
			editability=${this.editability}
			@rowClick=${(e: CustomEvent<DataGridRow<TData, undefined>>) => this.rowClick.dispatch(e.detail)}
			@rowDoubleClick=${(e: CustomEvent<DataGridRow<TData, undefined>>) => this.rowDoubleClick.dispatch(e.detail)}
			@rowMiddleClick=${(e: CustomEvent<DataGridRow<TData, undefined>>) => this.rowMiddleClick.dispatch(e.detail)}
			@cellEdit=${(e: CustomEvent<DataGridCell<any, TData, undefined>>) => this.cellEdit.dispatch(e.detail)}
		></mo-data-grid>
	`
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid': DataGrid<unknown, undefined>
	}
}