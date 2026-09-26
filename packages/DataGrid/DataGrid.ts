import { property, component, Component, html, css, query, type PropertyValues, event, style, literal, staticHtml, type HTMLTemplateResult, repeat, eventListener } from '@a11d/lit'
import { LocalStorage } from '@a11d/local-storage'
import { NotificationComponent } from '@a11d/lit-application'
import { Downloader } from '@3mo/downloader'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
import { SlotController } from '@3mo/slot-controller'
import { tooltip } from '@3mo/tooltip'
import { Localizer } from '@3mo/localization'
import { type Scroller } from '@3mo/scroller'
import { observeResize } from '@3mo/resize-observer'
import { DataGridSelectability, DataGridSelectionBehaviorOnDataChange } from './DataGridSelectionController.js'
import { type DataGridRankedSortDefinition, type DataGridSorting } from './DataGridSortingController.js'
import { DataGridController } from './DataGridController.js'
import { DataGridEditability } from './DataGridEditabilityController.js'
import { type DataGridColumn, type DataGridCell, type DataGridFooter, type DataGridHeader, type DataGridRow, type DataGridReorderChange } from './index.js'
import { type DataRecord } from './DataRecord.js'
import { DataGridToolbarElementStyles } from './DataGridToolbarElementStyles.js'
import { DataGridPagination, type DataGridPaginationLike, type DataGridPaginationSize, type DataGridPaginationStrategy } from './DataGridPagination.js'

Localizer.dictionaries.add('de', {
	'No results': 'Kein Ergebnis',
	'More Filters': 'Weitere Filter',
	'Copied to clipboard': 'In die Zwischenablage kopiert',
	'selected': 'ausgewählt',
})


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
 * @slot toolbar-action - A slot for action icon-buttons in the toolbar which are displayed on the end.
 * @slot filter - Elements which filter DataGrid's data. When expanded, they continue the toolbar's row if they all fit into its remaining space, otherwise they wrap into rows of their own. It is toggled through an icon-button in the toolbar.
 * @slot sum - A horizontal bar in the DataGrid's footer for showing sums. Calculated sums are also placed here by default.
 * @slot primary-action - A slot at the very end of the toolbar expecting primary action elements (e.g. an "add" button) to be placed in. Slotted elements replace the slot's default content, but complement primary actions generated outside of it e.g. EntityDataGrid's create button, which is suppressed via "primaryActionHidden" instead.
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
	static readonly pageSize = new LocalStorage<number>('DataGrid.PageSize', 25)
	static readonly hasAlternatingBackground = new LocalStorage('DataGrid.HasAlternatingBackground', false)
	protected static readonly defaultRowElementTag = literal`mo-data-grid-default-row`

	/** Default pagination applied when pagination property is unspecified. */
	static defaultPagination?: DataGridPaginationLike | ((dataGrid: any) => DataGridPaginationLike | undefined)

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
	get columns() { return [...this.controller.columns.columns] }
	set columns(value) { this.controller.columns.columns.definitions.programmatic = value }

	@property({ type: Boolean, reflect: true }) headerHidden = false
	@property({ type: Number }) page = 1
	@property({
		reflect: true,
		converter: {
			fromAttribute: (value: string | null) => DataGridPagination.from(value),
			toAttribute: (value: DataGridPagination | undefined) => value?.toString() ?? null,
		},
	}) pagination?: DataGridPagination

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
	@query('mo-scroller#scroller') protected readonly scroller?: Scroller
	@query('mo-data-grid-footer') private readonly footer?: DataGridFooter<TData>

	/** The rendered rows, sub rows included, in the order of their records. */
	get rows(): Array<DataGridRow<TData, TDetailsElement>> {
		return this.controller.rows as Array<DataGridRow<TData, TDetailsElement>>
	}

	setPage(page: number) {
		this.page = page
		this.pageChange.dispatch(page)
	}

	setPagination(pagination?: DataGridPaginationLike) {
		this.pagination = DataGridPagination.from(pagination)
		this.paginationChange.dispatch(this.pagination)
	}

	setData(data: Array<TData>, selectionBehavior = this.selectionBehaviorOnDataChange) {
		this.data = data
		this.controller.selection.handleItemsChange(selectionBehavior)
		this.controller.details.handleItemsChange()
		this.dataChange.dispatch(data)
	}

	get hasSelection() {
		return this.controller.selection.hasSelection
	}

	selectAll(...parameters: Parameters<typeof this.controller.selection.selectAll>) {
		return this.controller.selection.selectAll(...parameters)
	}

	deselectAll(...parameters: Parameters<typeof this.controller.selection.deselectAll>) {
		return this.controller.selection.deselectAll(...parameters)
	}

	select(data: Array<TData>) {
		this.controller.selection.selection = data
	}

	isSelectable(...parameters: Parameters<typeof this.controller.selection.isSelectable>) {
		return this.controller.selection.isSelectable(...parameters)
	}

	get hasDetails() {
		return this.controller.details.hasDetails
	}

	get allRowDetailsOpen() {
		return this.controller.details.areAllOpen
	}

	openRowDetails(...parameters: Parameters<typeof this.controller.details.openAll>) {
		return this.controller.details.openAll(...parameters)
	}

	closeRowDetails(...parameters: Parameters<typeof this.controller.details.closeAll>) {
		return this.controller.details.closeAll(...parameters)
	}

	toggleRowDetails(...parameters: Parameters<typeof this.controller.details.toggleAll>) {
		return this.controller.details.toggleAll(...parameters)
	}

	getSorting(...parameters: Parameters<typeof this.controller.sorting.get>) {
		return this.controller.sorting.get(...parameters)
	}

	sort(...parameters: Parameters<typeof this.controller.sorting.set>) {
		return this.controller.sorting.set(...parameters)
	}

	unsort(...parameters: Parameters<typeof this.controller.sorting.reset>) {
		return this.controller.sorting.reset(...parameters)
	}

	generateCsv(...parameters: Parameters<typeof this.controller.csv.generateCsv>) {
		return this.controller.csv.generateCsv(...parameters)
	}

	setColumns(columns: Array<DataGridColumn<TData>>) {
		this.columns = columns
	}

	extractColumns(...parameters: Parameters<typeof this.controller.columns.extractColumns>) {
		return this.controller.columns.extractColumns(...parameters)
	}

	@eventListener('DataGridColumnComponent:update')
	protected handleColumnChange(e: CustomEvent) {
		e.stopPropagation()
		this.controller.columns.extractColumns()
	}

	get visibleColumns() {
		return this.controller.columns.columns.visible
	}

	getRow(data: TData) {
		return this.rows.find(r => r.data === data)
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
		return this.controller.contextMenu.hasContextMenu
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
		return this.primaryActionDefaultTemplate !== html.nothing || this.primaryActionElements.length > 0
	}

	get hasSums() {
		const hasSums = !!this.columns.find(c => c.sumHeading) || !!this.querySelector('* [slot="sum"]') || !!this.renderRoot?.querySelector('slot[name="sum"] > *')
		this.toggleAttribute('hasSums', hasSums)
		return hasSums
	}

	get hasPagination() {
		return this.resolvedPagination !== undefined
	}

	/** Resolves effective pagination configuration from property, static default, and fallback. */
	get resolvedPagination(): { readonly strategy: DataGridPaginationStrategy, readonly size: DataGridPaginationSize } | undefined {
		const classDefault = (this.constructor as typeof DataGrid).defaultPagination
		const sources = [
			this.pagination,
			DataGridPagination.from(classDefault instanceof Function ? classDefault(this) : classDefault),
			DataGridPagination.from(this.intrinsicPagination),
		]

		return sources.every(source => source === undefined) ? undefined : {
			// A grid which cannot stream navigates pages, of as many rows as fit where no size is given.
			strategy: sources.map(source => source?.strategy).find(strategy => strategy !== undefined) ?? 'pages',
			size: sources.map(source => source?.size).find(size => size !== undefined) ?? 'auto',
		}
	}

	/**
	 * How this grid paginates by nature of its data source, as opposed to what the class
	 * defaults to in @see DataGrid.defaultPagination. Undefined where a grid holds all of its data
	 * and therefore does not paginate unless it is asked to.
	 */
	protected get intrinsicPagination(): DataGridPaginationLike | undefined {
		return undefined
	}

	get supportsDynamicPageSize() {
		return this.hasPagination
	}

	get pageSize() {
		const dynamicPageSize = (pageSize: number) =>
			this.supportsDynamicPageSize ? pageSize : DataGrid.pageSize.value

		const size = this.resolvedPagination?.size

		if (size === undefined) {
			return dynamicPageSize(this.data.length)
		}

		if (size === 'auto') {
			const rowsHeight = (this.scroller?.clientHeight ?? 0) - (this.header?.clientHeight ?? 0)
			const rowHeight = this.rowHeight + 1
			const pageSize = Math.floor(rowsHeight / rowHeight) || 1
			return dynamicPageSize(pageSize)
		}

		return size
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

	readonly controller = new DataGridController<TData, DataGrid<TData, TDetailsElement>>(this, grid => ({
		get data() { return grid.data },
		get subDataGridDataSelector() { return grid.subDataGridDataSelector },
		get sorting() { return grid.sorting },
		handleSortingChange: sorting => {
			grid.sorting = sorting
			grid.sortingChange.dispatch(sorting)
		},
		get selectability() { return grid.selectability },
		get selectedData() { return grid.selectedData },
		handleSelectionChange: selection => {
			grid.selectedData = selection
			grid.selectionChange.dispatch(selection)
		},
		get isDataSelectable() { return grid.isDataSelectable?.bind(grid) },
		get selectionBehaviorOnDataChange() { return grid.selectionBehaviorOnDataChange },
		get selectOnClick() { return grid.selectOnClick },
		get multipleDetails() { return grid.multipleDetails },
		get hasDataDetail() { return grid.hasDataDetail },
		get getRowDetailsTemplate() { return grid.getRowDetailsTemplate },
		get hasDefaultRowElements() { return grid.hasDefaultRowElements },
		get reorderability() { return grid.reorderability },
		handleReorder: (data, changes) => {
			grid.data = data
			grid.reorder.dispatch(changes)
		},
		handleColumnsChange: columns => grid.columnsChange.dispatch(columns),
		get getRowContextMenuTemplate() { return grid.getRowContextMenuTemplate },
		get editability() { return grid.editability },
		handleCopy: () => NotificationComponent.notifySuccess(t('Copied to clipboard')),
		getCsvData: () => grid.getCsvData(),
		handleCsv: csv => DataGrid.downloadCsv(csv),
		handleCsvError: error => NotificationComponent.notifyAndThrowError(error.message),
	}))

	/** @deprecated Use `controller.columns`. */
	get columnsController() { return this.controller.columns }

	/** @deprecated Use `controller.selection`. */
	get selectionController() { return this.controller.selection }

	/** @deprecated Use `controller.sorting`. */
	get sortingController() { return this.controller.sorting }

	/** @deprecated Use `controller.contextMenu`. */
	get contextMenuController() { return this.controller.contextMenu }

	/** @deprecated Use `controller.details`. */
	get detailsController() { return this.controller.details }

	/** @deprecated Use `controller.csv`. */
	get csvController() { return this.controller.csv }

	/** @deprecated Use `controller.reorderability`. */
	get reorderabilityController() { return this.controller.reorderability }

	/** @deprecated Use `controller.navigability`. */
	get navigabilityController() { return this.controller.navigability }

	/** @deprecated Use `controller.records`. */
	get recordsController() { return this.controller.records }

	/** @deprecated Use `controller.virtualization`. */
	get virtualizationController() { return this.controller.virtualization }

	override requestUpdate(...parameters: Parameters<Component['requestUpdate']>) {
		// The controller is absent while the element constructs, and the selection is stamped onto the rows
		if (parameters[0] !== 'selectedData') {
			this.controller?.handleUpdateRequest(...parameters)
		}
		super.requestUpdate(...parameters)
	}

	protected override willUpdate(...parameters: Parameters<Component['willUpdate']>) {
		super.willUpdate(...parameters)
		const [properties] = parameters
		if (properties.has('data') || properties.has('page')) {
			this.controller.virtualization.handleItemsChange()
		}
		// A row context menu acts on a row, so the grid has to be able to have one — a default the
		// selection controller used to apply by writing to its own host as it was read.
		if (this.hasContextMenu && this.selectability === undefined) {
			this.selectability = DataGridSelectability.Single
		}
	}

	protected override updated(...parameters: Parameters<Component['updated']>) {
		this.header?.requestUpdate()
		this.footer?.requestUpdate()
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
		this.cellEdit.subscribe(() => {
			this.controller.records.invalidate()
			this.requestUpdate()
		})
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

				--mo-data-grid-selection-background: var(--mo-color-accent-container);

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
				/* Contains the floating actions */
				display: flow-root;
				padding: var(--mo-data-grid-toolbar-padding);

				#actions {
					/* Floats, so that only the toolbar is narrowed by the actions while the filter rows below use the full width */
					float: inline-end;
					margin-inline-start: 0.5rem;
					min-height: var(--mo-data-grid-toolbar-row-height, 2.625rem);

					mo-icon-button, ::slotted(mo-icon-button[slot='toolbar-action']) {
						color: var(--mo-color-gray);
						&[data-selected] {
							color: var(--mo-color-accent);
						}
					}
				}

				/*
					A flex container establishes its own formatting context,
					hence the floating actions narrow it instead of pushing it below.
				*/
				slot[name=toolbar] {
					display: flex;
					flex-flow: row wrap;
					gap: 0.5rem;
					align-items: center;
					min-height: var(--mo-data-grid-toolbar-row-height, 2.625rem);
				}

				/* Starts below the floating actions, hence it uses the full width */
				slot[name=filter] {
					display: flex;
					flex-flow: row wrap;
					gap: 0.5rem;
					align-items: center;
					margin-block-start: 0.5rem;
					interpolate-size: allow-keywords;
					overflow: hidden;
					transition: height 0.25s ease, opacity 0.25s ease, margin-block-start 0.25s ease, display 0.25s ease allow-discrete;

					@starting-style {
						height: 0;
						opacity: 0;
						margin-block-start: 0;
					}

					&[data-collapsed] {
						display: none;
						height: 0;
						opacity: 0;
						margin-block-start: 0;
					}
				}
			}

			mo-empty-state, ::slotted(mo-empty-state) {
				height: calc(100% - var(--mo-data-grid-header-height) / 2);
				margin-block-start: calc(var(--mo-data-grid-header-height) / 2);
				position: absolute;
				inset: 0;
				transition: opacity var(--mo-duration-quick, 250ms) ease;

				/* Fades in when the data empties. Rows are not faded in return, as they are re-inserted on every data change. */
				@starting-style {
					opacity: 0;
				}
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

	/**
	 * Override this to provide a primary action without slotting one from the outside.
	 * It is rendered next to the "primary-action" slot rather than as its fallback content,
	 * so that consumers can slot additional primary actions without having to re-implement this one.
	 * @see hasPrimaryAction which detects it, so that the toolbar does not stay hidden.
	 */
	protected get primaryActionDefaultTemplate() {
		return html.nothing
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
				<mo-scroller id='scroller'
					${style({ flex: '1 0 var(--mo-data-grid-content-min-height, var(--_content-min-height-default))' })}
					${observeResize(([e]) => this.style.setProperty('--_content-height', `${e?.contentRect.height ?? 0}px`))}
					${this.controller.virtualization.root.ref()}
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
			<mo-data-grid-header .dataGrid=${this as any} ${this.controller.header.ref()}></mo-data-grid-header>
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

		const records = this.dataRecords
		const maxLevel = records.reduce((max, record) => Math.max(max, record.level), 0)

		const getLongestContent = (column: DataGridColumn<TData>) => this.controller.records.longestContentOf(column, () => records
			.map(record => column.getContentTemplate?.(KeyPath.get(record.data, column.dataSelector), record.data) ?? html.nothing)
			.reduce((longest, current) => (getLength(current) > getLength(longest)) || false ? current : longest, html.nothing as HTMLTemplateResult | typeof html.nothing))

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
					<div style='--_max-level: ${maxLevel}'>
						${getLongestContent(column)}
					</div>
				`)}
			</div>
		`
	}

	getRowTemplate(dataRecord: DataRecord<TData>, index = 0) {
		return staticHtml`
			<${this.rowElementTag} part='row'
				${this.controller.row(dataRecord)}
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

	/** The menu of a row, or of the selection it is part of, headed by how many it acts on. */
	getContextMenuContentTemplate(data: ReadonlyArray<TData> = this.selectedData) {
		return !this.hasContextMenu || !data.length ? html.nothing : html`
			${data.length === 1 ? html.nothing : html`
				<div ${style({ padding: '10px 16px', color: 'var(--mo-color-gray)', pointerEvents: 'none', fontSize: 'small' })}>
					<span ${style({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '12px', height: '100%', color: 'var(--mo-color-on-accent)', background: 'var(--mo-color-accent)', padding: '2px 4px', marginInlineEnd: '4px', borderRadius: '100px' })}>
						${data.length.format()}
					</span>
					${t('selected')}
				</div>
				<mo-line></mo-line>
			`}
			${this.getRowContextMenuTemplate?.([...data]) ?? html.nothing}
		`
	}

	static async downloadCsv(csv: string) {
		const fileName = [
			document.title.split(' | ')[0],
			new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 14),
		].filter(Boolean).join('_')

		Downloader.download(`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`, `${fileName}.csv`)

		await new Promise(r => setTimeout(r, 1000))
	}

	get sumsTemplate(): HTMLTemplateResult {
		return html`
			${this.columns.map(column => this.getSumTemplate(column))}
		`
	}

	private getSumTemplate(column: DataGridColumn<TData>) {
		if (column.sumHeading === undefined || column.getSumTemplate === undefined) {
			return html.nothing
		}

		const sum = (this.selectedData.length ? this.selectedData : this.renderDataRecords.map(r => r.data))
			.map(data => parseFloat(KeyPath.get(data, column.dataSelector) as unknown as string))
			.filter(n => isNaN(n) === false)
			.reduce(((a, b) => a + b), 0)
			|| 0

		return html`
			<mo-data-grid-footer-sum heading=${column.sumHeading || ''} ${style({ color: this.selectedData.length > 0 ? 'var(--mo-color-accent)' : 'currentColor' })}>
				${column.getSumTemplate(sum)}
			</mo-data-grid-footer-sum>
		`
	}

	protected get toolbarTemplate() {
		return this.hasToolbar === false && this.hasFilters === false && this.hasPrimaryAction === false ? html.nothing : html`
			<div id='toolbar'>
				<mo-flex id='actions' direction='horizontal-reversed' gap='0.5rem' alignItems='center'>
					${this.primaryActionsTemplate}
					${this.toolbarActionsTemplate}
				</mo-flex>
				<slot name='toolbar'>
					${this.toolbarDefaultTemplate}
				</slot>
				<slot name='filter' ?data-collapsed=${!this.filtersOpen}>
					${this.filtersDefaultTemplate}
				</slot>
			</div>
		`
	}

	protected get primaryActionsTemplate() {
		return html`<slot name='primary-action'>${this.primaryActionDefaultTemplate}</slot>`
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
			<slot name='toolbar-action'>
				${this.toolbarActionDefaultTemplate}
			</slot>
		`
	}

	protected getFlattenedData(values = this.data): Array<DataRecord<TData>> {
		return this.controller.records.recordsOf(values)
	}

	get dataRecords(): Array<DataRecord<TData>> {
		return this.controller.records.records
	}

	get renderDataRecords() {
		const rootRecords = this.dataRecords.filter(r => r.level === 0)

		if (this.resolvedPagination?.strategy !== 'pages') {
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