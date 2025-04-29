import { component, css } from '@a11d/lit'
import { SplitterResizer } from './index.js'

/** @element mo-splitter-resizer-knob */
@component('mo-splitter-resizer-knob')
export class SplitterResizerKnob extends SplitterResizer {
	static override get styles() {
		return css`
			:host {
				transition: 0.2s;
				background: var(--mo-splitter-resizer-knob-background, var(--mo-color-gray-transparent));
				border-radius: 1rem;
				align-self: center;
			}

			:host([hostHover]), :host([hostResizing]) {
				background: var(--mo-splitter-resizer-knob-active-background, var(--mo-color-accent));
			}

			:host([hostDirection=vertical]), :host([hostDirection=vertical-reversed]) {
				width: 2rem;
				height: 0.375rem;
				margin-block: 0.375rem;
			}

			:host([hostDirection=horizontal]) , :host([hostDirection=horizontal-reversed]) {
				height: 2rem;
				width: 0.375rem;
				margin-inline: 0.375rem;
			}

			:host([hostDirection=vertical][hostHover]), :host([hostDirection=vertical][hostResizing]), :host([hostDirection=vertical-reversed][hostHover]), :host([hostDirection=vertical-reversed][hostResizing]) {
				transform: scaleY(1.2) scaleX(1.5);
			}

			:host([hostDirection=horizontal][hostHover]), :host([hostDirection=horizontal][hostResizing]), :host([hostDirection=horizontal-reversed][hostHover]), :host([hostDirection=horizontal-reversed][hostResizing]) {
				transform: scaleX(1.5);
			}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-splitter-resizer-knob': SplitterResizerKnob
	}
}