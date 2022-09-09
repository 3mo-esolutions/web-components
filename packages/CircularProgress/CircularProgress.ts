import { Component, component, css, html, ifDefined, property } from '@a11d/lit'
import { CircularProgress as MwcCircularProgress } from '@material/mwc-circular-progress'

/**
 * @attr progress - The progress of the circular progress indicator. Unset to display an indeterminate progress indicator.
 *
 * @cssprop --mo-circular-progress-track-color
 * @cssprop --mo-circular-progress-accent-color
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

			mwc-circular-progress {
				width: 100%;
				height: 100%;
				--mdc-circular-progress-track-color: var(--mo-circular-progress-track-color, transparent);
				--mdc-theme-primary: var(--mo-circular-progress-accent-color, var(--mo-color-accent, #0077c8));
			}
		`
	}

	protected override get template() {
		return html`
			<mwc-circular-progress
				?indeterminate=${this.progress === undefined}
				progress=${ifDefined(this.progress)}
			></mwc-circular-progress>
		`
	}
}

MwcCircularProgress.elementStyles.push(css`
	.mdc-circular-progress {
		width: 100% !important;
		height: 100% !important;
	}
`)

declare global {
	interface HTMLElementTagNameMap {
		'mo-circular-progress': CircularProgress
	}
}