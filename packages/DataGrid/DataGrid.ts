import { property, component, Component, html, css, query, type PropertyValues, event, style, literal, staticHtml, type HTMLTemplateResult, queryAll, repeat, eventListener } from '@a11d/lit'
import { LocalStorage } from '@a11d/local-storage'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
import { SlotController } from '@3mo/slot-controller'
import { tooltip } from '@3mo/tooltip'
import { Localizer } from '@3mo/localization'
import { type Scroller } from '@3mo/scroller'
import { observeResize } from '@3mo/resize-observer'
import { DataGridColumnsController } from './DataGridColumnsController/index.js'
import { DataGridSelectionBehaviorOnDataChange, DataGridSelectionController, type DataGridSelectability } from './DataGridSelectionController.js'
import { DataGridSortingController, type DataGridRankedSortDefinition, type DataGridSorting } from './DataGridSortingController.js'
import { DataGridDetailsController } from './DataGridDetailsController.js'
import { type DataGridColumn, DataGridCsvController, type DataGridCell, type DataGridFooter, type DataGridHeader, type DataGridRow, DataGridContextMenuController, DataGridReorderabilityController, type DataGridReorderChange } from './index.js'
import { DataRecord } from './DataRecord.js'
import { DataGridToolbarElementStyles } from './DataGridToolbarElementStyles.js'

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
 * @attr columns - The read-only columns of the DataGrid, composed of their definitions and modifications. Provide columns programmatically via `columns.definitions.programmatic`.
 * @attr headerHidden - Whether the header should be hidden.
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
 * @attr hasAlternatingBackground - Whether the rows should have alternating background.
 * @attr cellFontSize - The font size of the cells relative to the default font size. Defaults @see DataGrid.cellFontSize 's value which defaults to 0.8.
 * @attr rowHeight - The height of the rows in pixels. Defaults to @see DataGrid.rowHeight 's value which defaults to 35.
 * @attr exportable - Whether the DataGrid is exportable. This will show an export button in the footer.
 *
 * @slot - Use this slot only for declarative DataGrid APIs e.g. setting ColumnDefinitions via `mo-data-grid-columns` tag.
 * @slot toolbar - The horizontal bar above DataGrid's contents.
 * @slot action - A slot for action icon-buttons in the toolbar which are displayed on the end.
 * @slot filter - Elements which filter DataGrid's data. When expanded, they continue the toolbar's row if they all fit into its remaining space, otherwise they wrap into rows of their own. It is toggled through an icon-button in the toolbar.
 * @slot sum - A horizontal bar in the DataGrid's footer for showing sums. Calculated sums are also placed here by default.
 * @slot primary-action - A slot at the very end of the toolbar expecting the primary action element (e.g. an "add" button) to be placed in.
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
	static readonly hasAlternatingBackground = new LocalStorage('DataGrid.HasAlternatingBackground', false)
	protected static readonly defaultRowElementTag = literal`mo-data-grid-default-row`

	static readonly toolbarElementStyles = new DataGridToolbarElementStyles()

	@event() readonly dataChange!: EventDispatcher<Array<TData>>
	@event() readonly selectionChange!: EventDispatcher<Array<TData>>
	@event() readonly pageChange!: EventDispatcher<number>
	@event() readonly paginationChange!: EventDispatcher<DataGridPagination | undefined>
	@event() readonly columnsChange!: EventDispatcher<Array<DataGridColumn<TData>>>
	@event() readonly sortingChange!: EventDispatcher<Array<DataGridRankedSortDefinition<TData>>>
	@event() readonly reorder!: EventDispatcher<Array<DataGridReorderChange<TData>>>
	@event() readonly rowDetailsOpen!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowDetailsClose!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowClick!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowDoubleClick!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly rowMiddleClick!: EventDispatcher<DataGridRow<TData, TDetailsElement>>
	@event() readonly cellEdit!: EventDispatcher<DataGridCell<any, TData, TDetailsElement>>

	@property({ type: Array }) data = new Array<TData>()

	@property({ type: Array })
	get columns() { return [...this.columnsController.columns] }
	set columns(value) { this.columnsController.columns.definitions.programmatic = value }

	@property({ type: Boolean, reflect: true }) headerHidden = false
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

	@property({ type: Boolean }) filtersOpen = false

	@property({ type: Boolean }) hasAlternatingBackground = DataGrid.hasAlternatingBackground.value

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

	setColumns(columns: Array<DataGridColumn<TData>>) {
		this.columns = columns
	}

	extractColumns(...parameters: Parameters<typeof this.columnsController.extractColumns>) {
		return this.columnsController.extractColumns(...parameters)
	}

	@eventListener('DataGridColumnComponent:update')
	protected handleColumnChange(e: CustomEvent) {
		e.stopPropagation()
		this.columnsController.extractColumns()
	}

	get extractedColumns() {
		return [...this.columnsController.columns.definitions]
	}

	get visibleColumns() {
		return this.columnsController.columns.visible
	}

	getRow(data: TData) {
		return this.rows.find(r => r.data === data)
	}

	getCell(data: TData, column: DataGridColumn<TData>) {
		const row = this.getRow(data)
		return row?.getCell(column)
	}

	handleEdit(data: TData, column: DataGridColumn<TData>, value: KeyPath.ValueOf<TData, KeyPath.Of<TData>> | undefined) {
		const row = this.getRow(data)
		const cell = row?.getCell(column)
		if (row && cell && value !== undefined && column.dataSelector && cell.value !== value) {
			row.requestUpdate()
			KeyPath.set(row.data, column.dataSelector, value as any)
			this.cellEdit.dispatch(cell)
		}
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

	get primaryActionElements() {
		return this.slotController.getAssignedElements('primary-action')
	}

	get hasPrimaryAction() {
		return this.primaryActionElements.length > 0
	}

	get hasSums() {
		const hasSums = !!this.columns.find(c => c.sumHeading) || !!this.querySelector('* [slot="sum"]') || !!this.renderRoot?.querySelector('slot[name="sum"] > *')
		this.toggleAttribute('hasSums', hasSums)
		return hasSums
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
			const rowHeight = this.rowHeight + 1
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

	protected readonly slotController = new SlotController(this, () => { this.hasSums })

	protected readonly instanceofAttributeController = new InstanceofAttributeController(this)

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
		this.footer?.requestUpdate()
		this.rows.forEach(row => row.requestUpdate())
		// @ts-expect-error rowIntersectionObserver is initialized once here
		this.rowIntersectionObserver ??= new IntersectionObserver(entries => {
			entries.forEach(({ target, isIntersecting, rootBounds }) => {
				// Skip if rootBounds is null/zero (happens during resize/zoom)
				if (rootBounds && (rootBounds.width !== 0 || rootBounds.height !== 0)) {
					(target as DataGridRow<TData>).isIntersecting = isIntersecting
				}
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

	protected static override finalizeStyles(...parameters: Parameters<typeof Component.finalizeStyles>) {
		const styleSheet = DataGrid.toolbarElementStyles.styleSheet
		return [...super.finalizeStyles(...parameters), ...styleSheet ? [styleSheet] : []]
	}

	static override get styles() {
		return css`
			:host {
				--mo-data-grid-column-reorder-width: 20px;
				--mo-data-grid-column-details-width: 20px;
				--mo-data-grid-column-selection-width: 40px;
				--mo-data-grid-column-actions-width: 28px;
				--mo-data-grid-cell-padding: 0.5rem;
				--mo-data-grid-header-height: 32px;
				--mo-data-grid-footer-min-height: 40px;
				--mo-data-grid-toolbar-padding: 0px 14px 14px 14px;
				--mo-data-grid-border: 1px solid var(--mo-color-transparent-gray-3);

				--mo-details-data-grid-start-margin: 26px;

				--mo-data-grid-sticky-part-color: var(--mo-color-surface);

				--mo-data-grid-alternating-background: light-dark(
					color-mix(in srgb, black 5%, transparent),
					color-mix(in srgb, black 20%, transparent)
				);

				--mo-data-grid-selection-background: color-mix(in srgb, var(--mo-color-accent), transparent 50%);

				--_content-min-height-default: calc(var(--mo-data-grid-min-visible-rows, 2.5) * (var(--mo-data-grid-row-height) + 1px) + var(--mo-data-grid-header-height));
				display: flex;
				flex-direction: column;
				height: 100%;
				overflow-x: hidden;
			}

			:not(:has([mo-data-grid-row])) {
				--_content-min-height-default: 150px;
			}

			:host([data-reordering]) {
				user-select: none;

				[part=row]:not([data-reorderability=dragging]) {
					transition: transform 0.15s ease;
				}
			}

			#content {
				width: 0;
				min-width: 100%;
				height: min-content;
				min-height: 100%;
			}

			/*
				A zero-specificity baseline for toolbar and filter elements, so that any size convention
				of @see DataGrid.toolbarElementStyles as well as element's own styles can override it.
			*/
			:where(slot[name=toolbar], slot[name=filter])::slotted(*), :where(slot[name=toolbar], slot[name=filter]) > * {
				width: fit-content;
			}

			#toolbar {
				position: relative;

				slot[name=filter] {
					display: flex;
					flex-flow: row wrap;
					gap: 0.5rem;
					align-items: center;
					width: fit-content;
					interpolate-size: allow-keywords;
					overflow: hidden;
					transition: height 0.25s ease, opacity 0.25s ease, display 0.25s ease allow-discrete;

					@starting-style {
						height: 0;
						opacity: 0;
					}

					&[data-collapsed] {
						display: none;
						height: 0;
						opacity: 0;
					}
				}


				#actions {
					margin-inline-start: auto;

					mo-icon-button, ::slotted(mo-icon-button[slot='action']) {
						color: var(--mo-color-gray);
						&[data-selected] {
							color: var(--mo-color-accent);
						}
					}
				}
			}

			mo-empty-state, ::slotted(mo-empty-state) {
				height: calc(100% - var(--mo-data-grid-header-height) / 2);
				margin-block-start: calc(var(--mo-data-grid-header-height) / 2);
				position: absolute;
				inset: 0;
			}
		`
	}

	protected override get template() {
		return html`
			<slot name='column' hidden>${this.columnsTemplate}</slot>
			${this.toolbarTemplate}
			${this.dataGridTemplate}
		`
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

	protected get primaryActionTemplate() {
		return html`<slot name='primary-action'></slot>`
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
			<mo-flex ${style({ position: 'relative', flex: '1' })}>
				<mo-scroller
					${style({ flex: '1 0 var(--mo-data-grid-content-min-height, var(--_content-min-height-default))' })}
					${observeResize(([e]) => this.style.setProperty('--_content-height', `${e?.contentRect.height ?? 0}px`))}
				>
					<mo-grid id='content' autoRows='min-content' columns='var(--mo-data-grid-columns)'>
						${this.headerTemplate}
						${this.contentTemplate}
					</mo-grid>
				</mo-scroller>
				${this.footerTemplate}
			</mo-flex>
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

		const getLongestContent = (column: DataGridColumn<TData>) => {
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
		return this.hasFooter === false ? html.nothing : html`
			<mo-data-grid-footer .dataGrid=${this as any} page=${this.page}>
				<slot name='sum' slot='sum'>${this.sumDefaultTemplate}</slot>
			</mo-data-grid-footer>
		`
	}

	get sumsTemplate(): HTMLTemplateResult {
		return html`
			${this.columns.map(c => c.sumTemplate)}
		`
	}

	protected get toolbarTemplate() {
		return this.hasToolbar === false && this.hasFilters === false && this.hasPrimaryAction === false ? html.nothing : html`
			<div id='toolbar'>
				<mo-grid columns='1fr auto' gap='0.5rem' alignItems='start' style='padding: var(--mo-data-grid-toolbar-padding)'>
					<mo-flex direction='horizontal' gap='0.5rem' wrap='wrap' alignItems='center' style='min-width: 0; min-height: var(--mo-data-grid-toolbar-row-height, 2.625rem)'>
						<slot name='toolbar'>
							${this.toolbarDefaultTemplate}
						</slot>
						<slot name='filter' ?data-collapsed=${!this.filtersOpen}>
							${this.filtersDefaultTemplate}
						</slot>
					</mo-flex>
					<mo-flex id='actions' direction='horizontal' gap='0.5rem' alignItems='center'>
						<slot name='action'>
							${this.toolbarActionDefaultTemplate}
						</slot>
						${this.toolbarActionsTemplate}
						${this.primaryActionTemplate}
					</mo-flex>
				</mo-grid>
			</div>
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
					?data-selected=${this.filtersOpen}
					@click=${() => this.filtersOpen = !this.filtersOpen}
				></mo-icon-button>
			`}
		`
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