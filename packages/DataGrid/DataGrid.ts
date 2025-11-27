import { property, component, Component, html, css, query, ifDefined, type PropertyValues, event, style, literal, staticHtml, type HTMLTemplateResult, cache, eventOptions, queryAll, repeat, eventListener } from '@a11d/lit'
import { LocalStorage } from '@a11d/local-storage'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
import { SlotController } from '@3mo/slot-controller'
import { tooltip } from '@3mo/tooltip'
import { ThemeController } from '@3mo/theme'
import { MediaQueryController } from '@3mo/media-query-observer'
import { Localizer } from '@3mo/localization'
import { type Scroller } from '@3mo/scroller'
import { DataGridColumnsController } from './DataGridColumnsController.js'
import { DataGridSelectionBehaviorOnDataChange, DataGridSelectionController, type DataGridSelectability } from './DataGridSelectionController.js'
import { DataGridSortingController, type DataGridRankedSortDefinition, type DataGridSorting } from './DataGridSortingController.js'
import { DataGridDetailsController } from './DataGridDetailsController.js'
import { DataGridCsvController, DataGridSidePanelTab, type DataGridColumn, type DataGridCell, type DataGridFooter, type DataGridHeader, type DataGridRow, type DataGridSidePanel, DataGridContextMenuController, DataGridColumnComponent, DataGridReorderabilityController, type DataGridReorderChange } from './index.js'
import { DataRecord } from './DataRecord.js'

Localizer.dictionaries.add('de', {
	'No results': 'Kein Ergebnis',
	'More Filters': 'Weitere Filter',
})

export type DataGridPagination = 'auto' | number

export enum DataGridEditability {
	Never = 'never',
	Cell = 'cell',
	Always = 'always',
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
 * @attr selectability - The selection mode. Default to 'single' if context menus available, 'undefined' otherwise.
 * @attr isDataSelectable - Whether data of a given row is selectable.
 * @attr selectedData - The selected data.
 * @attr selectOnClick - Whether the row should be selected on click.
 * @attr selectionBehaviorOnDataChange - The behavior of the selection when the data changes.
 * @attr reorderability - Whether the rows can be reordered. Can only be enabled if sorting is not active, selectability is not 'multiple', and no details are present.
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
 * @attr hasAlternatingBackground - Whether the rows should have alternating background.
 * @attr preventFabCollapse - Whether the FAB should be prevented from collapsing.
 * @attr cellFontSize - The font size of the cells relative to the default font size. Defaults @see DataGrid.cellFontSize 's value which defaults to 0.8.
 * @attr rowHeight - The height of the rows in pixels. Defaults to @see DataGrid.rowHeight 's value which defaults to 35.
 * @attr exportable - Whether the DataGrid is exportable. This will show an export button in the footer.
 *
 * @slot - Use this slot only for declarative DataGrid APIs e.g. setting ColumnDefinitions via `mo-data-grid-columns` tag.
 * @slot toolbar - The horizontal bar above DataGrid's contents.
 * @slot toolbar-action - A slot for action icon-buttons in the toolbar which are displayed on the end.
 * @slot filter - A vertical bar for elements which filter DataGrid's data. It is opened through an icon-button in the toolbar.
 * @slot sum - A horizontal bar in the DataGrid's footer for showing sums. Calculated sums are also placed here by default.
 * @slot settings - A vertical bar for elements which change DataGrid's settings. It is pre-filled with columns' settings and can be opened through an icon-button in the toolbar.
 * @slot fab - A wrapper at the bottom right edge, floating right above the footer, expecting Floating Action Button to be placed in.
 * @slot error-no-content - A slot for displaying an error message when no data is available.
 *
 * @cssprop --mo-data-grid-min-visible-rows - The minimum number of visible rows. Default to 2.5.
 * @cssprop --mo-data-grid-footer-background - The background of the footer.
 * @cssprop --mo-data-grid-cell-padding - The inline padding of the cells. Default to 10px.
 * @cssprop --mo-data-grid-column-sub-row-indentation - The indentation of the first column in the sub row. Default to 20px.
 *
 * @fires dataChange
 * @fires selectionChange
 * @fires pageChange
 * @fires paginationChange
 * @fires columnsChange
 * @fires sidePanelOpen
 * @fires sidePanelClose
 * @fires sortingChange
 * @fires reorder
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
	protected static readonly defaultRowElementTag = literal`mo-data-grid-default-row`

	@event() readonly dataChange!: EventDispatcher<Array<TData>>
	@event() readonly selectionChange!: EventDispatcher<Array<TData>>
	@event() readonly pageChange!: EventDispatcher<number>
	@event() readonly paginationChange!: EventDispatcher<DataGridPagination | undefined>
	@event() readonly columnsChange!: EventDispatcher<Array<DataGridColumn<TData>>>
	@event() readonly sidePanelOpen!: EventDispatcher<DataGridSidePanelTab>
	@event() readonly sidePanelClose!: EventDispatcher
	@event() readonly sortingChange!: EventDispatcher<Array<DataGridRankedSortDefinition<TData>>>
	@event() readonly reorder!: EventDispatcher<Array<DataGridReorderChange<TData>>>
	@event() readonly rowDetailsOpen!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowDetailsClose!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowClick!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowDoubleClick!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowMiddleClick!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly cellEdit!: EventDispatcher<DataGridCell<any, TData, TDetailsElement>>

	@property({ type: Array }) data = new Array<TData>()
	@property({ type: Array }) columns = new Array<DataGridColumn<TData>>()

	@property({ type: Boolean, reflect: true }) headerHidden = false
	@property({ type: Boolean, reflect: true }) preventVerticalContentScroll = false
	@property({ type: Number }) page = 1
	@property({ reflect: true, converter: (value: string | null | undefined) => value === null || value === undefined ? undefined : Number.isNaN(Number(value)) ? value : Number(value) }) pagination?: DataGridPagination

	@property({ type: Object }) sorting?: DataGridSorting<TData>

	@property({ reflect: true }) selectability?: DataGridSelectability
	@property({ type: Object }) isDataSelectable?: (data: TData) => boolean
	@property({ type: Array, event: 'selectionChange' }) selectedData = new Array<TData>()
	@property({ type: Boolean }) selectOnClick = false
	@property() selectionBehaviorOnDataChange = DataGridSelectionBehaviorOnDataChange.Reset

	@property({ type: Boolean }) reorderability?: boolean

	@property({ type: Object }) getRowDetailsTemplate?: (data: TData) => HTMLTemplateResult
	@property({ type: Boolean }) multipleDetails = false
	@property() subDataGridDataSelector?: KeyPath.Of<TData>
	@property({ type: Object }) hasDataDetail?: (data: TData) => boolean
	@property({ type: Boolean }) detailsOnClick = false

	@property({ type: Object }) getRowContextMenuTemplate?: (data: Array<TData>) => HTMLTemplateResult
	@property({ type: Boolean }) primaryContextMenuItemOnDoubleClick = false

	@property({ reflect: true }) editability = DataGridEditability.Never

	@property() sidePanelTab: DataGridSidePanelTab | undefined
	@property({ type: Boolean }) sidePanelHidden = false
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

	@query('mo-data-grid-header') private readonly header?: DataGridHeader<TData>
	@query('mo-scroller') private readonly scroller?: Scroller
	@queryAll('[mo-data-grid-row]') readonly rows!: Array<DataGridRow<TData, TDetailsElement>>
	@query('mo-data-grid-footer') private readonly footer?: DataGridFooter<TData>
	@query('mo-data-grid-side-panel') private readonly sidePanel?: DataGridSidePanel<TData>

	setPage(page: number) {
		this.page = page
		this.pageChange.dispatch(page)
	}

	setPagination(pagination?: DataGridPagination) {
		this.pagination = pagination
		this.paginationChange.dispatch(pagination)
	}

	setData(data: Array<TData>, selectionBehavior = this.selectionBehaviorOnDataChange) {
		this.data = data
		this.selectionController.handleDataChange(selectionBehavior)
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

	get hasDetails() {
		return this.detailsController.hasDetails
	}

	get allRowDetailsOpen() {
		return this.detailsController.areAllOpen
	}

	openRowDetails(...parameters: Parameters<typeof this.detailsController.openAll>) {
		return this.detailsController.openAll(...parameters)
	}

	closeRowDetails(...parameters: Parameters<typeof this.detailsController.closeAll>) {
		return this.detailsController.closeAll(...parameters)
	}

	toggleRowDetails(...parameters: Parameters<typeof this.detailsController.toggleAll>) {
		return this.detailsController.toggleAll(...parameters)
	}

	getSorting(...parameters: Parameters<typeof DataGridSortingController.prototype.get>) {
		return this.sortingController.get(...parameters)
	}

	sort(...parameters: Parameters<typeof this.sortingController.set>) {
		return this.sortingController.set(...parameters)
	}

	unsort(...parameters: Parameters<typeof this.sortingController.reset>) {
		return this.sortingController.reset(...parameters)
	}

	generateCsv(...parameters: Parameters<typeof this.csvController.generateCsv>) {
		return this.csvController.generateCsv(...parameters)
	}

	setColumns(...parameters: Parameters<typeof this.columnsController.setColumns>) {
		return this.columnsController.setColumns(...parameters)
	}

	extractColumns(...parameters: Parameters<typeof this.columnsController.extractColumns>) {
		return this.columnsController.extractColumns(...parameters)
	}

	@eventListener('change')
	protected handleColumnChange(e: CustomEvent) {
		if (e.detail instanceof DataGridColumnComponent) {
			e.stopPropagation()
			this.columnsController.extractColumns()
		}
	}

	get extractedColumns() {
		return this.columnsController.extractedColumns
	}

	extractedColumnsUpdated(extractedColumns: Array<DataGridColumn<TData, TDetailsElement>>) {
		this.setColumns(extractedColumns)
	}

	get visibleColumns() {
		return this.columnsController.visibleColumns
	}

	getRow(data: TData) {
		return this.rows.find(r => r.data === data)
	}

	getCell(data: TData, column: DataGridColumn<TData, unknown>) {
		const row = this.getRow(data)
		return row?.getCell(column)
	}

	handleEdit(data: TData, column: DataGridColumn<TData, unknown>, value: KeyPath.ValueOf<TData, KeyPath.Of<TData>> | undefined) {
		const row = this.getRow(data)
		const cell = row?.getCell(column)
		if (row && cell && value !== undefined && column.dataSelector && cell.value !== value) {
			row.requestUpdate()
			KeyPath.set(row.data, column.dataSelector, value as any)
			this.cellEdit.dispatch(cell)
		}
	}

	navigateToSidePanelTab(tab?: DataGridSidePanelTab) {
		this.sidePanelTab = tab
		!tab ? this.sidePanelClose.dispatch() : this.sidePanelOpen.dispatch(tab)
	}

	get hasContextMenu() {
		return this.contextMenuController.hasContextMenu
	}

	get toolbarElements() {
		return this.slotController.getAssignedElements('toolbar')
	}

	get hasToolbar() {
		return this.toolbarDefaultTemplate !== html.nothing || this.toolbarElements.length > 0
	}

	get filterElements() {
		return this.slotController.getAssignedElements('filter')
	}

	get hasFilters() {
		return this.filtersDefaultTemplate !== html.nothing || this.filterElements.length > 0
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
			const rowsHeight = (this.scroller?.clientHeight ?? 0) - (this.header?.clientHeight ?? 0)
			const rowHeight = this.rowHeight
			const pageSize = Math.floor(rowsHeight / rowHeight) || 1
			return dynamicPageSize(pageSize)
		}

		return this.pagination
	}

	get hasFooter() {
		const value = this.hasPagination || this.hasSums || this.exportable
		this.toggleAttribute('hasFooter', value)
		return value
	}

	get dataLength(): number | undefined {
		return this.dataRecords.length
	}

	get maxPage() {
		return this.dataLength === undefined ? undefined : Math.max(Math.ceil(this.dataLength / this.pageSize), 1)
	}

	get hasNextPage() {
		return this.page !== this.maxPage
	}

	protected readonly slotController = new SlotController(this, async () => {
		this.hasSums
		this.hasFabs
		await new Promise(r => requestIdleCallback(r))
		this.style.setProperty('--mo-data-grid-fab-slot-width', `${this.renderRoot?.querySelector('slot[name=fab]')?.getBoundingClientRect().width || 75}px`)
	})

	protected readonly instanceofAttributeController = new InstanceofAttributeController(this)
	protected readonly smallScreenObserverController = new MediaQueryController(this, '(max-width: 768px)')
	protected readonly themeController = new ThemeController(this)

	readonly columnsController = new DataGridColumnsController(this)
	readonly selectionController = new DataGridSelectionController(this)
	readonly sortingController = new DataGridSortingController(this)
	readonly contextMenuController = new DataGridContextMenuController(this)
	readonly detailsController = new DataGridDetailsController(this)
	readonly csvController = new DataGridCsvController<TData>(this)
	readonly reorderabilityController = new DataGridReorderabilityController(this)

	readonly rowIntersectionObserver?: IntersectionObserver

	protected override updated(...parameters: Parameters<Component['updated']>) {
		this.header?.requestUpdate()
		this.sidePanel?.requestUpdate()
		this.footer?.requestUpdate()
		this.rows.forEach(row => row.requestUpdate())
		// @ts-expect-error rowIntersectionObserver is initialized once here
		this.rowIntersectionObserver ??= new IntersectionObserver(entries => {
			entries.forEach(({ target, isIntersecting }) => {
				(target as DataGridRow<TData>).isIntersecting = isIntersecting
			})
		}, { root: this.scroller, rootMargin: '400px 0px' })
		this.navigateToLastValidPageIfNeeded()
		return super.updated(...parameters)
	}

	private navigateToLastValidPageIfNeeded() {
		if (this.maxPage && this.page > this.maxPage) {
			this.setPage(this.maxPage)
		}
	}

	protected override firstUpdated(props: PropertyValues) {
		super.firstUpdated(props)
		this.cellEdit.subscribe(() => this.requestUpdate())
		this.setPage(1)
	}

	static override get styles() {
		return css`
			:host {
				--mo-data-grid-column-reorder-width: 20px;
				--mo-data-grid-column-details-width: 20px;
				--mo-data-grid-column-selection-width: 40px;
				--mo-data-grid-column-actions-width: 28px;
				--mo-data-grid-cell-padding: 10px;
				--mo-data-grid-header-height: 32px;
				--mo-data-grid-footer-min-height: 40px;
				--mo-data-grid-toolbar-padding: 0px 14px 14px 14px;
				--mo-data-grid-border: 1px solid var(--mo-color-transparent-gray-3);

				--mo-details-data-grid-start-margin: 26px;

				--mo-data-grid-sticky-part-color: var(--mo-color-surface);

				--mo-data-grid-alternating-background: color-mix(in srgb, black var(--mo-data-grid-alternating-background-transparency), transparent 0%);

				--mo-data-grid-selection-background: color-mix(in srgb, var(--mo-color-accent), transparent 50%);

				--_content-min-height-default: calc(var(--mo-data-grid-min-visible-rows, 2.5) * var(--mo-data-grid-row-height) + var(--mo-data-grid-header-height));
				display: flex;
				flex-direction: column;
				height: 100%;
				overflow-x: hidden;
			}

			:not(:has([mo-data-grid-row])) {
				--_content-min-height-default: 150px;
			}

			:host([data-theme=light]) {
				--mo-data-grid-alternating-background-transparency : 5%;
			}

			:host([data-theme=dark]) {
				--mo-data-grid-alternating-background-transparency: 20%;
			}

			:host([preventVerticalContentScroll]) mo-scroller {
				overflow-y: hidden;

				&::part(container) {
					position: relative;
				}
			}

			#content {
				width: fit-content;
				min-width: 100%;
				height: min-content;
				min-height: 100%;
			}

			#toolbar {
				position: relative;
				padding: var(--mo-data-grid-toolbar-padding);

				#actions {
					margin-inline-start: auto;

					mo-icon-button, ::slotted(mo-icon-button[slot='toolbar-action']) {
						color: var(--mo-color-gray);
						&[data-selected] {
							color: var(--mo-color-accent);
						}
					}
				}
			}

			#fab {
				position: absolute;
				inset-inline-end: 16px;
				transition: var(--mo-data-grid-fab-transition, 250ms);
				z-index: 3;
				top: -64px;
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
				height: calc(100% - var(--mo-data-grid-header-height) / 2);
				margin-block-start: calc(var(--mo-data-grid-header-height) / 2);
				position: absolute;
				inset: 0;
			}

			#overlayModeContainer {
				position: relative;
				height: 100%;
				width: 100%;

				mo-data-grid-side-panel {
					position: absolute;
					inset: 0;
					width: 100%;
					height: 100%;
					z-index: 5;
					background-color: var(--mo-color-surface);
				}
			}
		`
	}

	protected override get template() {
		return html`
			<slot name='column' hidden>${this.columnsTemplate}</slot>
			${this.toolbarTemplate}
			${this.smallScreenObserverController.matches ? this.overlayModeTemplate : this.splitterModeTemplate}
		`
	}

	private readonly splitterResizerTemplate = html`
		<mo-splitter-resizer-line style='--mo-splitter-resizer-line-thickness: 1px; --mo-splitter-resizer-line-idle-background: var(--mo-color-transparent-gray-3); --mo-splitter-resizer-line-horizontal-transform: scaleX(5);'></mo-splitter-resizer-line>
	`

	private get splitterModeTemplate() {
		return html`
			<mo-splitter direction='horizontal-reversed' ${style({ height: '100%' })} .resizerTemplate=${this.splitterResizerTemplate}>
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
		return DataGrid.defaultRowElementTag
	}

	get hasDefaultRowElements() {
		return this.rowElementTag === DataGrid.defaultRowElementTag
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
		this.toggleAttribute('hasDetails', this.hasDetails)
		return html`
			<mo-grid rows='* auto' ${style({ position: 'relative', height: '100%' })}>
				<mo-scroller
					${style({ minHeight: 'var(--mo-data-grid-content-min-height, var(--_content-min-height-default))' })}
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

	private get rowsTemplate() {
		// Do not use the data-record or data as the key as it leads to UI flickering
		return html`
			${this.hiddenSizeAnchorRowTemplate}
			${repeat(this.renderDataRecords, record => record.index, (record, index) => this.getRowTemplate(record, index))}
		`
	}

	/**
	 * The hidden size anchor row renders the longest content of each column in a hidden row.
	 * This is used to mitigate the issue of using values with fluctuating lengths
	 * with a automatic column width e.g. "max-content" or "fit-content" in combination with
	 * row virtualization, which could lead to a lot of column resizing during scrolling.
	 */
	private get hiddenSizeAnchorRowTemplate() {
		const getLength = (template: HTMLTemplateResult) => [...template.values ?? [], ...template.strings ?? []]
			.map(v => {
				try {
					return `${v}`
				} catch {
					return ''
				}
			})
			.reduce((acc, v) => acc + v.length, 0)

		const getLongestContent = (column: DataGridColumn<TData, unknown>) => {
			return this.dataRecords
				.map(dr => column.getContentTemplate?.(KeyPath.get(dr.data, column.dataSelector), dr.data) ?? html.nothing)
				.reduce((longest, current) => (getLength(current) > getLength(longest)) || false ? current : longest, html.nothing)
		}

		return html`
			<style>
				#size-anchor {
					display: grid;
					grid-template-columns: subgrid;
					grid-column: data / end;
					font-size: var(--mo-data-grid-cell-font-size);
					height: 0;
					visibility: hidden;
					opacity: 0;

					div {
						user-select: none;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
						padding-inline: var(--mo-data-grid-cell-padding);
						margin-inline-start: calc(var(--_max-level, 0) * var(--mo-data-grid-column-sub-row-indentation, 20px))
					}
				}
			</style>
			<div id='size-anchor'>
				${this.visibleColumns.map(column => html`
					<div style='--_max-level: ${Math.max(...this.dataRecords.map(dr => dr.level))}'>
						${getLongestContent(column)}
					</div>
				`)}
			</div>
		`
	}

	getRowTemplate(dataRecord: DataRecord<TData>, index = 0) {
		return staticHtml`
			<${this.rowElementTag} part='row'
				${this.reorderabilityController.item({ index: dataRecord.index, disabled: !this.reorderabilityController.enabled })}
				.dataRecord=${dataRecord}
				?data-has-alternating-background=${this.hasAlternatingBackground && index % 2 === 1}
			></${this.rowElementTag}>
		`
	}

	protected get footerTemplate() {
		return html`
			<mo-flex ${style({ position: 'relative' })}>
				<mo-flex id='fab' direction='vertical-reversed' gap='0.5rem'>
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

	get sumsTemplate(): HTMLTemplateResult {
		return html`
			${this.columns.map(c => c.sumTemplate)}
		`
	}

	protected get toolbarTemplate() {
		return this.hasToolbar === false ? html.nothing : html`
			<mo-flex id='toolbar' direction='horizontal' gap='8px' wrap='wrap' alignItems='center'>
				<slot name='toolbar'>${this.toolbarDefaultTemplate}</slot>
				<mo-flex id='actions' direction='horizontal' gap='8px' alignContent='center'>
					<slot name='toolbar-action'>${this.toolbarActionDefaultTemplate}</slot>
					${this.toolbarActionsTemplate}
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

	protected get toolbarActionsTemplate() {
		return html`
			${!this.hasFilters ? html.nothing : html`
				<mo-icon-button icon='filter_list'
					${tooltip(t('More Filters'))}
					?data-selected=${this.sidePanelTab === DataGridSidePanelTab.Filters}
					@click=${() => this.navigateToSidePanelTab(this.sidePanelTab === DataGridSidePanelTab.Filters ? undefined : DataGridSidePanelTab.Filters)}
				></mo-icon-button>
			`}

			<mo-icon-button icon='settings'
				${tooltip(t('Settings'))}
				?data-selected=${this.sidePanelTab === DataGridSidePanelTab.Settings}
				@click=${() => this.navigateToSidePanelTab(this.sidePanelTab === DataGridSidePanelTab.Settings ? undefined : DataGridSidePanelTab.Settings)}
			></mo-icon-button>
		`
	}

	private lastScrollElementTop = 0
	@eventOptions({ passive: true })
	private handleScroll(e: Event) {
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

	@eventListener({ target: document, type: 'pointerdown' })
	protected handlePointerDown(event: PointerEvent) {
		this.rows.forEach(row => row.cells.forEach(cell => cell.handlePointerDown(event)))
	}

	protected getFlattenedData(values = this.data) {
		return this.sortingController
			.toSortedBy(values.map(data => new DataRecord(this, { data, level: 0 })), ({ data }) => data)
			.flatMap(r => r.flattenedRecords)
	}

	get dataRecords(): Array<DataRecord<TData>> {
		return this.getFlattenedData()
			.map((record, index) => {
				// @ts-expect-error index is initialized here
				record.index = index
				return record
			})
	}

	get renderDataRecords() {
		const rootRecords = this.dataRecords.filter(r => r.level === 0)

		if (this.hasPagination === false) {
			return rootRecords
		}

		const from = this.dataSkip
		const to = this.dataSkip + this.dataTake
		return rootRecords.slice(from, to)
	}

	protected get dataSkip() {
		return (this.page - 1) * this.pageSize
	}

	protected get dataTake() {
		return this.pageSize
	}

	async *getCsvData() {
		yield 1
		return this.dataRecords
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid': DataGrid<unknown, undefined>
	}
}