import { Component, component, property, html, css, state, style, ElementRef } from '@a11d/lit'
import { DirectionsByLanguage } from '@3mo/localization'
import { PointerDragController, type PointerDrag } from '@3mo/pointer-controller'
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

	private readonly handle = new ElementRef<HTMLElement>()

	protected readonly pointerDrag = new PointerDragController(this, host => ({
		get target() { return host.handle.value },
		threshold: 0,
		handleDragStart: drag => host.handleDragStart(drag),
		handleDrag: drag => host.handleDrag(drag),
		handleDragEnd: () => host.handleDragEnd(),
		handleDragCancel: () => host.handleDragCancel(),
	}))

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
			<div class='separator' ${this.handle.ref()} @dblclick=${this.handleDoubleClick}></div>
			${!this.isResizing ? html.nothing : html`<div class='resizer' ${style({ insetInlineStart: `${this.pointerInlineStart}px` })}></div>`}
		`
	}

	private handleDragStart({ event }: PointerDrag) {
		this.isResizing = true
		this.initialWidth = this.column.widthInPixels
		this.targetWidth = undefined
		this.updatePointerPosition(event)
	}

	private handleDrag({ deltaX, event }: PointerDrag) {
		this.updatePointerPosition(event)
		const inlineDelta = DirectionsByLanguage.get() === 'rtl' ? -deltaX : deltaX
		this.targetWidth = Math.max(this.minimum, (this.initialWidth ?? 0) + inlineDelta)
	}

	private handleDragEnd() {
		const { targetWidth, initialWidth } = this
		this.handleDragCancel()
		if (targetWidth !== undefined && targetWidth !== initialWidth) {
			this.column.modify({ width: `${targetWidth}px` })
		}
	}

	private handleDragCancel() {
		this.isResizing = false
		this.initialWidth = undefined
		this.targetWidth = undefined
	}

	private updatePointerPosition({ clientX }: PointerEvent) {
		this.pointerInlineStart = DirectionsByLanguage.get() !== 'rtl' ? clientX : window.innerWidth - clientX
	}

	private readonly handleDoubleClick = () => {
		this.isResizing = false
		this.column.modify({ width: 'max-content' })
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-header-separator': DataGridHeaderSeparator
	}
}