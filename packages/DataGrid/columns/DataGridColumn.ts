import { Component, property, type HTMLTemplateResult } from '@a11d/lit'
import { DataGrid } from '../DataGrid.js'
import type { ColumnDefinition } from '../ColumnDefinition.js'

/**
 * @attr width - The width of the column
 * @attr hidden - Whether the column is hidden. The column can be made visible by the user in the settings panel if available.
 * @attr heading - The heading of the column
 * @attr textAlign - The text alignment of the column
 * @attr title - The title of the column
 * @attr dataSelector - The data selector of the column
 * @attr sortDataSelector - The data selector of the column
 * @attr nonSortable - Whether the column is sortable
 * @attr nonEditable - Whether the column is editable
 */
export abstract class DataGridColumn<TData, TValue> extends Component {
	static readonly regex = /^\s*(0|[1-9][0-9]*)?\s*\*\s*$/

	private static getProportion(value: string) {
		return Number(value.replace(DataGridColumn.regex, '$1') || 1)
	}

	@property({ type: Object }) dataGrid?: DataGrid<TData, any> | undefined

	@property() width = 'minmax(100px, 1fr)'
	@property({ type: Boolean }) override hidden = false
	@property({ reflect: true }) heading = ''
	@property({ reflect: true }) textAlign = 'start'
	@property({ reflect: true }) override title!: string
	@property({ reflect: true }) dataSelector!: KeyPathOf<TData>
	@property({ reflect: true }) sortDataSelector?: KeyPathOf<TData>
	@property({ type: Boolean, reflect: true }) nonSortable = false
	@property({
		type: Boolean,
		reflect: true,
		hasChanged(value: boolean | Predicate<TData>, oldValue: boolean | Predicate<TData>) {
			return String(value) !== String(oldValue)
		}
	}) nonEditable: boolean | Predicate<TData> = false

	get definition(): ColumnDefinition<TData, TValue> {
		const nonEditable = this.nonEditable
		return {
			dataSelector: this.dataSelector,
			sortDataSelector: this.sortDataSelector,
			heading: this.heading,
			title: this.title || undefined,
			alignment: this.textAlign as 'start' | 'center' | 'end',
			hidden: this.hidden,
			width: !DataGridColumn.regex.test(this.width) ? this.width : `${DataGridColumn.getProportion(this.width)}fr`,
			sortable: !this.nonSortable,
			editable: this.getEditContentTemplate !== undefined && (typeof nonEditable !== 'function' ? !nonEditable : x => !nonEditable(x)),
			getContentTemplate: this.getContentTemplate.bind(this),
			getEditContentTemplate: this.getEditContentTemplate?.bind(this),
		}
	}

	abstract getContentTemplate(value: TValue | undefined, data: TData): HTMLTemplateResult
	abstract getEditContentTemplate?(value: TValue | undefined, data: TData): HTMLTemplateResult

	protected handleEdit(value: TValue | undefined, data: TData) {
		this.dataGrid?.handleEdit(data, this, value as any)
	}

	override connectedCallback() {
		if (this.parentElement instanceof DataGrid) {
			this.slot = 'column'
		}
		super.connectedCallback()
	}

	protected override updated() {
		this.dataGrid?.extractColumns()
		this.dataGrid?.requestUpdate()
	}
}