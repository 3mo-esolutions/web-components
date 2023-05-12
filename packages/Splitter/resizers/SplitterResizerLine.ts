import { component, css } from '@a11d/lit'
import { SplitterResizer } from './index.js'

/** @element mo-splitter-resizer-line */
@component('mo-splitter-resizer-line')
export class SplitterResizerLine extends SplitterResizer {
	static override get styles() {
		return css`
			:host {
				transition: var(--mo-splitter-resizer-line-transition-quick, 250ms);
				background: var(--mo-splitter-resizer-line-idle-background, var(--mo-color-gray-transparent, rgba(128, 128, 128, 0.5)));
			}

			:host([hostHover]), :host([hostResizing]) {
				background: var(--mo-splitter-resizer-line-accent-color, var(--mo-color-accent, #0077c8));
			}

			:host([hostDirection=vertical]), :host([hostDirection=vertical-reversed]) {
				width: 100%;
				height: var(--mo-splitter-resizer-line-thickness, 2px);
			}

			:host([hostDirection=horizontal]), :host([hostDirection=horizontal-reversed]) {
				height: 100%;
				width: var(--mo-splitter-resizer-line-thickness, 2px);
			}

			:host([hostDirection=vertical][hostHover]), :host([hostDirection=vertical][hostResizing]), :host([hostDirection=vertical-reversed][hostHover]), :host([hostDirection=vertical-reversed][hostResizing]) {
				transform: var(--mo-splitter-resizer-line-vertical-transform, scaleY(2));
			}

			:host([hostDirection=horizontal][hostHover]), :host([hostDirection=horizontal][hostResizing]), :host([hostDirection=horizontal-reversed][hostHover]), :host([hostDirection=horizontal-reversed][hostResizing]) {
				transform: var(--mo-splitter-resizer-line-horizontal-transform, scaleX(2));
			}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-splitter-resizer-line': SplitterResizerLine
	}
}