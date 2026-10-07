import { component, Component, css, html, ifDefined, property } from '@a11d/lit'
import { MdLinearProgress } from '@material/web/progress/linear-progress.js'
import '@3mo/theme'

/**
 * A horizontal bar showing progress, or activity of unknown length.
 *
 * @element mo-linear-progress
 *
 * @ssr true
 *
 * @attr progress - The progress from `0` to `1`. With neither this nor `buffer` set, the progress is indeterminate.
 * @attr buffer - The buffered part from `0` to `1`, shown ahead of the progress.
 * @attr reverse - Reverses the direction of the progress
 *
 * @cssprop --mo-linear-progress-accent-color - The color of the progress
 * @cssprop --mo-linear-progress-track-color - The color of the track
 */
@component('mo-linear-progress')
export class LinearProgress extends Component {
	@property({ type: Number }) progress?: number
	@property({ type: Number }) buffer?: number
	@property({ type: Boolean }) reverse = false

	static override get styles() {
		return css`
			:host {
				display: block;
				height: 4px;
			}

			md-linear-progress {
				width: 100%;
				height: 100%;
				border-radius: inherit;
				--md-linear-progress-active-indicator-color: var(--mo-linear-progress-accent-color, var(--mo-color-accent));
				--md-linear-progress-active-indicator-height: 100%;
				--md-linear-progress-track-color: var(--mo-linear-progress-track-color, color-mix(in srgb, var(--md-linear-progress-active-indicator-color) 8%, var(--mo-color-gray) 25%));
				--md-linear-progress-track-height: 100%;
				--md-linear-progress-track-shape: var(--mo-border-radius);
			}
		`
	}

	protected override get template() {
		return html`
			<md-linear-progress
				?indeterminate=${this.progress === undefined && this.buffer === undefined}
				value=${ifDefined(this.progress)}
				buffer=${ifDefined(this.buffer)}
			></md-linear-progress>
		`
	}
}

MdLinearProgress.elementStyles.push(css`
	:host(:not([buffer])) .dots {
		display: none;
	}

	.dots {
		animation-name: absolute-buffering;
	}

	@keyframes absolute-buffering {
		0% { transform: translateX(10px) }
	}

	progress {
		height: 100% !important;
		border-radius: inherit;
	}
`)

declare global {
	interface HTMLElementTagNameMap {
		'mo-linear-progress': LinearProgress
	}
}
