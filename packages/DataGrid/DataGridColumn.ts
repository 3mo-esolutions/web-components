import { css, html, style, type CSSResult, type HTMLTemplateResult } from '@a11d/lit'
import { equals } from '@a11d/equals'
import type { DataGrid, DataGridColumns, DataGridSortingStrategy } from './index.js'
import type * as CSS from 'csstype'

export type DataGridColumnContentStyle<TData, TValue> =
	| string
	| CSSResult
	| ((value: TValue, data: TData) => string | CSSResult | undefined)

export type DataGridColumnAlignment = 'start' | 'center' | 'end'

export type DataGridColumnSticky = 'start' | 'both' | 'end'

export type DataGridColumnMenuItems = HTMLTemplateResult | Map<'sorting' | 'stickiness' | 'more', HTMLTemplateResult>

/**
 * An immutable value-object representing a column of a data grid at a given point in time.
 *
 * All value properties are read-only: what a column *is* changes only through its definition
 * source (element, property, or data), and how it *shows* only through a modification via
 * `modify()`, after which the data grid re-derives fresh column instances.
 *
 * The only mutable members are the `dataGrid` context back-reference the controller attaches,
 * and `widthInPixels`, which is a view over the data grid's measurements rather than a value.
 */
export class DataGridColumn<TData, TValue = any> {
	dataGrid!: DataGrid<TData, any>
	readonly dataSelector!: KeyPath.Of<TData>

	readonly heading!: string
	readonly description?: string

	readonly width: CSS.DataType.TrackBreadth<(string & {}) | 0> = 'max-content'

	readonly alignment: DataGridColumnAlignment = 'start'

	readonly hidden: boolean = false
	hide() {
		this.modify({ hidden: true })
	}

	readonly sticky?: DataGridColumnSticky
	toggleSticky(sticky: DataGridColumnSticky) {
		// `null` pins the column as not sticky even if its definition declares stickiness
		this.modify({ sticky: (this.sticky === sticky ? undefined : sticky) ?? null })
	}

	readonly sortable: boolean = true

	readonly sortDataSelector!: KeyPath.Of<TData>

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

	readonly getMenuItemsTemplate?: () => DataGridColumnMenuItems

	readonly contentStyle?: DataGridColumnContentStyle<TData, TValue>
	readonly getContentTemplate?: (value: TValue, data: TData) => HTMLTemplateResult

	readonly editable: boolean | Predicate<TData> = false
	readonly getEditContentTemplate?: (value: TValue, data: TData) => HTMLTemplateResult

	readonly sumHeading?: string
	readonly getSumTemplate?: (sum: number) => HTMLTemplateResult

	constructor(column: Partial<DataGridColumn<TData, TValue>>) {
		Object.assign(this, column)
		this.sortDataSelector ||= this.dataSelector
	}

	modify(modification: Parameters<DataGridColumns<TData>['modify']>[1]) {
		return this.dataGrid.columnsController.columns.modify(this.dataSelector, modification)
	}

	[equals](other: DataGridColumn<TData, any>): boolean {
		return !!this.dataSelector || !!other.dataSelector
			? this.dataSelector === other.dataSelector
			: this.heading === other.heading && this.description === other.description
	}

	with(other: Partial<this>): DataGridColumn<TData, TValue> {
		return new DataGridColumn<TData, TValue>({ ...this, ...other })
	}

	// Measured widths are stored on the columns controller keyed by data selector, so that they
	// survive column instances being re-derived from definitions and modifications.
	get widthInPixels() { return this.dataGrid?.columnsController.getWidthInPixels(this.dataSelector) ?? 0 }
	set widthInPixels(value) {
		this.dataGrid?.columnsController.setWidthInPixels(this.dataSelector, value)
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

	static readonly stickyStyles = css`
		:host([data-sticky]) {
			position: sticky;
		}

		:host([data-sticky]) {
			z-index: 6;
			background: var(--mo-data-grid-sticky-part-color);
		}

		:host([data-sticky-edge~=end]) {
			border-inline-end: var(--mo-data-grid-border);
			box-shadow: var(--mo-shadow-deep);
			clip-path: inset(0 -1rem 0 0);
		}

		:host([data-sticky-edge~=start]) {
			border-inline-start: var(--mo-data-grid-border);
			box-shadow: var(--mo-shadow-deep);
			clip-path: inset(0 0 0 -1rem);
		}

		:host([data-sticky-edge="start end"]) {
			clip-path: inset(0 -1rem 0 -1rem);
		}
	`

	get stickyEdge(): string | undefined {
		if (!this.sticky || !this.dataGrid) {
			return undefined
		}

		if (this.sticky === 'both') {
			return 'start end'
		}

		const columns = this.dataGrid.visibleColumns
		const index = columns.indexOf(this)

		if (this.sticky === 'start' && !columns.slice(index + 1).some(c => c.sticky === 'start')) {
			return 'end'
		}

		if (this.sticky === 'end' && !columns.slice(0, index).some(c => c.sticky === 'end')) {
			return 'start'
		}

		return undefined
	}

	readonly generateCsvHeading?: () => Generator<string>
	readonly generateCsvValue?: (value: TValue, data: TData) => Generator<string>
}