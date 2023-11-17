import { component, Component, html, property, css, eventListener, state, HTMLTemplateResult } from '@a11d/lit'
import { NotificationComponent } from '@a11d/lit-application'
import { Localizer } from '@3mo/localization'
import { ColumnDefinition, DataGridEditability, DataGridRow } from './index.js'

Localizer.register('de', {
	'Using the clipboard is not allowed in an insecure browser environment': 'In einer unsicheren Browser-Umgebung darf kein Text in die Zwischenablage kopiert werden',
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
export class DataGridCell<TValue extends KeyPathValueOf<TData>, TData = any, TDetailsElement extends Element | undefined = undefined> extends Component {
	@property({ type: Object }) value!: TValue
	@property({ type: Object }) column!: ColumnDefinition<TData, TValue>
	@property({ type: Object }) row!: DataGridRow<TData, TDetailsElement>

	@state({
		updated(this: DataGridCell<TValue, TData, TDetailsElement>) {
			if (this.isEditing) {
				this.renderRoot.querySelector<HTMLElement>('[data-focus]')?.focus()
			}
		}
	}) private editing = false

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

	@eventListener({ target: document, type: 'pointerdown' })
	protected handlePointerDown(event: PointerEvent) {
		if (this.isEditing && event.composedPath().includes(this) === false) {
			this.editing = false
		}
	}

	@eventListener('dblclick')
	protected handleDoubleClick(event: MouseEvent) {
		if (this.dataGrid.editability === DataGridEditability.Cell) {
			event.preventDefault()
			this.editing = true
		}
	}

	@eventListener('keydown')
	protected async handleKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Enter':
				event.preventDefault()
				event.stopPropagation()
				if (this.isEditable) {
					this.editing = true
				} else {
					this.click()
				}
				break
			case 'Escape':
				event.preventDefault()
				event.stopPropagation()
				this.editing = false
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

	private focusCell(event: KeyboardEvent, cell?: DataGridCell<any, TData, TDetailsElement>) {
		if (cell && this.isEditing === false) {
			event.preventDefault()
			cell.focus()
			this.editing = false
			if (this.dataGrid.selectionCheckboxesHidden) {
				this.dataGrid.select([...(event.shiftKey ? this.dataGrid.selectedData : []), cell.row.data])
			}
		}
	}

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
				font-size: var(--mo-data-grid-cell-font-size);
			}

			:host(:not([isEditing]):focus) {
				outline: 2px solid var(--mo-color-accent);
			}

			:host([isEditing]) {
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

			:host([isEditing]) > :first-child {
				align-self: center;
				justify-self: stretch;
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
		return this.isEditing ? this.editContentTemplate as HTMLTemplateResult : this.contentTemplate
	}

	private get contentTemplate() {
		return this.column.getContentTemplate?.(this.value, this.data) ?? html`${this.value}`
	}

	private get editContentTemplate() {
		return this.column.getEditContentTemplate?.(this.value, this.data)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-cell': DataGridCell<unknown>
	}
}