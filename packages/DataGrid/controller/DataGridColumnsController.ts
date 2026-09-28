import { Controller, ElementRefs } from '@a11d/lit'
import { equals } from '@a11d/equals'
import { PointerDragController, type PointerDrag } from '@3mo/pointer-controller'
import { ReorderabilityController } from '@3mo/reorderability'
import { type DataGridColumn } from './DataGridColumn.js'
import { type DataGridController } from './DataGridController.js'
import { DataGridColumns } from './DataGridColumns.js'

/**
 * Connects a data grid to its columns, feeding them the definitions the host gives in its options and
 * reflecting them back into the data grid's rendering. The controller never sources columns: whatever
 * declares them — code, column elements, the data's own keys — is the host's business.
 *
 * @see DataGridColumns for the columns themselves and the layers they are composed of.
 */
export class DataGridColumnsController<TData> extends Controller implements EventListenerObject {
	private readonly columnWidths = { reordering: 0, details: 0, selection: 0, actions: 0 }
	private readonly widthsInPixels = new Map<KeyPath.Of<TData>, number>()

	// Created on first access rather than initialized inline, as composing columns reads from the host
	private _columns?: DataGridColumns<TData>
	get columns() {
		return this._columns ??= new DataGridColumns<TData>({
			prepare: column => column.controller = this.grid,
			updated: () => this.columnsUpdated(),
		})
	}

	constructor(private readonly grid: DataGridController<TData>) {
		super(grid.host)
	}

	/** Dragging a column header moves its column. A sticky column stays where it sticks. */
	readonly reorderability = new ReorderabilityController(this.grid.host, {
		strategy: 'indicator',
		handleReorder: (source, destination) => this.move(source, destination),
	})

	private move(source: number, destination: number) {
		const visible = this.columns.visible
		const sourceColumn = visible[source]
		const destinationColumn = visible[destination]
		if (sourceColumn && destinationColumn) {
			this.columns.move(sourceColumn.dataSelector, [...this.columns].indexOf(destinationColumn))
		}
	}

	static readonly resizerSelector = '[data-column-resizer]'
	private static readonly minimumWidth = 30

	private readonly resizers = new ElementRefs<HTMLElement, DataGridColumn<TData>>({ updated: element => element.toggleAttribute('data-column-resizer', true) })

	/** A handle that resizes its column as it is dragged, and fits it to its content on a double click: `<div ${controller.columns.resizer(column)}>`. */
	resizer(column: DataGridColumn<TData>) {
		return this.resizers.ref(column)
	}

	private resizing?: { readonly handle: HTMLElement, readonly column: DataGridColumn<TData>, initial?: number, width?: number }
	/** The drag captures the pointer on the host, which a double click then lands on instead of the handle. */
	private lastPressed?: { readonly handle: HTMLElement, readonly column: DataGridColumn<TData> }

	protected readonly resizeDrag = new PointerDragController(this.grid.host, {
		threshold: 0,
		handlePress: event => this.handleResizePress(event),
		handleDragStart: drag => this.handleResizeStart(drag),
		handleDrag: drag => this.handleResize(drag),
		handleDragEnd: () => this.handleResizeEnd(),
		handleDragCancel: () => this.handleResizeCancel(),
	})

	private resizerOf(event: Event) {
		return event.composedPath().find((target): target is HTMLElement => this.resizers.has(target as HTMLElement))
	}

	private handleResizePress(event: PointerEvent) {
		const handle = this.resizerOf(event)
		const column = !handle ? undefined : this.resizers.get(handle)
		this.lastPressed = !handle || !column ? undefined : { handle, column }
		if (!handle || !column) {
			return false
		}
		this.resizing = { handle, column }
		return true
	}

	private handleResizeStart({ event }: PointerDrag) {
		const resizing = this.resizing
		if (resizing) {
			resizing.initial = resizing.column.widthInPixels || this.grid.columnHeaderOf(resizing.column)?.getBoundingClientRect().width || 0
			resizing.handle.toggleAttribute('data-resizing', true)
			this.stampPointer(event)
		}
	}

	private handleResize({ deltaX, event }: PointerDrag) {
		const resizing = this.resizing
		if (resizing) {
			const inlineDelta = this.grid.host.matches(':dir(rtl)') ? -deltaX : deltaX
			resizing.width = Math.max(DataGridColumnsController.minimumWidth, (resizing.initial ?? 0) + inlineDelta)
			this.stampPointer(event)
		}
	}

	private handleResizeEnd() {
		const resizing = this.resizing
		this.handleResizeCancel()
		if (resizing?.width !== undefined && resizing.width !== resizing.initial) {
			resizing.column.modify({ width: `${resizing.width}px` })
		}
	}

	private handleResizeCancel() {
		this.resizing?.handle.removeAttribute('data-resizing')
		this.resizing?.handle.style.removeProperty('--mo-data-grid-column-resizer-pointer')
		this.resizing = undefined
	}

	/** Where the pointer is, from the inline start of the viewport, for a host drawing a line there. */
	private stampPointer({ clientX }: PointerEvent) {
		const inlineStart = this.grid.host.matches(':dir(rtl)') ? window.innerWidth - clientX : clientX
		this.resizing?.handle.style.setProperty('--mo-data-grid-column-resizer-pointer', `${inlineStart}px`)
	}

	// Listens as itself, as Lit connects a controller while it constructs when its host is already connected.
	override hostConnected() {
		this.grid.host.addEventListener('dblclick', this)
	}

	override hostDisconnected() {
		this.grid.host.removeEventListener('dblclick', this)
	}

	/** A double click on a resizer fits its column to its content. */
	handleEvent(event: Event) {
		const handle = this.resizerOf(event)
		const column = handle ? this.resizers.get(handle) : event.target === this.grid.host ? this.lastPressed?.column : undefined
		if (column) {
			this.handleResizeCancel()
			column.modify({ width: 'max-content' })
		}
	}

	override hostUpdate() {
		this.syncColumns()
	}

	private definitions?: ReadonlyArray<DataGridColumn<TData>>
	syncColumns() {
		const { columns } = this.grid.options
		if (columns !== this.definitions) {
			this.definitions = columns
			this.columns.definitions = columns
		}
	}

	private columnsUpdated() {
		this.grid.options.handleColumnsChange?.([...this.columns])
		this.grid.host.requestUpdate()
	}

	getWidthInPixels(dataSelector: KeyPath.Of<TData>) {
		return this.widthsInPixels.get(dataSelector)
	}

	setWidthInPixels(dataSelector: KeyPath.Of<TData>, width: number) {
		if (this.widthsInPixels.get(dataSelector) !== width) {
			this.handleMetricsChange(() => this.widthsInPixels.set(dataSelector, width))
		}
	}

	setColumnWidth(column: keyof typeof this.columnWidths, widthInPixels: number) {
		if (this.columnWidths[column] !== widthInPixels) {
			this.handleMetricsChange(() => this.columnWidths[column] = widthInPixels)
		}
	}

	/** Where every sticky part sticks, computed once per change of the widths, of the columns or of the columns the grid renders itself. */
	private insets?: { readonly layout: string, readonly values: ReadonlyMap<unknown, string> }

	private get layout() {
		const { reorderability, details, selection, contextMenu } = this.grid
		return [reorderability.visible, details.hasDetails, selection.hasSelection, contextMenu.hasContextMenu, ...this.columns.visible.map(column => `${column.dataSelector}:${column.sticky}`)].join()
	}

	private get currentInsets() {
		const layout = this.layout
		if (this.insets?.layout !== layout) {
			this.insets = { layout, values: this.computeInsets() }
		}
		return this.insets.values
	}

	getStickyColumnInsetInline(column: DataGridColumn<TData> | keyof typeof this.columnWidths) {
		const insets = this.currentInsets
		return typeof column !== 'object' ? insets.get(column)!
			: !column.sticky ? '' : insets.get(this.visibleIndexOf(column)) ?? ''
	}

	/** By position, as two columns may show the same data. */
	private visibleIndexOf(column: DataGridColumn<TData>) {
		const visible = this.columns.visible
		const index = visible.indexOf(column)
		return index !== -1 ? index : visible.findIndex(candidate => candidate[equals](column))
	}

	private static readonly features = ['reordering', 'details', 'selection', 'actions'] as const

	private computeInsets() {
		const widths = {
			reordering: !this.grid.reorderability.visible ? 0 : this.columnWidths.reordering,
			details: !this.grid.details.hasDetails ? 0 : this.columnWidths.details,
			selection: !this.grid.selection.hasSelection ? 0 : this.columnWidths.selection,
			actions: !this.grid.contextMenu.hasContextMenu ? 0 : this.columnWidths.actions
		}
		const insets = new Map<unknown, string>([
			['reordering', '0px'],
			['details', `${widths.reordering}px`],
			['selection', `${widths.reordering + widths.details}px`],
			['actions', 'auto'],
		])
		const visibleColumns = this.columns.visible
		visibleColumns.forEach((column, columnIndex) => {
			if (!column.sticky) {
				return
			}
			const calculate = (type: 'start' | 'end') => visibleColumns
				.filter((c, i) => c.sticky === type && (type === 'start' ? i < columnIndex : i > columnIndex))
				.reduce((sum, c) => sum + c.widthInPixels, 0)
			const start = `${widths.reordering + widths.selection + widths.details + calculate('start')}px`
			const end = `${calculate('end') + widths.actions}px`
			insets.set(columnIndex, column.sticky === 'start' ? `${start} auto` : column.sticky === 'end' ? `auto ${end}` : `${start} ${end}`)
		})
		return insets
	}

	/** Widths only move where the sticky parts stick, so those are restamped rather than the grid re-rendered, unless the columns the grid itself renders moved. */
	private handleMetricsChange(change: () => void) {
		const previous = this.currentInsets
		change()
		const insets = this.computeInsets()
		this.insets = { layout: this.layout, values: insets }
		if (DataGridColumnsController.features.some(feature => previous.get(feature) !== insets.get(feature))) {
			this.grid.host.requestUpdate()
		} else if ([...insets].some(([key, inset]) => previous.get(key) !== inset)) {
			this.grid.restampSticky()
		}
	}

	/** Where a column sticks, stamped onto one of its parts. */
	stampSticky(element: HTMLElement, column: DataGridColumn<TData>) {
		if (column.sticky) {
			element.setAttribute('data-sticky', column.sticky)
		} else {
			element.removeAttribute('data-sticky')
		}
		const edge = column.stickyEdge
		if (edge) {
			element.setAttribute('data-sticky-edge', edge)
		} else {
			element.removeAttribute('data-sticky-edge')
		}
		element.style.insetInline = this.getStickyColumnInsetInline(column)
	}
}