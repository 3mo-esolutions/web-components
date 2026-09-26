import { Controller } from '@a11d/lit'
import { type DataGridController } from './index.js'

export class DataGridContextMenuController<TData> extends Controller {
	constructor(private readonly grid: DataGridController<TData>) {
		super(grid.host)
	}

	get hasContextMenu() {
		return this.grid.options.getRowContextMenuTemplate !== undefined
	}
}