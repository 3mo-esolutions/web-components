import { Controller } from '@a11d/lit'
import { DataGridColumnComponent, type DataGrid, type DataGridColumn } from './index.js'

export class DataGridColumnsController<TData> extends Controller {
	readonly detailsColumnWidthInPixels = 0
	readonly selectionColumnWidthInPixels = 0
	readonly moreColumnWidthInPixels = 0

	private initialized = false

	constructor(override readonly host: DataGrid<TData, any>) {
		super(host)
	}

	override hostUpdate() {
		this.provideCssColumnsProperties()
	}

	override hostUpdated() {
		if (!this.initialized && !this.host.columns.length) {
			this.extractColumns()
		}
		this.host.columns.forEach(column => column.dataGrid = this.host)
		this.initialized = true
	}

	get visibleColumns() {
		return this.host.columns.filter(c => c.hidden === false)
	}

	setColumns(columns: Array<DataGridColumn<TData>>) {
		this.host.columns = columns
		this.host.columnsChange.dispatch(columns)
		this.host.requestUpdate()
	}

	extractColumns() {
		const extractedColumns = this.elementExtractedColumns.length > 0
			? this.elementExtractedColumns
			: this.autoGeneratedColumns
		this.setColumns(extractedColumns)
	}

	// The reason for not doing this in the CSS is that we need to trim all the 0px values out of the columns
	// because the 'grid column gap' renders a gap no matter if the column is 0px or not
	private provideCssColumnsProperties() {
		const contentWidth = this.dataColumnsWidths.join(' ')
		if (this.host.style.getPropertyValue('--mo-data-grid-content-width') !== contentWidth) {
			this.host.style.setProperty('--mo-data-grid-content-width', this.dataColumnsWidths.join(' '))
		}

		const columns = this.columnsWidths.join(' ')
		if (this.host.style.getPropertyValue('--mo-data-grid-columns') !== columns) {
			this.host.style.setProperty('--mo-data-grid-columns', columns)
		}
	}

	private get columnsWidths() {
		return [
			this.detailsColumnWidth,
			this.selectionColumnWidth,
			...this.dataColumnsWidths,
			'1fr',
			this.moreColumnWidth
		].filter((c): c is string => c !== undefined)
	}

	private get detailsColumnWidth() {
		return !this.host.hasDetails ? undefined : window.getComputedStyle(this.host).getPropertyValue('--mo-data-grid-column-details-width')
	}

	private get selectionColumnWidth() {
		return !this.host.hasSelection || this.host.selectionCheckboxesHidden ? undefined : window.getComputedStyle(this.host).getPropertyValue('--mo-data-grid-column-selection-width')
	}

	private get dataColumnsWidths() {
		return this.visibleColumns
			.map(c => c.width)
			.filter((c): c is string => c !== undefined)
	}

	private get moreColumnWidth() {
		return this.host.sidePanelHidden && !this.host.hasContextMenu ? undefined : window.getComputedStyle(this.host).getPropertyValue('--mo-data-grid-column-more-width')
	}

	private get columnsElements() {
		const slot = this.host.renderRoot?.querySelector<HTMLSlotElement>('slot[name=column]')
		if (!slot) {
			return []
		}
		const children = [...slot.children]
		const assigned = [...slot.assignedElements()]
		return [...assigned, ...children]
			.filter((c): c is DataGridColumnComponent<TData, any> => c instanceof DataGridColumnComponent)
			.map(c => {
				c.dataGrid = this.host
				return c
			})
	}

	private get elementExtractedColumns(): Array<DataGridColumn<TData, KeyPathValueOf<TData>>> {
		return this.columnsElements.map(c => c.column)
	}

	private get autoGeneratedColumns() {
		if (!this.host.dataLength) {
			return []
		}

		const getDefaultColumnElement = (value: unknown) => {
			switch (typeof value) {
				case 'number':
				case 'bigint':
					return 'mo-data-grid-column-number'
				case 'boolean':
					return 'mo-data-grid-column-boolean'
				default:
					return 'mo-data-grid-column-text'
			}
		}
		const [sampleData] = this.host.data || []
		return Object.keys(sampleData || {})
			.filter(key => !key.startsWith('_'))
			.map(key => {
				const columnElement = document.createElement(getDefaultColumnElement(getValueByKeyPath(sampleData, key as any)))
				columnElement.heading = key.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').slice(1)
				columnElement.dataSelector = key
				columnElement.dataGrid = this.host as DataGrid<unknown, any>
				const column = columnElement.column
				columnElement.remove()
				return column
			}) as Array<DataGridColumn<TData>>
	}
}