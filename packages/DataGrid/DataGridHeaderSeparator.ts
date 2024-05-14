import { Component, component, property, html, css, state, eventListener, style } from '@a11d/lit'
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
			}

			div.separator {
				display: flex;
				align-items: center;
				justify-content: center;
				inset-inline-start: -6px;
				width: 6px;
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
			<div class='separator' @pointerdown=${this.handlePointerDown} @dblclick=${this.handleDoubleClick}>
				<div class='knob'></div>
			</div>

			${this.isResizing === false ? html.nothing : html`
				<div class='resizerOverlay' ${style({ insetInlineStart: `${this.pointerInlineStart}px` })}></div>
			`}
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

	@eventListener({ target: window, type: 'pointermove' })
	@eventListener({ target: window, type: 'touchmove', options: { passive: false } as any })
	protected handlePointerMove(e: PointerEvent | TouchEvent) {
		if (this.isResizing === false || this.initialWidth === undefined) {
			return
		}

		e.preventDefault()
		this.updatePointerPosition(e)

		const isRtl = getComputedStyle(this).direction === 'rtl'
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
		const isRtl = getComputedStyle(this).direction === 'rtl'
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