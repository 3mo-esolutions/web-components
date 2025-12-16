import { component, Component, event, property, type HTMLTemplateResult, type PropertyValues } from '@a11d/lit'
import { hasChanged } from '@a11d/equals'
import { DataGrid } from '../DataGrid.js'
import { DataGridColumn, type DataGridColumnAlignment, type DataGridColumnContentStyle, type DataGridColumnMenuItems, type DataGridColumnSticky } from '../DataGridColumn.js'

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
 * @attr getContentTemplate - The content template of the column.
 * @attr getEditContentTemplate - The edit content template of the column.
 */
@component('mo-data-grid-column')
export class DataGridColumnComponent<TData, TValue> extends Component {
	@event({ bubbles: true, cancelable: true, composed: true, type: 'DataGridColumnComponent:update' }) private readonly updateEvent!: EventDispatcher<DataGridColumnComponent<TData, TValue>>

	@property({ type: Object }) dataGrid?: DataGrid<TData, any> | undefined

	@property() width = 'max-content'
	@property({ type: Boolean }) override hidden = false
	@property() sticky?: DataGridColumnSticky
	@property({ reflect: true }) heading = ''
	@property({ reflect: true }) description?: string
	@property({ reflect: true }) textAlign: DataGridColumnAlignment = 'start'
	@property({ reflect: true }) dataSelector!: KeyPath.Of<TData>
	@property({ reflect: true }) sortDataSelector?: KeyPath.Of<TData>
	@property({ type: Boolean, reflect: true }) nonSortable = false
	@property({ type: Boolean, reflect: true, hasChanged }) nonEditable: boolean | Predicate<TData> = false

	protected getMenuItemsTemplate?(): DataGridColumnMenuItems

	@property({ type: Object }) contentStyle?: DataGridColumnContentStyle<TData, TValue>
	@property({ type: Object }) getContentTemplate?: (value: TValue | undefined, data: TData) => HTMLTemplateResult

	@property({ type: Object }) getEditContentTemplate?: (value: TValue | undefined, data: TData) => HTMLTemplateResult

	protected handleEdit(value: TValue | undefined, data: TData) {
		this.dataGrid?.handleEdit(data, this.column, value as any)
	}

	override connectedCallback() {
		if (this.parentElement instanceof DataGrid) {
			this.slot = 'column'
		}
		super.connectedCallback()
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		this.dataGrid?.extractColumns()
	}

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		this.updateEvent.dispatch(this)
	}

	*generateCsvHeading(): Generator<string> {
		yield [this.heading, this.description].filter(Boolean).join(' - ')
	}

	*generateCsvValue(value: any, data: TData): Generator<string> {
		data
		yield value?.toString() ?? ''
	}

	get column() {
		const nonEditable = this.nonEditable
		return new DataGridColumn<TData, TValue>({
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
			getMenuItemsTemplate: this.getMenuItemsTemplate?.bind(this),
			getContentTemplate: this.getContentTemplate?.bind(this),
			getEditContentTemplate: this.getEditContentTemplate?.bind(this),
			generateCsvHeading: this.generateCsvHeading.bind(this),
			generateCsvValue: this.generateCsvValue.bind(this),
			contentStyle: this.contentStyle,
		})
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column': DataGridColumnComponent<unknown, unknown>
	}
}