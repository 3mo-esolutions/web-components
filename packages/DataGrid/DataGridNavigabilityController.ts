import { Controller, eventListener } from '@a11d/lit'
import { NavigabilityController } from '@3mo/navigability'
import { type DataGrid } from './DataGrid.js'
import { type DataGridColumn } from './DataGridColumn.js'
import { type DataGridCell } from './DataGridCell.js'
import { type DataGridRow } from './rows/index.js'

export class DataGridNavigabilityController<TData, TDetailsElement extends Element | undefined = undefined, THost extends DataGrid<TData, TDetailsElement> = DataGrid<TData, TDetailsElement>> extends Controller {
	readonly row: NavigabilityController<DataGridRow<TData, TDetailsElement>, THost>
	readonly column: NavigabilityController<DataGridColumn<TData>, THost>

	constructor(protected override readonly host: THost) {
		super(host)
		const controller = this
		this.row = new NavigabilityController(host, {
			get items() { return controller.rowElements },
			getElement: index => controller.rowElements[index],
			keyboardTarget: null,
			focus: 'activedescendant',
			stamping: false,
			wrap: true,
		})
		this.column = new NavigabilityController(host, {
			get items() { return controller.visibleColumns },
			keyboardTarget: null,
			focus: 'activedescendant',
			stamping: false,
			orientation: 'horizontal',
			wrap: true,
		})
	}

	private rowsCache?: ReadonlyArray<DataGridRow<TData, TDetailsElement>>
	private columnsCache?: ReadonlyArray<DataGridColumn<TData>>

	// Both universes are derived per read on the host, and the cursor's arithmetic reads them per index.
	private get rowElements() { return this.rowsCache ??= this.host.rows }
	private get visibleColumns() { return this.columnsCache ??= this.host.visibleColumns }

	private invalidate() {
		this.rowsCache = undefined
		this.columnsCache = undefined
	}

	override hostUpdated() {
		this.invalidate()
	}

	@eventListener('focusin')
	protected handleFocusIn(event: Event) {
		const cell = event.composedPath().find(target => (target as DataGridCell<any, TData, TDetailsElement>).row?.dataGrid as THost === this.host)
		if (cell) {
			this.invalidate()
			this.syncTo(cell as DataGridCell<any, TData, TDetailsElement>)
		}
	}

	isTabStop(cell: DataGridCell<any, TData, TDetailsElement>) {
		const row = this.row.current ?? this.rowElements[0]
		const column = this.column.current ?? this.visibleColumns[0]
		return cell.row === row && cell.column === column
	}

	/** The cell the cursor is on, where its row has rendered one. */
	get currentCell() {
		const row = this.row.current
		const column = this.column.current
		return !row || !column ? undefined : row.getCell(column)
	}

	handleKeyDown(event: KeyboardEvent, origin: DataGridCell<any, TData, TDetailsElement>) {
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
		let handled = false

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

	focusCell(cell: DataGridCell<any, TData, TDetailsElement>, event?: Event) {
		cell.focus()
		if (this.host.selectOnClick) {
			this.host.selectionController.select(cell.row.data, { selected: true, event })
		}
	}

	private syncTo(cell: DataGridCell<any, TData, TDetailsElement>) {
		const rowIndex = this.rowElements.indexOf(cell.row as DataGridRow<TData, TDetailsElement>)
		const columnIndex = this.visibleColumns.indexOf(cell.column)
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
		const cell = row.getCell(column)
		if (cell) {
			this.focusCell(cell, event)
		} else {
			this.revealAndFocus(row, column, event)
		}
	}

	private async revealAndFocus(row: DataGridRow<TData, TDetailsElement>, column: DataGridColumn<TData>, event: Event) {
		row.isIntersecting = true
		await row.updateComplete
		const cell = row.getCell(column)
		if (cell) {
			this.focusCell(cell, event)
		}
	}
}