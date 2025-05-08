import { Component, component, property, html, css, state, eventListener, style } from '@a11d/lit'
import { DirectionsByLanguage } from '@3mo/localization'
import { type DataGridColumn, type DataGrid } from './index.js'

@component('mo-data-grid-header-separator')
export class DataGridHeaderSeparator extends Component {
	@property({ type: Object }) dataGrid!: DataGrid<unknown>
	@property({ type: Object }) column!: DataGridColumn<unknown>

	@state() private isResizing = false
	@state() private pointerInlineStart = 0

	private readonly minimum = 30

	private initialWidth?: number
	private targetWidth?: number

	static override get styles() {
		return css`
			:host {
				position: absolute;
				inset-inline-end: -3px;
				height: 100%;
				width: 6px;
				user-select: none;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			:host([data-last]) {
				inset-inline-end: 0px !important;
			}

			:host(:hover) {
				cursor: col-resize;
			}

			.separator {
				margin-inline: auto;
				width: 1px;
				height: 100%;
				cursor: col-resize;
				background-color: var(--mo-color-transparent-gray-3);
				transition: 0.1s;
			}

			:host(:hover) .separator {
				width: 100%;
				background-color: var(--mo-color-accent);
			}

			.resizer {
				position: fixed;
				pointer-events: none;
				top: 0;
				height: 100%;
				background: var(--mo-color-gray);
				width: 2px;
			}
		`
	}

	protected override get template() {
		return html`
			<div class='separator' @pointerdown=${this.handlePointerDown} @dblclick=${this.handleDoubleClick}></div>
			${!this.isResizing ? html.nothing : html`<div class='resizer' ${style({ insetInlineStart: `${this.pointerInlineStart}px` })}></div>`}
		`
	}

	@eventListener({ target: window, type: 'pointerup' })
	protected handlePointerUp() {
		if (!this.isResizing) {
			return
		}
		this.isResizing = false
		this.initialWidth = undefined
		if (this.targetWidth) {
			this.column.width = `${this.targetWidth}px`
		}
		this.dataGrid.setColumns(this.dataGrid.columns)
	}

	@eventListener({ target: window, type: 'pointermove', options: { passive: false } })
	@eventListener({ target: window, type: 'touchmove', options: { passive: false } })
	protected handlePointerMove(e: PointerEvent | TouchEvent) {
		if (this.isResizing === false || this.initialWidth === undefined) {
			return
		}

		e.preventDefault()
		this.updatePointerPosition(e)

		const isRtl = DirectionsByLanguage.get() === 'rtl'
		const { left: offsetLeft, right: offsetRight } = this.getBoundingClientRect()
		const offsetInlineStart = !isRtl ? offsetLeft : offsetRight

		this.targetWidth = this.initialWidth + this.pointerInlineStart - offsetInlineStart

		if (this.targetWidth < this.minimum) {
			this.targetWidth = this.minimum
		}
	}

	private readonly handlePointerDown = (e: PointerEvent) => {
		this.isResizing = true
		this.initialWidth = this.column.widthInPixels
		this.updatePointerPosition(e)
	}

	private updatePointerPosition(e: PointerEvent | TouchEvent) {
		const isRtl = DirectionsByLanguage.get() === 'rtl'
		const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
		this.pointerInlineStart = !isRtl ? clientX : window.innerWidth - clientX
	}

	private readonly handleDoubleClick = () => {
		this.isResizing = false
		this.column.width = 'max-content'
		this.dataGrid.setColumns(this.dataGrid.columns)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-header-separator': DataGridHeaderSeparator
	}
}