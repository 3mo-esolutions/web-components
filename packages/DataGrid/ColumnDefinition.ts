import { type HTMLTemplateResult } from '@a11d/lit'

export type ColumnDefinition<TData, TValue = unknown> = {
	heading: string
	title?: string
	dataSelector: KeyPathOf<TData>
	sortDataSelector?: KeyPathOf<TData>
	width?: string
	alignment?: 'start' | 'center' | 'end'
	hidden?: boolean
	fixed?: 'left' | 'right'
	sortable?: boolean
	editable?: boolean | Predicate<TData>
	sumHeading?: string
	getContentTemplate?(value: TValue, data: TData): HTMLTemplateResult
	getEditContentTemplate?(value: TValue, data: TData): HTMLTemplateResult
	getSumTemplate?(sum: number): HTMLTemplateResult
}