import { Component, component, property, html, css, state, event, eventListener, style } from '@a11d/lit'
import { ColumnDefinition, DataGrid } from './index.js'

/** @fires columnUpdate */
@component('mo-data-grid-header-separator')
export class DataGridHeaderSeparator extends Component {
	static disableResizing = false

	@event() readonly columnUpdate!: EventDispatcher

	@property({ type: Object }) dataGrid!: DataGrid<unknown>
	@property({ type: Object }) column!: ColumnDefinition<unknown>

	@state() private isResizing = false
	@state() private delta = 0

	private readonly minimum = 30

	private initialWidth?: number
	private targetWidth?: number

	static override get styles() {
		return css`
			div.separator {
				display: flex;
				align-items: center;
				justify-content: center;
				inset-inline-start: calc(var(--mo-data-grid-columns-gap) * -1);
				width: var(--mo-data-grid-columns-gap);
				height: 100%;
				user-select: none;
			}

			.knob {
				height: var(--mo-data-grid-header-separator-height);
				width: var(--mo-data-grid-header-separator-width);
				border-radius: 100px;
				background-color: var(--mo-color-gray);
				transition: 0.2s;
			}

			:host(:not([disabled])) div.separator {
				cursor: col-resize;
			}

			:host(:not([disabled])) .separator:hover .knob {
				--mo-data-grid-header-separator-height: 30px;
				--mo-data-grid-header-separator-width: 8px;
				background-color: var(--mo-color-accent);
				cursor: col-resize;
			}

			:host(:not([disabled])) .resizerOverlay {
				position: fixed;
				top: 0;
				height: 100%;
				background: var(--mo-color-gray);
				width: 2px;
			}
		`
	}

	protected override get template() {
		this.toggleAttribute('disabled', DataGridHeaderSeparator.disableResizing)
		return html`
			<div class='separator' @mousedown=${this.handleMouseDown}>
				<div class='knob'></div>
			</div>

			${this.isResizing === false ? html.nothing : html`
				<div class='resizerOverlay' ${style({ marginInlineStart: `${this.delta}px` })}></div>
			`}
		`
	}

	@eventListener({ target: window, type: 'mouseup' })
	protected handleMouseUp() {
		if (!this.isResizing || DataGridHeaderSeparator.disableResizing) {
			return
		}
		this.isResizing = false
		this.delta = 0
		this.initialWidth = undefined
		this.column.width = `${this.targetWidth}px`
		this.dataGrid.setColumns(this.dataGrid.columns)
		this.columnUpdate.dispatch()
	}

	@eventListener({ target: window, type: 'mousemove' })
	protected handleMouseMove(e: MouseEvent) {
		if (this.isResizing === false || this.initialWidth === undefined || DataGridHeaderSeparator.disableResizing) {
			return
		}

		const mouseX = e.clientX
		const offsetLeft = this.offsetLeft

		this.delta = mouseX - offsetLeft - this.dataGrid.offsetLeft

		this.targetWidth = this.initialWidth + this.delta

		if (this.targetWidth < this.minimum) {
			this.delta = this.minimum - this.initialWidth
			this.targetWidth = this.minimum

		}
	}

	private readonly handleMouseDown = () => {
		if (DataGridHeaderSeparator.disableResizing) {
			return
		}
		this.isResizing = true
		this.initialWidth = this.getColumnWidth(this.column)
	}

	private getColumnWidth(column: ColumnDefinition<unknown>) {
		if (column.hidden === true) {
			return 0
		}

		column.width = column.width ?? '1fr'
		const columnIndex = this.dataGrid.visibleColumns.findIndex(c => c === this.column)
		const targetColumnIndex = this.dataGrid.visibleColumns.findIndex(c => c === column)
		let targetColumn = this.previousElementSibling as Element
		if (columnIndex !== targetColumnIndex) {
			let steps = (targetColumnIndex - columnIndex) * 2 - 1
			while (steps >= 0) {
				targetColumn = targetColumn.nextElementSibling as Element
				steps--
			}
		}

		return targetColumn.clientWidth || 0
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-header-separator': DataGridHeaderSeparator
	}
}