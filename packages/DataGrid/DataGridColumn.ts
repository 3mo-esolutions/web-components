import { html, style, type HTMLTemplateResult } from '@a11d/lit'
import type { DataGrid, DataGridSortingDefinition } from './index.js'
import type * as CSS from 'csstype'

export type DataGridColumnAlignment = 'start' | 'center' | 'end'

export type DataGridRankedSortDefinition<TData> = DataGridSortingDefinition<TData> & { rank: number }

export class DataGridColumn<TData, TValue = unknown> {
	dataGrid?: DataGrid<TData, any>
	dataSelector!: KeyPathOf<TData>

	heading!: string
	description?: string

	// eslint-disable-next-line @typescript-eslint/ban-types
	width: CSS.DataType.TrackBreadth<(string & {}) | 0> = 'max-content'
	alignment: DataGridColumnAlignment = 'start'
	hidden = false

	sortable = true

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

	get sortingDefinition() {
		if (!this.dataGrid) {
			return undefined
		}
		const sorting = this.dataGrid.getSorting()
		const definition = sorting.find(s => s.selector === this.sortDataSelector)
		return !definition ? undefined : {
			...definition,
			rank: sorting.indexOf(definition) + 1
		} as DataGridRankedSortDefinition<TData>
	}

	get sumTemplate() {
		if (!this.dataGrid || this.sumHeading === undefined || this.getSumTemplate === undefined) {
			return
		}

		const sum = this.dataGrid.sumsData
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
}