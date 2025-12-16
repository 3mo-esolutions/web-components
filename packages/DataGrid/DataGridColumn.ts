import { html, style, type CSSResult, type HTMLTemplateResult } from '@a11d/lit'
import { equals } from '@a11d/equals'
import type { DataGrid, DataGridSortingStrategy } from './index.js'
import type * as CSS from 'csstype'

export type DataGridColumnContentStyle<TData, TValue> =
	| string
	| CSSResult
	| ((value: TValue, data: TData) => string | CSSResult | undefined)

export type DataGridColumnAlignment = 'start' | 'center' | 'end'

export type DataGridColumnSticky = 'start' | 'both' | 'end'

export type DataGridColumnMenuItems = HTMLTemplateResult | Map<'sorting' | 'stickiness' | 'more', HTMLTemplateResult>

export class DataGridColumn<TData, TValue = unknown> {
	dataGrid!: DataGrid<TData, any>
	dataSelector!: KeyPath.Of<TData>

	heading!: string
	description?: string

	width: CSS.DataType.TrackBreadth<(string & {}) | 0> = 'max-content'

	alignment: DataGridColumnAlignment = 'start'

	hidden = false
	hide() {
		this.hidden = true
		this.dataGrid.requestUpdate()
	}

	sticky?: DataGridColumnSticky
	toggleSticky(sticky: DataGridColumnSticky) {
		this.sticky = this.sticky === sticky ? undefined : sticky
		this.dataGrid.requestUpdate()
	}

	sortable = true

	private _sortDataSelector?: KeyPath.Of<TData>
	get sortDataSelector() { return this._sortDataSelector || this.dataSelector }
	set sortDataSelector(value) { this._sortDataSelector = value }

	toggleSort(strategy?: DataGridSortingStrategy | null) {
		if (!this.sortable) {
			return
		}

		if (!!strategy && this.sortingDefinition?.strategy === strategy) {
			strategy = null
		}

		if (strategy === null) {
			this.dataGrid.sortingController.reset()
		} else {
			this.dataGrid.sortingController.toggle(this.sortDataSelector, strategy)
		}

		this.dataGrid.requestUpdate()
	}

	getMenuItemsTemplate?(): DataGridColumnMenuItems

	contentStyle?: DataGridColumnContentStyle<TData, TValue>
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
		return new DataGridColumn<TData, TValue>({ ...this, ...other })
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
			.map(data => parseFloat(KeyPath.get(data, this.dataSelector) as unknown as string))
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
		return this.dataGrid?.columnsController.getStickyColumnInsetInline(this) ?? ''
	}

	generateCsvHeading?(): Generator<string>
	generateCsvValue?(value: TValue, data: TData): Generator<string>
}