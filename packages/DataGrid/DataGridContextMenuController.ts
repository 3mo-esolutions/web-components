import { Controller, html } from '@a11d/lit'
import { type DataGridController, type DataRecord } from './index.js'

export class DataGridContextMenuController<TData> extends Controller {
	constructor(private readonly grid: DataGridController<TData>) {
		super(grid.host)
	}

	get hasContextMenus() {
		return this.grid.options.getRowContextMenuTemplate !== undefined
	}

	hasContextMenu(record: DataRecord<TData>) {
		const contextMenu = this.grid.options.getRowContextMenuTemplate?.([record.data])
		return !!contextMenu && contextMenu !== html.nothing
	}
}