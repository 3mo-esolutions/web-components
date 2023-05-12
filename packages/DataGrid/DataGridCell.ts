import { component, Component, html, property, css } from '@a11d/lit'
import { Localizer, LanguageCode } from '@3mo/localization'
import { ColumnDefinition, DataGridRow } from './index.js'

Localizer.register(LanguageCode.German, {
	'Using the clipboard is not allowed in an insecure browser environment': 'In einer unsicheren Browser-Umgebung darf kein Text in die Zwischenablage kopiert werden',
	'Copied to clipboard': 'In die Zwischenablage kopiert',
})

/**
 * @element mo-data-grid-cell
 *
 * @attr value
 * @attr column
 * @attr row
 * @attr editing
 */
@component('mo-data-grid-cell')
export class DataGridCell<TValue extends KeyPathValueOf<TData>, TData = any, TDetailsElement extends Element | undefined = undefined> extends Component {
	@property({ type: Object }) value!: TValue
	@property({ type: Object }) column!: ColumnDefinition<TData, TValue>
	@property({ type: Object }) row!: DataGridRow<TData, TDetailsElement>
	@property({ type: Boolean, reflect: true }) editing = false

	get data() { return this.row.data }
	get dataSelector() { return this.column.dataSelector }

	static override get styles() {
		return css`
			:host {
				position: relative;
				padding: 0px var(--mo-data-grid-cell-padding, 3px);
				user-select: none;
				line-height: var(--mo-data-grid-row-height);
				white-space: nowrap;
				overflow: hidden !important;
				text-overflow: ellipsis;
				font-size: small;
			}

			:host([editing]) {
				display: grid;
			}

			:host([alignment=end]) {
				text-align: end;
			}

			:host([alignment=start]) {
				text-align: start
			}

			:host([alignment=center]) {
				text-align: center;
			}

			:host > :first-child {
				line-height: var(--mo-data-grid-row-height);
			}

			:host([editing]) > :first-child {
				align-self: center;
				justify-self: stretch;
			}
		`
	}

	private get tooltip() {
		const allowedTitleTypes = ['string', 'number', 'bigint', 'boolean']
		return allowedTitleTypes.includes(typeof this.value) ? String(this.value) : ''
	}

	protected override get template() {
		this.title = this.tooltip
		const contentTemplate = this.column.getContentTemplate?.(this.value, this.data) ?? this.value
		const editContentTemplate = this.column.getEditContentTemplate?.(this.value, this.data)
		this.setAttribute('alignment', this.column.alignment || 'start')
		return this.column.editable && this.editing && editContentTemplate ? editContentTemplate : html`
			${contentTemplate}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-cell': DataGridCell<unknown>
	}
}