import { component, Component, html, property, css, unsafeCSS, type HTMLTemplateResult } from '@a11d/lit'
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

	// A server-rendered shadow root keeps the server's style elements:
	private get valueTextContent() {
		return [...this.renderRoot.childNodes]
			.filter(node => node instanceof Text || node instanceof Element && !(node instanceof HTMLStyleElement))
			.map(node => node.textContent)
			.join('')
			.trim()
	}

	get isEditing() {
		return this.dataGrid.controller.editability.isEditing(this)
	}

	setEditing(editing: boolean) {
		return this.dataGrid.controller.editability.setEditing(this, editing)
	}

	static override get styles() {
		return css`
			/* Layered so that a column's contentStyle overrides these defaults */
			@layer defaults {
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

				/* Centers an editor without align-content on a block, which Safari supports only from 17.4. */
				:host([isEditing]) {
					display: inline-flex;
					flex-direction: column;
					justify-content: center;
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

				/* An editor grows with what is typed rather than cutting it off at the column's width. */
				::part(input) {
					field-sizing: content;
					width: 100%;
				}

				/* Hovering and selecting a row change the color of its sticky parts, which would otherwise restyle everything inside its cells. */
				* {
					--mo-data-grid-sticky-part-color: initial;
				}

				${DataGridColumn.stickyStyles}
			}
		`
	}

	protected override updated(...parameters: Parameters<Component['updated']>) {
		super.updated(...parameters)
		this.title = this.valueTextContent
	}

	protected override get template() {
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
		const style = typeof this.column.contentStyle === 'function'
			? this.column.contentStyle(this.value, this.data)
			: this.column.contentStyle

		return !style ? html.nothing : html`<style>${typeof style === 'string' ? unsafeCSS(`:host { ${style} }`) : style}</style>`
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
