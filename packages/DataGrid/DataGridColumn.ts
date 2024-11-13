import { html, style, type HTMLTemplateResult } from '@a11d/lit'
import { equals } from '@a11d/equals'
import type { DataGrid } from './index.js'
import type * as CSS from 'csstype'

export type DataGridColumnAlignment = 'start' | 'center' | 'end'

export type DataGridColumnSticky = 'start' | 'both' | 'end'

export class DataGridColumn<TData, TValue = unknown> {
	dataGrid?: DataGrid<TData, any>
	dataSelector!: KeyPathOf<TData>

	heading!: string
	description?: string

	width: CSS.DataType.TrackBreadth<(string & {}) | 0> = 'max-content'

	alignment: DataGridColumnAlignment = 'start'
	hidden = false

	sortable = true

	sticky?: DataGridColumnSticky

	private _sortDataSelector?: KeyPathOf<TData>
	get sortDataSelector() { return this._sortDataSelector || this.dataSelector }
	set sortDataSelector(value) { this._sortDataSelector = value }

	getContentTemplate?(value: TValue, data: TData): HTMLTemplateResult

	editable: boolean | Predicate<TData> = false
	getEditContentTemplate?(value: TValue, data: TData): HTMLTemplateResult

	sumHeading?: string
	getSumTemplate?(sum: number): HTMLTemplateResult

	constructor(column: Partial<DataGridColumn<TData, TValue>>) {
		Object.assign(this, column)
	}

	[equals](other: DataGridColumn<TData, any>): boolean {
		return !!this.dataSelector || !!other.dataSelector
			? this.dataSelector === other.dataSelector
			: this.heading === other.heading && this.description === other.description
	}

	with(other: Partial<this>): DataGridColumn<TData, TValue> {
		return new DataGridColumn({ ...this, ...other })
	}

	private _widthInPixels?: number
	get widthInPixels() { return this._widthInPixels || 0 }
	set widthInPixels(value) {
		this._widthInPixels = value
		this.dataGrid?.requestUpdate()
	}

	private _intersecting = false
	get intersecting() { return this._intersecting }
	set intersecting(value) {
		this._intersecting = value
		this.dataGrid?.requestUpdate()
	}

	get sortingDefinition() {
		return this.dataGrid
			?.getSorting()
			.find(s => s.selector === this.sortDataSelector)
	}

	get sumTemplate() {
		if (!this.dataGrid || this.sumHeading === undefined || this.getSumTemplate === undefined) {
			return
		}

		const sumsData = this.dataGrid.selectedData.length ? this.dataGrid.selectedData : this.dataGrid.renderDataRecords.map(r => r.data)

		const sum = sumsData
			.map(data => parseFloat(getValueByKeyPath(data, this.dataSelector) as unknown as string))
			.filter(n => isNaN(n) === false)
			.reduce(((a, b) => a + b), 0)
			|| 0

		return html`
			<mo-data-grid-footer-sum heading=${this.sumHeading || ''} ${style({ color: this.dataGrid.selectedData.length > 0 ? 'var(--mo-color-accent)' : 'currentColor' })}>
				${this.getSumTemplate(sum)}
			</mo-data-grid-footer-sum>
		`
	}

	get stickyColumnInsetInline() {
		const dataGrid = this.dataGrid

		if (!dataGrid) {
			return ''
		}

		const columnIndex = dataGrid.visibleColumns.indexOf(this)
		const calculate = (type: 'start' | 'end') => dataGrid.visibleColumns
			.filter((c, i) => c.sticky === type && (type === 'start' ? i < columnIndex : i > columnIndex))
			.map(c => c.widthInPixels)
			.filter(x => x !== undefined)
			.reduce((a, b) => a! + b!, 0)!

		const start = `${dataGrid.columnsController.selectionColumnWidthInPixels + dataGrid.columnsController.detailsColumnWidthInPixels + calculate('start')}px`
		const end = `${calculate('end') + dataGrid.columnsController.moreColumnWidthInPixels}px`

		switch (this.sticky) {
			case 'start':
				return `${start} auto`
			case 'end':
				return `auto ${end}`
			case 'both':
				return `${start} ${end}`
			default:
				return ''
		}
	}

	generateCsvHeading?(): Generator<string>
	generateCsvValue?(value: TValue, data: TData): Generator<string>
}