import { component, css } from '@a11d/lit'
import { SplitterResizer } from './index.js'

/**
 * A thin line between two splitter items, as an alternative resizer.
 *
 * @element mo-splitter-resizer-line
 *
 * @ssr true
 *
 * @cssprop --mo-splitter-resizer-line-thickness - The thickness of the line
 * @cssprop --mo-splitter-resizer-line-idle-background - The color of the line
 * @cssprop --mo-splitter-resizer-line-accent-color - The color of the line while hovered or dragged
 * @cssprop --mo-splitter-resizer-line-transition-quick - The transition of the line
 * @cssprop --mo-splitter-resizer-line-vertical-transform - The transform of a line between vertically laid out items while hovered or dragged
 * @cssprop --mo-splitter-resizer-line-horizontal-transform - The transform of a line between horizontally laid out items while hovered or dragged
 */
@component('mo-splitter-resizer-line')
export class SplitterResizerLine extends SplitterResizer {
	static override get styles() {
		return css`
			:host {
				transition: var(--mo-splitter-resizer-line-transition-quick, 250ms);
				background: var(--mo-splitter-resizer-line-idle-background, var(--mo-color-gray-transparent));
			}

			:host([hostHover]), :host([hostResizing]) {
				background: var(--mo-splitter-resizer-line-accent-color, var(--mo-color-accent));
			}

			:host([hostDirection=vertical]), :host([hostDirection=vertical-reversed]) {
				width: 100%;
				height: var(--mo-splitter-resizer-line-thickness, 0.125rem);
			}

			:host([hostDirection=horizontal]), :host([hostDirection=horizontal-reversed]) {
				height: 100%;
				width: var(--mo-splitter-resizer-line-thickness, 0.125rem);
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