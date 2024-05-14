import { type HTMLTemplateResult } from '@a11d/lit'

export type DataGridColumnAlignment = 'start' | 'center' | 'end'

export class DataGridColumn<TData, TValue = unknown> {
	dataSelector!: KeyPathOf<TData>
	heading!: string
	title?: string
	sortDataSelector?: KeyPathOf<TData>
	width?: string
	alignment?: DataGridColumnAlignment
	hidden?: boolean
	sortable?: boolean
	editable?: boolean | Predicate<TData>
	sumHeading?: string
	getContentTemplate?(value: TValue, data: TData): HTMLTemplateResult
	getEditContentTemplate?(value: TValue, data: TData): HTMLTemplateResult
	getSumTemplate?(sum: number): HTMLTemplateResult

	constructor(column: Partial<DataGridColumn<TData>>) {
		Object.assign(this, column)
	}
}