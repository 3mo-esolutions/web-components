import { Component, component, property, html, css } from '@a11d/lit'
import { type DataGridColumn } from './index.js'

/**
 * The handle resizing a column, drawing a line where the pointer is while it drags.
 *
 * @ssr true
 */
@component('mo-data-grid-header-separator')
export class DataGridHeaderSeparator extends Component {
	@property({ type: Object }) column!: DataGridColumn<unknown>

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
				display: none;
				position: fixed;
				pointer-events: none;
				top: 0;
				inset-inline-start: var(--mo-data-grid-column-resizer-pointer);
				height: 100%;
				background: var(--mo-color-gray);
				width: 2px;
			}

			[data-resizing] .resizer {
				display: block;
			}
		`
	}

	protected override get template() {
		return html`
			<div class='separator' ${this.column?.controller?.columns.resizer(this.column) ?? html.nothing}>
				<div class='resizer'></div>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-header-separator': DataGridHeaderSeparator
	}
}