import '@a11d/key-path'
import { Controller, eventListener } from '@a11d/lit'
import { DataGridController } from './DataGridController.js'
import { type DataGridColumn } from './DataGridColumn.js'
import { type DataRecord } from './DataRecord.js'

export enum DataGridEditability {
	Never = 'never',
	Cell = 'cell',
	Always = 'always',
}

type Updatable = HTMLElement & { requestUpdate?(): void, readonly updateComplete?: Promise<unknown> }

/**
 * Editing the grid's cells. In `cell` mode a double click or Enter starts it and Escape or a press outside ends
 * it, one cell at a time, and only then is the document listened to; in `always` mode every editable cell edits.
 * A cell is editable when its column is and has an editor for the cell's data.
 */
export class DataGridEditabilityController<TData> extends Controller implements EventListenerObject {
	/** `handleChange` runs for each cell that starts or stops editing. */
	constructor(private readonly grid: DataGridController<TData>, private readonly options?: { readonly handleChange?: (cell: HTMLElement) => void }) {
		super(grid.host)
	}

	private editing?: { readonly cell: HTMLElement, readonly data: TData, readonly column: DataGridColumn<TData> }
	private get cell() { return this.editing?.cell }

	private get mode() { return this.grid.options.editability ?? DataGridEditability.Never }

	private positionOf(cell: HTMLElement) {
		const column = this.grid.columnOf(cell)
		const row = this.grid.rowOf(cell)
		const record = !row ? undefined : this.grid.recordOf(row)
		return !column || !record ? undefined : { record, column }
	}

	private isEditableAt(record: DataRecord<TData>, column: DataGridColumn<TData>) {
		if (this.mode === DataGridEditability.Never) {
			return false
		}
		const editor = column.getEditContentTemplate?.(KeyPath.get(record.data, column.dataSelector), record.data)
		return editor !== undefined && editor !== null
			&& (column.editable === true || (typeof column.editable === 'function' && column.editable(record.data)))
	}

	isEditable(cell: HTMLElement) {
		const position = this.positionOf(cell)
		return !!position && this.isEditableAt(position.record, position.column)
	}

	isEditing(cell: HTMLElement) {
		return this.isEditable(cell) && (this.cell === cell || this.mode === DataGridEditability.Always)
	}

	/** Whether the cell of a record and a column shows its editor, for a host that renders its cells from a template and so asks before they exist. */
	isEditingAt(record: DataRecord<TData>, column: DataGridColumn<TData>) {
		const { editing } = this
		return this.isEditableAt(record, column) && (this.mode === DataGridEditability.Always
			|| (!!editing && editing.data === record.data && DataGridController.isSameColumn(editing.column, column)))
	}

	async setEditing(cell: HTMLElement, editing: boolean) {
		if ((this.cell === cell) === editing) {
			return
		}
		const position = this.positionOf(cell)
		if (editing && !position) {
			return
		}
		const previous = this.cell
		this.editing = !editing ? undefined : { cell, data: position!.record.data, column: position!.column }
		for (const changed of new Set([previous, cell]) as Set<Updatable | undefined>) {
			if (changed) {
				if (changed.requestUpdate) {
					changed.requestUpdate()
				} else {
					this.grid.host.requestUpdate()
				}
				this.options?.handleChange?.(changed)
			}
		}
		this.listen()
		await ((cell as Updatable).updateComplete ?? this.grid.host.updateComplete)
		if (editing) {
			(cell.shadowRoot ?? cell).querySelector<HTMLElement>('[autofocus]')?.focus()
		}
	}

	@eventListener('dblclick')
	protected handleDoubleClick(event: MouseEvent) {
		const cell = this.grid.cellOf(event)
		if (cell && this.mode === DataGridEditability.Cell) {
			event.preventDefault()
			if (this.isEditable(cell)) {
				this.setEditing(cell, true)
			}
		}
	}

	@eventListener('keydown')
	protected async handleKeyDown(event: KeyboardEvent) {
		const cell = this.grid.cellOf(event)
		if (!cell || event.defaultPrevented) {
			return
		}
		switch (event.key) {
			case 'Enter':
				if (this.isEditing(cell)) {
					// Uncancelled, so that the editor commits its value before it goes. A textarea keeps Enter for its lines.
					if (this.mode === DataGridEditability.Cell && !(event.composedPath()[0] instanceof HTMLTextAreaElement)) {
						await this.setEditing(cell, false)
						this.grid.navigability.focusCell(cell, event)
					}
				} else {
					event.preventDefault()
					event.stopPropagation()
					if (this.isEditable(cell)) {
						this.setEditing(cell, true)
					} else {
						cell.click()
					}
				}
				break
			case 'Escape':
				if (!this.isEditing(cell)) {
					break
				}
				event.preventDefault()
				event.stopPropagation()
				await this.setEditing(cell, false)
				this.grid.navigability.focusCell(cell, event)
				break
		}
	}

	handleEvent(event: Event) {
		if (this.cell && !event.composedPath().includes(this.cell)) {
			this.setEditing(this.cell, false)
		}
	}

	override hostConnected() {
		this.listen()
	}

	override hostDisconnected() {
		document.removeEventListener('pointerdown', this)
	}

	private listen() {
		if (this.cell) {
			document.addEventListener('pointerdown', this)
		} else {
			document.removeEventListener('pointerdown', this)
		}
	}
}