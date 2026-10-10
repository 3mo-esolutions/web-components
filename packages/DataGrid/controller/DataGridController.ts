import { Controller, ElementRef, ElementRefs, notEqual, type DirectiveResult, type HTMLTemplateResult, type ReactiveElement } from '@a11d/lit'
import { equals } from '@a11d/equals'
import { IndexabilityController, type IndexabilityItem } from '@3mo/indexability'
import { type ExpandabilityItemOptions } from '@3mo/expandability'
import { type DataRecord } from './DataRecord.js'
import { type DataGridColumn } from './DataGridColumn.js'
import { DataGridColumnsController } from './DataGridColumnsController.js'
import { DataGridSelectability, type DataGridSelectionBehaviorOnDataChange, DataGridSelectionController } from './DataGridSelectionController.js'
import { type DataGridRankedSortDefinition, type DataGridSorting, DataGridSortingController } from './DataGridSortingController.js'
import { DataGridContextMenuController } from './DataGridContextMenuController.js'
import { DataGridDetailsController } from './DataGridDetailsController.js'
import { DataGridCsvController } from './DataGridCsvController.js'
import { type DataGridReorderChange, DataGridReorderabilityController } from './DataGridReorderabilityController.js'
import { DataGridNavigabilityController } from './DataGridNavigabilityController.js'
import { type DataGridEditability, DataGridEditabilityController } from './DataGridEditabilityController.js'
import { DataGridRecordsController } from './DataGridRecordsController.js'
import { DataGridVirtualizationController } from './DataGridVirtualizationController.js'

type DataGridRowItem<TData> = IndexabilityItem<DataRecord<TData>, ExpandabilityItemOptions<DataRecord<TData>>>

type DataGridColumnHeaderPart<TData> = {
	readonly column: DataGridColumn<TData>
	readonly handle?: string
	readonly dragImage?: HTMLTemplateResult
}

/** What a grid is made of and what it reports. Every option is read when needed, so a getter keeps it live. */
export interface DataGridControllerOptions<TData> {
	/** Every datum, rendered or not. */
	readonly data: ReadonlyArray<TData>
	/** The columns' definitions. A new array re-syncs them, so a host keeps the array while nothing changed. */
	readonly columns: ReadonlyArray<DataGridColumn<TData>>
	/** Where a datum keeps its sub data, which makes the grid a tree grid. */
	readonly subDataGridDataSelector?: KeyPath.Of<TData>

	/** Given, the host owns the sorting and commits it in `handleSortingChange`. */
	readonly sorting?: DataGridSorting<TData>
	readonly handleSortingChange?: (sorting: Array<DataGridRankedSortDefinition<TData>>) => void

	readonly selectability?: DataGridSelectability
	/** Given, the host owns the selection and commits it in `handleSelectionChange`. */
	readonly selectedData?: ReadonlyArray<TData>
	readonly handleSelectionChange?: (selection: Array<TData>) => void
	readonly isDataSelectable?: (data: TData) => boolean
	readonly selectionBehaviorOnDataChange?: DataGridSelectionBehaviorOnDataChange
	/** Moving the cursor onto a row selects it. */
	readonly selectOnClick?: boolean

	readonly multipleDetails?: boolean
	/** Narrows which records have details. */
	readonly hasDataDetail?: (data: TData) => boolean
	/** Details content, which gives a record details on top of its sub records. */
	readonly getRowDetailsTemplate?: (data: TData) => HTMLTemplateResult
	/** Whether the rows render their details the grid's own way. Defaults to `true`. */
	readonly hasDefaultRowElements?: boolean

	readonly reorderability?: boolean
	/** The data in its new order, and what moved. */
	readonly handleReorder?: (data: Array<TData>, changes: Array<DataGridReorderChange<TData>>) => void

	readonly handleColumnsChange?: (columns: Array<DataGridColumn<TData>>) => void
	readonly getRowContextMenuTemplate?: (data: Array<TData>) => HTMLTemplateResult
	/** Defaults to `never`. */
	readonly editability?: DataGridEditability
	/** A cell's text was copied. */
	readonly handleCopy?: (text: string) => void
	/** Everything an export writes, yielding progress in between. Defaults to the records. */
	readonly getCsvData?: () => AsyncGenerator<number, Array<DataRecord<TData>>>
	/** The export as CSV text, to download, say. */
	readonly handleCsv?: (csv: string) => void | Promise<void>
	readonly handleCsvError?: (error: Error) => void
}

/**
 * The data grid on any host, one controller per concern:
 *
 * ```ts
 * readonly grid = new DataGridController<Person>(this, host => ({
 *   get data() { return host.people },
 *   columns: [new DataGridColumn({ heading: 'Name', dataSelector: 'name' })],
 * }))
 * ```
 * ```html
 * <table ${this.grid.root.ref()}>
 *   <tr ${this.grid.header.ref()}>
 *     <th ${this.grid.columnHeader(column)}>
 *   <tr ${this.grid.row(record)}>
 *     <td ${this.grid.cell(column)}>
 * ```
 *
 * The root, the header, the rows and the cells are parts. The controller stamps each with its role, its
 * place in the hierarchy, the sorting and where it sticks, and hands the rows to the details, the
 * selection and the reordering, which stamp their own states onto them.
 */
export class DataGridController<TData, THost extends ReactiveElement = ReactiveElement> extends Controller {
	constructor(host: THost, options: DataGridControllerOptions<TData> | ((host: THost) => DataGridControllerOptions<TData>))
	// Stored without its host type, so that a controller of any host is a controller of an element
	constructor(override readonly host: THost, private readonly optionsSource: DataGridControllerOptions<TData> | ((host: any) => DataGridControllerOptions<TData>)) {
		super(host)
		this.rowIndexability.observe({
			handleItemUpdated: item => this.handleRowUpdated(item),
			handleItemRemoved: element => this.handleRowRemoved(element),
		})
	}

	private _options?: DataGridControllerOptions<TData>
	get options() {
		return this._options ??= typeof this.optionsSource === 'function' ? this.optionsSource(this.host) : this.optionsSource
	}

	private readonly rowIndexability = new IndexabilityController<DataRecord<TData>, ExpandabilityItemOptions<DataRecord<TData>>>(this.host)

	readonly columns = new DataGridColumnsController<TData>(this)
	readonly records = new DataGridRecordsController<TData>(this.options, this)
	readonly sorting = new DataGridSortingController<TData>(this.sortingOptions())
	readonly selection = new DataGridSelectionController<TData>(this, { handleChange: () => this.handleStampedChange() })
	readonly details = new DataGridDetailsController<TData>(this, { indexability: this.rowIndexability, handleChange: () => this.handleStampedChange() })
	readonly navigability = new DataGridNavigabilityController<TData>(this, { handleChange: () => this.handleStampedChange() })
	readonly editability = new DataGridEditabilityController<TData>(this, { handleChange: cell => this.navigability.stampCell(cell) })
	readonly reorderability = new DataGridReorderabilityController<TData>(this)
	readonly virtualization = new DataGridVirtualizationController(this.host)
	readonly contextMenu = new DataGridContextMenuController<TData>(this)
	readonly csv = new DataGridCsvController<TData>(this)

	private sortingOptions() {
		const controller = this
		const handleChange = (sorting: Array<DataGridRankedSortDefinition<TData>>) => {
			controller.options.handleSortingChange?.(sorting)
			controller.host.requestUpdate()
		}
		return 'sorting' in this.options
			? { get sorting() { return controller.options.sorting }, handleChange }
			: { handleChange }
	}

	/** The element that is the grid, `<table ${controller.root.ref()}>`. Without one, the host is. */
	readonly root = new ElementRef<HTMLElement>({ updated: () => this.stampRoot() })

	/** Once the host rendered, as only then is it known whether its template holds the root. */
	private stampRoot() {
		const root = this.root.value
		const role = this.options.subDataGridDataSelector ? 'treegrid' : 'grid'
		if (!root) {
			this.host.role = role
			return
		}
		root.role = role
		if (this.selection.selectability === DataGridSelectability.Multiple) {
			root.setAttribute('aria-multiselectable', 'true')
		} else {
			root.removeAttribute('aria-multiselectable')
		}
	}

	/** The row holding the column headers: `<tr ${controller.header.ref()}>`. */
	readonly header = new ElementRef<HTMLElement>({ updated: element => element.role = 'row' })

	private readonly columnHeaders = new ElementRefs<HTMLElement, DataGridColumnHeaderPart<TData>>({
		updated: (element, part) => this.stampColumnHeader(element, part),
		disconnected: element => this.columns.reorderability.indexability.deleteItem(element),
	})

	/**
	 * Registers the header of a column, which dragging moves: `<th ${controller.columnHeader(column)}>`.
	 * A `handle` confines the grab to a part of it, and a `dragImage` follows the pointer instead of it.
	 */
	columnHeader(column: DataGridColumn<TData>, options?: Omit<DataGridColumnHeaderPart<TData>, 'column'>) {
		return this.columnHeaders.ref({ column, ...options })
	}

	columnHeaderOf(column: DataGridColumn<TData>) {
		for (const element of this.columnHeaders) {
			if (DataGridController.isSameColumn(this.columnHeaders.get(element)!.column, column)) {
				return element
			}
		}
		return undefined
	}

	/** The sorting announces itself on the header of the column sorted first only, as a table has one order. */
	private stampColumnHeader(element: HTMLElement, { column, handle, dragImage }: DataGridColumnHeaderPart<TData>) {
		this.columns.reorderability.indexability.addItem(element, {
			index: this.columns.columns.visible.findIndex(candidate => DataGridController.isSameColumn(candidate, column)),
			disabled: !!column.sticky,
			excluded: DataGridColumnsController.resizerSelector,
			handle,
			dragImage,
		})
		element.role = 'columnheader'
		const [primary] = this.sorting.get()
		if (!column.sortable) {
			element.removeAttribute('aria-sort')
		} else {
			element.setAttribute('aria-sort', primary?.selector === column.sortDataSelector ? primary.strategy : 'none')
		}
		this.columns.stampSticky(element, column)
	}

	private readonly cells = new ElementRefs<HTMLElement, DataGridColumn<TData>>({ updated: cell => this.stampCell(cell) })

	/** Registers a cell of a column: `<td ${controller.cell(column)}>`. Its row is the registered row it sits in. */
	cell(column: DataGridColumn<TData>) {
		return this.cells.ref(column)
	}

	private stampCell(cell: HTMLElement) {
		this.navigability.stampCell(cell)
		this.columns.stampSticky(cell, this.cells.get(cell)!)
	}

	/** Restamps every sticky part, once the widths moved where they stick. */
	restampSticky() {
		const parts = [
			...[...this.cells].map(element => [element, this.cells.get(element)] as const),
			...[...this.columnHeaders].map(element => [element, this.columnHeaders.get(element)?.column] as const),
		]
		for (const [element, column] of parts) {
			if (column?.sticky) {
				this.columns.stampSticky(element, column)
			}
		}
	}

	/** The registered cell an event landed in. */
	cellOf(event: Event) {
		return event.composedPath().find((target): target is HTMLElement => this.cells.has(target as HTMLElement))
	}

	columnOf(cell: HTMLElement) {
		return this.cells.get(cell)
	}

	/** The registered row a cell sits in, across the shadow roots between them. */
	rowOf(cell: Element) {
		let element: Element | null = cell
		while (element) {
			element = element.parentElement ?? (element.getRootNode() as Partial<ShadowRoot>).host ?? null
			if (element && this.recordOf(element)) {
				return element as HTMLElement
			}
		}
		return undefined
	}

	/** The rendered cell of a row and a column. */
	cellAt(row: HTMLElement, column: DataGridColumn<TData>) {
		for (const cell of this.cells) {
			const cellColumn = this.cells.get(cell)
			if (cellColumn && DataGridController.isSameColumn(cellColumn, column) && this.rowOf(cell) === row) {
				return cell
			}
		}
		return undefined
	}

	static isSameColumn<TData>(a: DataGridColumn<TData>, b: DataGridColumn<TData>) {
		return a === b || a[equals](b)
	}

	/** Registers a row: `<tr ${controller.row(record)}>`. */
	row(record: DataRecord<TData>): DirectiveResult {
		return this.rowIndexability.item({ index: record.index, data: record })
	}

	/** The rendered rows, sub rows included, in the order of their records. */
	get rows(): Array<HTMLElement> {
		return this.rowIndexability.items.map(({ element }) => element)
	}

	/** The record a rendered row shows. */
	recordOf(row: Element): DataRecord<TData> | undefined {
		return this.rowIndexability.itemAt([row])?.options.data
	}

	private handleRowUpdated({ element, options: { index, data: record } }: DataGridRowItem<TData>) {
		element.role = 'row'
		element.setAttribute('aria-level', String(record.level + 1))
		if (record.node) {
			element.setAttribute('aria-setsize', String(record.node.setSize))
			element.setAttribute('aria-posinset', String(record.node.position + 1))
		}
		this.selection.indexability.addItem(element, { index, data: record.data })
		this.reorderability.indexability.addItem(element, { index, disabled: !this.reorderability.enabled })
	}

	private handleRowRemoved(element: HTMLElement) {
		this.selection.indexability.deleteItem(element)
		this.reorderability.indexability.deleteItem(element)
	}

	/*
	 * Records are derived again and row elements re-render with the host, which consumers who change data in place rely on,
	 * unless only the selection, the details or the cursor changed: those re-render only the rows they changed.
	 */
	private refreshRequested = true
	private stampedRequest = false
	private refreshesRows = true
	private readonly renderedRowStates = new WeakMap<HTMLElement, string>()

	/** For a host whose rows are elements of their own: its `requestUpdate`, which the selection, the details and the cursor call right after they changed. */
	handleUpdateRequest(...[property, oldValue, options]: Parameters<ReactiveElement['requestUpdate']>) {
		if (property === undefined) {
			this.refreshRequested ||= !this.stampedRequest
			this.stampedRequest = false
		} else if ((options?.hasChanged ?? notEqual)((this.host as unknown as Record<PropertyKey, unknown>)[property], oldValue)) {
			this.refreshRequested = true
		}
	}

	private handleStampedChange() {
		this.stampedRequest = true
	}

	override hostUpdate() {
		this.refreshesRows = this.refreshRequested
		this.refreshRequested = false
		if (this.refreshesRows) {
			this.records.invalidate()
		}
	}

	override hostUpdated() {
		this.stampRoot()
		for (const { element, options: { data: record } } of this.rowIndexability.items) {
			const state = `${this.selection.isSelected(record.data)} ${this.details.isOpen(record)}`
			if (this.refreshesRows || this.renderedRowStates.get(element) !== state) {
				(element as HTMLElement & { requestUpdate?(): void }).requestUpdate?.()
			}
			this.renderedRowStates.set(element, state)
		}
	}
}
