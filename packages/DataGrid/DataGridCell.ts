import { component, Component, html, property, css, type HTMLTemplateResult } from '@a11d/lit'
import { DataGridColumn, type DataGridRow } from './index.js'

/**
 * @element mo-data-grid-cell
 *
 * @attr value
 * @attr column
 * @attr row
 */
@component('mo-data-grid-cell')
export class DataGridCell<TValue extends KeyPath.ValueOf<TData>, TData = any, TDetailsElement extends Element | undefined = undefined> extends Component {
	@property({ type: Object }) value!: TValue
	@property({ type: Object }) column!: DataGridColumn<TData, TValue>
	@property({ type: Object }) row!: DataGridRow<TData, TDetailsElement>

	get dataGrid() { return this.row.dataGrid }
	get data() { return this.row.data }
	get dataSelector() { return this.column.dataSelector }

	private get valueTextContent() { return this.renderRoot.textContent?.trim() || '' }

	get isEditing() {
		return this.dataGrid.controller.editability.isEditing(this)
	}

	setEditing(editing: boolean) {
		return this.dataGrid.controller.editability.setEditing(this, editing)
	}

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				align-content: center;
				position: relative;
				padding-inline: var(--mo-data-grid-cell-padding);
				font-size: var(--mo-data-grid-cell-font-size);
				outline: none;
				height: var(--mo-data-grid-row-height);
				user-select: none;
			}

			:host(:not([isEditing])) {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			:host(:not([isEditing]):focus) {
				outline: 2px solid var(--mo-color-accent);
			}

			:host([alignment=start]) {
				text-align: start;
			}

			:host([alignment=center]) {
				text-align: center;
			}

			:host([alignment=end]) {
				text-align: end;
			}

			${DataGridColumn.stickyStyles}
		`
	}

	private get tooltip() { return this.valueTextContent }

	protected override get template() {
		this.title = this.tooltip
		this.toggleAttribute('isEditing', this.isEditing)
		this.setAttribute('alignment', this.column.alignment || 'start')
		return this.isEditing ? this.editContentTemplate as HTMLTemplateResult : this.contentTemplate
	}

	private get contentTemplate() {
		return html`
			${this.contentStyleTemplate}
			${this.column.getContentTemplate?.(this.value, this.data) ?? html`${this.value}`}
		`
	}

	private get contentStyleTemplate() {
		if (!this.column.contentStyle) {
			return html.nothing
		}

		const style = typeof this.column.contentStyle === 'function'
			? this.column.contentStyle(this.value, this.data)
			: this.column.contentStyle

		if (!style) {
			return html.nothing
		}

		// CSSResult → render as style tag (supports :host, :hover, etc.)
		if (typeof style === 'object' && 'cssText' in style) {
			return html`<style>${style}</style>`
		}

		// String → apply as inline style (performant)
		if (typeof style === 'string') {
			this.style.cssText += `;${style}`
		}

		return html.nothing
	}

	// Having focus-controller on every cell can lead to performance issues
	// in larger data-grids. Therefore defaulting to CSS native outline for now.
	// protected get focusRingTemplate() {
	// 	return !this.focusController.focused ? html.nothing : html`<mo-focus-ring inward visible></mo-focus-ring>`
	// }

	private get editContentTemplate() {
		return this.column.getEditContentTemplate?.(this.value, this.data)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-cell': DataGridCell<unknown>
	}
}