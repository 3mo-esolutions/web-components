import { component, Component, html, property, css, state, type HTMLTemplateResult } from '@a11d/lit'
import { NotificationComponent } from '@a11d/lit-application'
import { Localizer } from '@3mo/localization'
import { type DataGridColumn, DataGridEditability, type DataGridRow } from './index.js'

Localizer.dictionaries.add('de', {
	'Copied to clipboard': 'In die Zwischenablage kopiert',
})

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

	@state() private editing = false

	get dataGrid() { return this.row.dataGrid }
	get data() { return this.row.data }
	get dataSelector() { return this.column.dataSelector }

	private get cellIndex(): number { return this.row.cells.indexOf(this) }
	private get rowIndex(): number { return this.dataGrid.rows.indexOf(this.row) }

	private get valueTextContent() { return this.renderRoot.textContent?.trim() || '' }

	private get isEditable() {
		return this.dataGrid.editability !== DataGridEditability.Never
			&& [undefined, null].includes(this.editContentTemplate as any) === false
			&& (this.column.editable === true || (typeof this.column.editable === 'function' && this.column.editable(this.data)))
	}

	get isEditing() {
		return this.isEditable
			&& (this.editing || this.dataGrid.editability === DataGridEditability.Always)
	}

	handlePointerDown(event: PointerEvent) {
		if (this.isEditing && event.composedPath().includes(this) === false) {
			this.setEditing(false)
		}
	}

	handleDoubleClick(event: MouseEvent) {
		if (this.dataGrid.editability === DataGridEditability.Cell) {
			event.preventDefault()
			this.setEditing(true)
		}
	}

	async handleKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Enter':
				event.preventDefault()
				event.stopPropagation()
				if (this.isEditable) {
					this.setEditing(true)
				} else {
					this.click()
				}
				break
			case 'Escape':
				event.preventDefault()
				event.stopPropagation()
				this.setEditing(false)
				await this.updateComplete
				this.focusCell(event, this)
				break
			case 'c':
				if (this.isEditing === false && (event.ctrlKey || event.metaKey)) {
					event.preventDefault()
					await navigator.clipboard.writeText(this.valueTextContent)
					NotificationComponent.notifySuccess(t('Copied to clipboard'))
				}
				break
			case 'Tab':
			case 'ArrowRight':
				this.focusCell(event, this.row.cells.at(this.cellIndex === this.dataGrid.visibleColumns.length - 1 ? 0 : this.cellIndex + 1))
				break
			case 'ArrowLeft':
				this.focusCell(event, this.row.cells.at(this.cellIndex === 0 ? this.dataGrid.visibleColumns.length - 1 : this.cellIndex - 1))
				break
			case 'ArrowUp':
				this.focusCell(event, this.dataGrid.rows.at(this.rowIndex === 0 ? this.dataGrid.rows.length - 1 : this.rowIndex - 1)?.cells.at(this.cellIndex))
				break
			case 'ArrowDown':
				this.focusCell(event, this.dataGrid.rows.at(this.rowIndex === this.dataGrid.rows.length - 1 ? 0 : this.rowIndex + 1)?.cells.at(this.cellIndex))
				break
			default:
				break
		}
	}

	private async setEditing(value: boolean) {
		if (this.editing === value) {
			return
		}
		this.editing = value
		await this.updateComplete
		if (value) {
			this.renderRoot.querySelector<HTMLElement>('[autofocus]')?.focus()
		}
	}

	private focusCell(event: KeyboardEvent, cell?: DataGridCell<any, TData, TDetailsElement>) {
		if (cell && this.isEditing === false) {
			event.preventDefault()
			cell.focus()
			this.setEditing(false)
			if (this.dataGrid.selectOnClick) {
				this.dataGrid.selectionController.setSelection(cell.row.data, true, event.shiftKey)
			}
		}
	}

	static override get styles() {
		return css`
			:host {
				display: inline-grid;
				align-items: center;
				position: relative;
				padding-inline: var(--mo-data-grid-cell-padding);
				font-size: var(--mo-data-grid-cell-font-size);
				outline: none;
				min-height: var(--mo-data-grid-row-height);
			}

			:host(:not([isEditing])) div {
				user-select: none;
				white-space: nowrap;
				overflow: hidden !important;
				text-overflow: ellipsis;
			}

			:host(:not([isEditing]):focus) {
				outline: 2px solid var(--mo-color-accent);
			}

			:host([isEditing]) {
				display: grid;
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

			:host([sticky]) {
				position: sticky;
			}

			:host([sticky]) /*[sticking]*/ {
				z-index: 2;
				background: var(--mo-data-grid-sticky-part-color);
			}
		`
	}

	private get tooltip() { return this.valueTextContent }

	protected override get template() {
		this.title = this.tooltip
		this.toggleAttribute('isEditing', this.isEditing)
		this.setAttribute('alignment', this.column.alignment || 'start')
		if (this.isEditing) {
			this.removeAttribute('tabindex')
		} else {
			this.setAttribute('tabindex', '-1')
		}
		this.toggleAttribute('sticky', this.column.sticky !== undefined)
		this.toggleAttribute('sticking', this.column.intersecting === false)
		this.style.insetInline = this.column.stickyColumnInsetInline
		return this.isEditing ? this.editContentTemplate as HTMLTemplateResult : this.contentTemplate
	}

	private get contentTemplate() {
		return html`
			<div>
				${this.column.getContentTemplate?.(this.value, this.data) ?? html`${this.value}`}
			</div>
		`
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