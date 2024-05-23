import { Component, property, type HTMLTemplateResult } from '@a11d/lit'
import { DataGrid } from '../DataGrid.js'
import { DataGridColumn, type DataGridColumnAlignment, type DataGridColumnSticky } from '../DataGridColumn.js'

/**
 * @attr width - The width of the column
 * @attr hidden - Whether the column is hidden. The column can be made visible by the user in the settings panel if available.
 * @attr heading - The heading of the column
 * @attr textAlign - The text alignment of the column
 * @attr description - The description of the column. It will be displayed as a tooltip on the heading.
 * @attr dataSelector - The data selector of the column
 * @attr sortDataSelector - The data selector of the column
 * @attr nonSortable - Whether the column is sortable
 * @attr nonEditable - Whether the column is editable
 * @attr sticky - The sticky position of the column, either 'start', 'end', or 'both'
 */
export abstract class DataGridColumnComponent<TData, TValue> extends Component {
	@property({ type: Object }) dataGrid?: DataGrid<TData, any> | undefined

	@property() width = 'max-content'
	@property({ type: Boolean }) override hidden = false
	@property() sticky?: DataGridColumnSticky
	@property({ reflect: true }) heading = ''
	@property({ reflect: true }) description?: string
	@property({ reflect: true }) textAlign: DataGridColumnAlignment = 'start'
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

	get column(): DataGridColumn<TData, TValue> {
		const nonEditable = this.nonEditable
		return new DataGridColumn({
			dataSelector: this.dataSelector,
			sortDataSelector: this.sortDataSelector,
			heading: this.heading,
			description: this.description,
			alignment: this.textAlign,
			hidden: this.hidden,
			sticky: this.sticky,
			width: this.width,
			sortable: !this.nonSortable,
			editable: this.getEditContentTemplate !== undefined && (typeof nonEditable !== 'function' ? !nonEditable : x => !nonEditable(x)),
			getContentTemplate: this.getContentTemplate.bind(this),
			getEditContentTemplate: this.getEditContentTemplate?.bind(this),
		})
	}

	abstract getContentTemplate(value: TValue | undefined, data: TData): HTMLTemplateResult
	abstract getEditContentTemplate?(value: TValue | undefined, data: TData): HTMLTemplateResult

	protected handleEdit(value: TValue | undefined, data: TData) {
		this.dataGrid?.handleEdit(data, this.column, value as any)
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