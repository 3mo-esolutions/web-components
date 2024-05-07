import { property, component, Component, html, css, live, query, ifDefined, type PropertyValues, event, style, literal, staticHtml, type HTMLTemplateResult, cache } from '@a11d/lit'
import { NotificationComponent } from '@a11d/lit-application'
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
import { CsvGenerator, DataGridColumnComponent, DataGridSidePanelTab, type DataGridColumn, type DataGridCell, type DataGridFooter, type DataGridHeader, type DataGridRow, type DataGridSidePanel } from './index.js'
import { DataGridSelectionController } from './DataGridSelectionController.js'

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

export type DataGridSortingDefinition<TData> = {
	selector: KeyPathOf<TData>
	strategy: DataGridSortingStrategy
}

export type DataGridSorting<TData> = DataGridSortingDefinition<TData> | Array<DataGridSortingDefinition<TData>>

/**
 * @element mo-data-grid
 *
 * @attr data - The data to be displayed in the DataGrid. It is an array of objects, where each object represents a row.
 * @attr columns - The columns to be displayed in the DataGrid. It is an array of objects, where each object represents a column.
 * @attr headerHidden - Whether the header should be hidden.
 * @attr preventVerticalContentScroll - Whether the content should be prevented from scrolling vertically.
 * @attr virtualizationThreshold - The threshold from which the virtualization will kick in.
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
 * @attr cellFontSize - The font size of the cells relative to the default font size. Defaults @see DataGrid.cellFontSize 's value which defaults to 0.8.
 * @attr rowHeight - The height of the rows in pixels. Defaults to @see DataGrid.rowHeight 's value which defaults to 35.
 * @attr exportable - Whether the DataGrid is exportable. This will show an export button in the footer.
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
 * @cssprop --mo-data-grid-footer-background - The background of the footer.
 * @cssprop --mo-data-grid-cell-padding - The inline padding of the cells. Default to 10px.
 * @cssprop --mo-data-grid-column-sub-row-indentation - The indentation of the first column in the sub row. Default to 10px.
 *
 * @fires dataChange
 * @fires selectionChange
 * @fires pageChange
 * @fires paginationChange
 * @fires columnsChange
 * @fires sidePanelOpen
 * @fires sidePanelClose
 * @fires sortingChange
 * @fires rowDetailsOpen
 * @fires rowDetailsClose
 * @fires rowClick
 * @fires rowDoubleClick
 * @fires rowMiddleClick
 * @fires cellEdit
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
	@event() readonly columnsChange!: EventDispatcher<Array<DataGridColumn<TData>>>
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
	@property({
		type: Array,
		updated(this: DataGrid<TData, TDetailsElement>) {
			this.columns.forEach(column => column.dataGrid = this)
		}
	}) columns = new Array<DataGridColumn<TData>>()

	@property({ type: Boolean, reflect: true }) headerHidden = false
	@property({ type: Boolean, reflect: true }) preventVerticalContentScroll = false
	@property({ type: Number }) virtualizationThreshold = DataGrid.virtualizationThreshold
	@property({ type: Number }) page = 1
	@property({ reflect: true, converter: (value: string | null | undefined) => value === null || value === undefined ? undefined : Number.isNaN(Number(value)) ? value : Number(value) }) pagination?: DataGridPagination

	@property({ type: Object }) sorting?: DataGridSorting<TData>

	@property({ reflect: true }) selectionMode = DataGridSelectionMode.None
	@property({ type: Object }) isDataSelectable?: (data: TData) => boolean
	@property({ type: Array, event: 'selectionChange' }) selectedData = new Array<TData>()
	@property({ type: Boolean }) selectOnClick = false
	@property({ type: Boolean }) selectionCheckboxesHidden = false
	@property() selectionBehaviorOnDataChange = DataGridSelectionBehaviorOnDataChange.Reset

	@property({ type: Object }) getRowDetailsTemplate?: (data: TData) => HTMLTemplateResult
	@property({ type: Boolean }) multipleDetails = false
	@property() subDataGridDataSelector?: KeyPathOf<TData>
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

	@property({ type: Boolean }) exportable = false

	@property({
		type: Number,
		updated(this: DataGrid<TData, TDetailsElement>) {
			const fontSize = Math.max(0.8, Math.min(1.2, this.cellFontSize))
			this.style.setProperty('--mo-data-grid-cell-font-size', `${fontSize}rem`)
		}
	}) cellFontSize = DataGrid.cellRelativeFontSize.value

	@property({
		type: Number,
		updated(this: DataGrid<TData, TDetailsElement>) {
			const rowHeight = Math.max(30, Math.min(60, this.rowHeight))
			this.style.setProperty('--mo-data-grid-row-height', `${rowHeight}px`)
		}
	}) rowHeight = DataGrid.rowHeight.value

	get rows(): Array<DataGridRow<TData, TDetailsElement>> {
		const root = this.shallVirtualize
			? this.renderRoot.querySelector('mo-virtualized-scroller')?.renderRoot?.firstElementChild
			: this.renderRoot
		return [...root?.querySelectorAll('[mo-data-grid-row]') ?? []] as Array<DataGridRow<TData, TDetailsElement>>
	}

	@query('mo-data-grid-header') private readonly header?: DataGridHeader<TData>
	@query('#content') private readonly content?: HTMLElement
	@query('mo-data-grid-footer') private readonly footer?: DataGridFooter<TData>
	@query('mo-data-grid-side-panel') private readonly sidePanel?: DataGridSidePanel<TData>
	@query('slot[name=column]') private readonly columnsSlot?: HTMLSlotElement

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
				this.selectionController.selectPreviouslySelectedData()
				break
		}
		this.dataChange.dispatch(data)
	}

	get hasSelection() {
		return this.selectionController.hasSelection
	}

	selectAll(...parameters: Parameters<typeof this.selectionController.selectAll>) {
		return this.selectionController.selectAll(...parameters)
	}

	deselectAll(...parameters: Parameters<typeof this.selectionController.deselectAll>) {
		return this.selectionController.deselectAll(...parameters)
	}

	select(...parameters: Parameters<typeof this.selectionController.select>) {
		return this.selectionController.select(...parameters)
	}

	isSelectable(...parameters: Parameters<typeof this.selectionController.isSelectable>) {
		return this.selectionController.isSelectable(...parameters)
	}

	get detailedData() {
		return this.data.filter(data => this.hasDetail(data))
	}

	get hasDetails() {
		return !!this.getRowDetailsTemplate && this.detailedData.length > 0
			|| this.data.some(d => !!this.getSubData(d))
	}

	getSubData(data: TData): Array<TData> | undefined {
		if (!this.subDataGridDataSelector) {
			return undefined
		}
		const subValue = getValueByKeyPath(data, this.subDataGridDataSelector)
		return Array.isArray(subValue) && subValue.length > 0 ? subValue : undefined
	}

	hasDetail(data: TData) {
		return !!this.getSubData(data) || (
			this.hasDataDetail?.(data) ??
			[undefined, html.nothing].includes(this.getRowDetailsTemplate?.(data)) === false
		)
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

	setColumns(columns: Array<DataGridColumn<TData>>) {
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

	getRow(data: TData) {
		return this.rows.find(r => r.data === data)
	}

	getCell(data: TData, column: DataGridColumn<TData, unknown>) {
		const row = this.getRow(data)
		return row?.getCell(column)
	}

	handleEdit(data: TData, column: DataGridColumn<TData, unknown>, value: KeyPathValueOf<TData, KeyPathOf<TData>> | undefined) {
		const row = this.getRow(data)
		const cell = row?.getCell(column)
		if (row && cell && value !== undefined && column.dataSelector && cell.value !== value) {
			row.requestUpdate()
			setValueByKeyPath(row, column.dataSelector as any, value)
			this.cellEdit.dispatch(cell)
		}
	}

	navigateToSidePanelTab(tab?: DataGridSidePanelTab) {
		this.sidePanelTab = tab
		!tab ? this.sidePanelClose.dispatch() : this.sidePanelOpen.dispatch(tab)
	}

	exportExcelFile() {
		try {
			CsvGenerator.generate(this)
			NotificationComponent.notifyInfo(t('Exporting excel file'))
		} catch (error: any) {
			NotificationComponent.notifyError(error.message)
			throw error
		}
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
			const rowsHeight = this.content?.clientHeight
			const rowHeight = this.rowHeight
			const pageSize = Math.floor((rowsHeight || 0) / rowHeight) || 1
			return dynamicPageSize(pageSize)
		}

		return this.pagination
	}

	get hasFooter() {
		const value = this.hasPagination || this.hasSums || this.exportable
		this.toggleAttribute('hasFooter', value)
		return value
	}

	get dataLength() {
		return this.flattenedData.length
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

	readonly selectionController = new DataGridSelectionController(this)

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
				--mo-data-grid-column-more-width: 28px;
				--mo-data-grid-cell-padding: 10px;
				--mo-data-grid-header-height: 32px;
				--mo-data-grid-footer-min-height: 40px;
				--mo-data-grid-toolbar-padding: 0px 14px 14px 14px;
				--mo-data-grid-border: 1px solid var(--mo-color-transparent-gray-3);

				--mo-data-grid-row-tree-line-width: 8px;
				--mo-details-data-grid-start-margin: 26px;

				--mo-data-grid-sticky-part-color: var(--mo-color-surface-container-high);

				--mo-data-grid-selection-background: color-mix(in srgb, var(--mo-color-accent), transparent 50%);
				display: flex;
				flex-direction: column;
				height: 100%;
				overflow-x: hidden;
			}

			:host([data-theme=light]) {
				--mo-data-grid-alternating-background: color-mix(in srgb, black, transparent 95%);
			}

			:host([data-theme=dark]) {
				--mo-data-grid-alternating-background: color-mix(in srgb, black, transparent 80%);
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
				inset-inline-end: 16px;
				transition: var(--mo-data-grid-fab-transition, 250ms);
				z-index: 3;
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
				position: absolute;
				inset: 0;
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
				${cache(this.sidePanelTab === undefined ? html.nothing : html`
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
				${this.sidePanelTab === undefined ? html.nothing : this.sidePanelTemplate}
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
		return html.nothing
	}

	protected get filtersDefaultTemplate() {
		return html.nothing
	}

	protected get columnsTemplate() {
		return html.nothing
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
			<mo-grid rows='* auto' ${style({ position: 'relative', height: '100%' })}>
				<mo-scroller
					${style({ minHeight: 'var(--mo-data-grid-content-min-height, calc(var(--mo-data-grid-min-visible-rows, 2.5) * var(--mo-data-grid-row-height) + var(--mo-data-grid-header-height)))' })}
					${observeResize(() => this.requestUpdate())}
					@scroll=${this.handleScroll}
				>
					<mo-grid id='content' autoRows='min-content' columns='var(--mo-data-grid-columns)'>
						${this.headerTemplate}
						${this.contentTemplate}
					</mo-grid>
				</mo-scroller>
				${this.footerTemplate}
			</mo-grid>
		`
	}

	protected get headerTemplate() {
		return this.headerHidden ? html.nothing : html`
			<mo-data-grid-header .dataGrid=${this as any}></mo-data-grid-header>
		`
	}

	private get shallVirtualize() {
		return false && !this.preventVerticalContentScroll && this.renderData.length > this.virtualizationThreshold
	}

	private get rowsTemplate() {
		const getRowTemplate = (data: TData, index: number) => this.getRowTemplate(data, index)
		const content = this.shallVirtualize === false
			? this.renderData.map(getRowTemplate)
			: html`<mo-virtualized-scroller .items=${this.renderData} .getItemTemplate=${getRowTemplate as any} exportparts='row'></mo-virtualized-scroller>`
		return html`
			${content}
		`
	}

	getRowTemplate(data: TData, index?: number, level = 0) {
		return staticHtml`
			<${this.rowElementTag} part='row'
				.level=${level}
				.dataGrid=${this as any}
				.data=${data}
				?data-has-alternating-background=${index !== undefined && this.hasAlternatingBackground && index % 2 === 1}
				?data-grid-has-details=${this.hasDetails}
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
				${this.hasFooter === false ? html.nothing : html`
					<mo-data-grid-footer .dataGrid=${this as any} page=${this.page}>
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
				${this.columns.map(c => c.sumTemplate)}
			</mo-flex>
		`
	}

	protected get toolbarTemplate() {
		return this.hasToolbar === false ? html.nothing : html`
			<mo-flex id='toolbar' direction='horizontal' gap='8px' wrap='wrap' justifyContent='end' alignItems='center'>
				<mo-flex direction='horizontal' alignItems='inherit' gap='8px' wrap='wrap' ${style({ flex: '1' })}>
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
		return html.nothing
	}

	protected get toolbarActionDefaultTemplate() {
		return html.nothing
	}

	protected get sumDefaultTemplate() {
		return html.nothing
	}

	protected get selectionToolbarTemplate() {
		return this.selectionToolbarDisabled === true || this.selectedData.length === 0 ? html.nothing : html`
			<mo-flex id='flexSelectionToolbar'>
				<mo-flex direction='horizontal' gap='30px' ${style({ placeSelf: 'stretch' })}>
					<div ${style({ fontWeight: '500', margin: '0 6px' })}>
						${t('${count:pluralityNumber} entries selected', { count: this.selectedData.length })}
					</div>
					${!this.getRowContextMenuTemplate ? html.nothing : html`
						<mo-flex id='flexActions' direction='horizontal' @click=${(e: PointerEvent) => ContextMenu.open(e, this.getRowContextMenuTemplate?.(this.selectedData) ?? html.nothing)}>
							<div ${style({ flex: '1' })}>${t('Options')}</div>
							<mo-icon-button dense icon='arrow_drop_down' ${style({ display: 'flex', alignItems: 'center', justifyContent: 'center' })}></mo-icon-button>
						</mo-flex>
					`}
					<div ${style({ flex: '1' })}></div>
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
			${!this.hasFilters ? html.nothing : html`
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

	getStickyColumnInsetInline(column: ColumnDefinition<TData, unknown>) {
		const columnIndex = this.visibleColumns.indexOf(column)
		const getFixedInset = (type: 'start' | 'end') => type === 'start'
			? (this.selectionMode !== DataGridSelectionMode.None ? 40 : 0) + (this.hasDetails ? 20 : 0)
			: (this.hasContextMenu ? 28 : 0)

		const calculate = (type: 'start' | 'end') => this.visibleColumns
			.filter((c, i) => c.sticky === type && (type === 'start' ? i < columnIndex : i > columnIndex))
			.map(c => this.rows[0]?.getCell(c)?.clientWidth)
			.filter(x => x !== undefined)
			.reduce((a, b) => a! + b!, 0)!
			+ getFixedInset(type)

		switch (column.sticky) {
			case 'start':
				const start = calculate('start')
				return `${start}px auto`
			case 'end':
				const end = calculate('end')
				return `auto ${end}px`
			case 'both':
				const [s, e] = [calculate('start'), calculate('end')]
				return `${s}px ${e}px`
			default:
				return ''
		}
	}

	get columnsWidths() {
		return [
			this.detailsColumnWidth,
			this.selectionColumnWidth,
			...this.dataColumnsWidths,
			'1fr',
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

	getSorting() {
		return !this.sorting
			? []
			: Array.isArray(this.sorting)
				? this.sorting
				: [this.sorting]
	}

	private *getFlattenedData() {
		if (!this.subDataGridDataSelector) {
			yield* this.data.map(d => ({ level: 0, data: d }))
			return
		}

		const flatten = (data: TData, level = 0): Array<{ level: number, data: TData }> => {
			const subData = getValueByKeyPath(data, this.subDataGridDataSelector!)
			return [
				{ data, level },
				...!Array.isArray(subData)
					? []
					: subData.flatMap(d => flatten(d, level + 1))
			]
		}

		for (const data of this.data) {
			yield* flatten(data)
		}

		return
	}

	get flattenedData() {
		return [...this.getFlattenedData()].map(({ data }) => data)
	}

	protected get sortedData() {
		const sorting = this.getSorting()

		const sortedData = [...this.data]

		if (!sorting?.length) {
			return sortedData
		}

		return sortedData.sort((a, b) => {
			for (const sortCriteria of sorting) {
				const { selector, strategy } = sortCriteria
				const aValue = getValueByKeyPath(a, selector) ?? Infinity as any
				const bValue = getValueByKeyPath(b, selector) ?? Infinity as any

				if (aValue < bValue) {
					return strategy === DataGridSortingStrategy.Ascending ? -1 : 1
				} else if (aValue > bValue) {
					return strategy === DataGridSortingStrategy.Ascending ? 1 : -1
				}
				// If values are equal, continue to the next level of sorting
			}

			return 0 // Items are equal in all sorting criteria
		})
	}

	get renderData() {
		if (this.hasPagination === false) {
			return this.sortedData
		}
		const from = (this.page - 1) * this.pageSize
		const to = this.page * this.pageSize
		return this.sortedData.slice(from, to)
	}

	private get elementExtractedColumns(): Array<DataGridColumn<TData, KeyPathValueOf<TData>>> {
		if (!this.columnsSlot) {
			return []
		}
		const children = this.columnsSlot.children.length > 0 ? Array.from(this.columnsSlot.children) : undefined
		const assigned = this.columnsSlot.assignedElements().length > 0 ? Array.from(this.columnsSlot.assignedElements()) : undefined
		return Array.from(assigned ?? children ?? [])
			.filter((c): c is DataGridColumnComponent<TData, KeyPathValueOf<TData>> => {
				const isColumn = c instanceof DataGridColumnComponent
				if (isColumn) {
					c.dataGrid = this
				}
				return isColumn
			})
			.map(c => c.column)
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
				columnElement.dataGrid = this as any
				const column = columnElement.column
				columnElement.remove()
				return column
			}) as Array<DataGridColumn<TData>>
	}

	get visibleColumns() {
		return this.columns.filter(c => c.hidden === false)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid': DataGrid<unknown, undefined>
	}
}