import { Controller, eventListener } from '@a11d/lit'
import { NavigabilityController } from '@3mo/navigability'
import { type DataGridColumn } from './DataGridColumn.js'
import { DataGridController } from './DataGridController.js'
import { type VirtualizableRow } from './DataGridVirtualizationController.js'

/**
 * The cursor over the grid's cells: one cursor over the rows, one over the columns, and the one cell in the
 * tab order where they meet. An edited cell leaves the tab order and the keys to its editor. Ctrl or Meta
 * with C copies the cell's text.
 */
export class DataGridNavigabilityController<TData> extends Controller {
	readonly row: NavigabilityController<HTMLElement>
	readonly column: NavigabilityController<DataGridColumn<TData>>

	/** `handleChange` runs whenever the cursor moves. */
	constructor(private readonly grid: DataGridController<TData>, private readonly options?: { readonly handleChange?: () => void }) {
		super(grid.host)
		const controller = this
		this.row = new NavigabilityController<HTMLElement>(grid.host, {
			get items() { return controller.rowElements },
			getElement: index => controller.rowElements[index],
			keyboardTarget: null,
			focus: 'activedescendant',
			stamping: false,
			wrap: true,
			handleChange: () => controller.handleCursorChange(),
		})
		this.column = new NavigabilityController<DataGridColumn<TData>>(grid.host, {
			get items() { return controller.visibleColumns },
			keyboardTarget: null,
			focus: 'activedescendant',
			stamping: false,
			orientation: 'horizontal',
			wrap: true,
			handleChange: () => controller.handleCursorChange(),
		})
	}

	private tabStop?: HTMLElement

	/** The one cell in the tab order sits at the cursor, and an edited cell leaves the tab order to its editor. */
	stampCell(cell: HTMLElement) {
		if (!cell.isConnected) {
			// Declared mid-template, before its row holds it: the stamp that asks for the row waits for the render to land.
			queueMicrotask(() => cell.isConnected && this.stampCell(cell))
			return
		}
		cell.role = 'gridcell'
		if (this.grid.editability.isEditing(cell)) {
			cell.removeAttribute('tabindex')
		} else {
			cell.setAttribute('tabindex', this.isTabStop(cell) ? '0' : '-1')
		}
		if (cell.getAttribute('tabindex') === '0') {
			this.tabStop = cell
		}
	}

	private handleCursorChange() {
		this.moveTabStop()
		this.options?.handleChange?.()
	}

	private moveTabStop() {
		const previous = this.tabStop
		const row = this.row.current ?? this.rowElements[0]
		const column = this.column.current ?? this.visibleColumns[0]
		const next = !row || !column ? undefined : this.grid.cellAt(row, column)
		if (previous !== next) {
			this.tabStop = undefined
			for (const cell of [previous, next]) {
				if (cell) {
					this.stampCell(cell)
				}
			}
		}
	}

	private rowsCache?: ReadonlyArray<HTMLElement>
	private columnsCache?: ReadonlyArray<DataGridColumn<TData>>

	// Both universes are derived per read, and the cursor's arithmetic reads them per index.
	private get rowElements() { return this.rowsCache ??= this.grid.rows }
	private get visibleColumns() { return this.columnsCache ??= this.grid.columns.columns.visible }

	private invalidate() {
		this.rowsCache = undefined
		this.columnsCache = undefined
	}

	override hostUpdated() {
		this.invalidate()
	}

	@eventListener('focusin')
	protected handleFocusIn(event: Event) {
		const cell = this.grid.cellOf(event)
		if (cell) {
			this.invalidate()
			this.syncTo(cell)
		}
	}

	@eventListener('keydown')
	protected handleHostKeyDown(event: KeyboardEvent) {
		const cell = this.grid.cellOf(event)
		if (!cell || this.grid.editability.isEditing(cell)) {
			return
		}
		if (event.key === 'c' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault()
			this.copy(cell)
			return
		}
		this.handleKeyDown(event, cell)
	}

	private async copy(cell: HTMLElement) {
		const text = (cell.shadowRoot ?? cell).textContent?.trim() ?? ''
		await navigator.clipboard.writeText(text)
		this.grid.options.handleCopy?.(text)
	}

	private isTabStop(cell: HTMLElement) {
		const row = this.row.current ?? this.rowElements[0]
		const column = this.column.current ?? this.visibleColumns[0]
		const cellColumn = this.grid.columnOf(cell)
		return !!row && !!column && !!cellColumn && DataGridController.isSameColumn(cellColumn, column) && this.grid.rowOf(cell) === row
	}

	/** The cell the cursor is on, where its row has rendered one. */
	get currentCell() {
		const row = this.row.current
		const column = this.column.current
		return !row || !column ? undefined : this.grid.cellAt(row, column)
	}

	handleKeyDown(event: KeyboardEvent, origin: HTMLElement) {
		if (event.defaultPrevented) {
			return false
		}
		if (event.key === 'Tab') {
			return false
		}
		this.invalidate()
		if (!this.syncTo(origin)) {
			return false
		}
		const options = { method: 'keyboard' as const, event }
		const rowIndex = this.row.index
		const columnIndex = this.column.index
		let handled: boolean

		switch (event.key) {
			case 'Home':
			case 'End':
				if (event.ctrlKey || event.metaKey) {
					const method = event.key === 'Home' ? 'goFirst' : 'goLast'
					this.row[method](options)
					this.column[method](options)
					handled = true
				} else {
					handled = this.column.handleKeyDown(event)
				}
				break
			case 'ArrowLeft':
			case 'ArrowRight':
				handled = this.column.handleKeyDown(event)
				break
			default:
				handled = this.row.handleKeyDown(event)
				break
		}

		if (handled) {
			if (this.row.index !== rowIndex || this.column.index !== columnIndex) {
				this.focusCurrent(event)
			}
			event.preventDefault()
		}
		return handled
	}

	focusCell(cell: HTMLElement, event?: Event) {
		cell.focus()
		const row = this.grid.rowOf(cell)
		const record = !row ? undefined : this.grid.recordOf(row)
		if (this.grid.options.selectOnClick && record) {
			this.grid.selection.select(record.data, { selected: true, event })
		}
	}

	private syncTo(cell: HTMLElement) {
		const row = this.grid.rowOf(cell)
		const column = this.grid.columnOf(cell)
		const rowIndex = !row ? -1 : this.rowElements.indexOf(row)
		const columnIndex = !column ? -1 : this.visibleColumns.findIndex(candidate => DataGridController.isSameColumn(candidate, column))
		if (rowIndex < 0 || columnIndex < 0) {
			return false
		}
		const options = { method: 'programmatic' as const }
		this.row.goTo(rowIndex, options)
		this.column.goTo(columnIndex, options)
		return true
	}

	private focusCurrent(event: Event) {
		const row = this.row.current
		const column = this.column.current
		if (!row || !column) {
			return
		}
		const cell = this.grid.cellAt(row, column)
		if (cell) {
			this.focusCell(cell, event)
		} else if ('requestUpdate' in row) {
			this.revealAndFocus(row as HTMLElement & VirtualizableRow, column, event)
		}
	}

	private async revealAndFocus(row: HTMLElement & VirtualizableRow, column: DataGridColumn<TData>, event: Event) {
		await this.grid.virtualization.reveal(row)
		const cell = this.grid.cellAt(row, column)
		if (cell) {
			this.focusCell(cell, event)
		}
	}
}
