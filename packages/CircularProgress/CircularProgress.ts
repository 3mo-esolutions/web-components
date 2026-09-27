import { Component, component, css, html, ifDefined, property } from '@a11d/lit'
import { MdCircularProgress } from '@material/web/progress/circular-progress.js'
import '@3mo/theme'

/**
 * A circular indicator of progress, or of activity of unknown length.
 *
 * @element mo-circular-progress
 *
 * @ssr true
 *
 * @attr progress - The progress from `0` to `1`. Unset to display an indeterminate progress indicator.
 *
 * @cssprop --mo-circular-progress-accent-color - The color of the indicator, the accent color by default.
 * @cssprop --mo-circular-progress-track-color - The color of the track behind the indicator, transparent by default.
 */
@component('mo-circular-progress')
export class CircularProgress extends Component {
	@property({ type: Number }) progress?: number

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				width: 48px;
				height: 48px;
				aspect-ratio: 1;
			}

			md-circular-progress {
				width: 100%;
				height: 100%;
				--md-circular-progress-active-indicator-color: var(--mo-circular-progress-accent-color, var(--mo-color-accent));
				--md-circular-progress-track-color: var(--mo-circular-progress-track-color, rgba(0, 0, 0, 0));
			}
		`
	}

	protected override get template() {
		return html`
			<md-circular-progress
				?indeterminate=${this.progress === undefined}
				value=${ifDefined(this.progress)}
			></md-circular-progress>
		`
	}
}

MdCircularProgress.elementStyles.push(css`
	:host {
		min-block-size: 100% !important;
		min-inline-size: 100% !important;
	}

	.progress {
		width: 100% !important;
		height: 100% !important;
		margin: 0 !important;
	}

	.track {
		stroke: var(--md-circular-progress-track-color);
	}
`)

declare global {
	interface HTMLElementTagNameMap {
		'mo-circular-progress': CircularProgress
	}
}