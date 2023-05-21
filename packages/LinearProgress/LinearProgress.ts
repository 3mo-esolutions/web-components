import { component, Component, css, html, ifDefined, property } from '@a11d/lit'
import { LinearProgress as MwcLinearProgress } from '@material/mwc-linear-progress'
import '@3mo/theme'

/**
 * @attr progress
 * @attr buffer
 *
 * @cssprop --mo-linear-progress-accent
 * @cssprop --mdc-linear-progress-buffer-color
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

			mwc-linear-progress {
				width: 100%;
				height: 100%;
				border-radius: inherit;
				--mdc-theme-primary: var(--mo-linear-progress-accent, var(--mo-color-accent));
				--mdc-linear-progress-buffer-color: var(--mo-linear-progress-buffer-color, var(--mo-color-gray-transparent));
			}
		`
	}

	protected override get template() {
		return html`
			<mwc-linear-progress
				?indeterminate=${this.progress === undefined && this.buffer === undefined}
				progress=${ifDefined(this.progress)}
				buffer=${ifDefined(this.buffer)}
			></mwc-linear-progress>
		`
	}
}

MwcLinearProgress.elementStyles.push(css`
	.mdc-linear-progress {
		height: 100% !important;
		border-radius: inherit;
	}

	.mdc-linear-progress__bar-inner {
		border: none !important;
		height: 100%;
		background: var(--mdc-theme-primary);
	}
`)

declare global {
	interface HTMLElementTagNameMap {
		'mo-linear-progress': LinearProgress
	}
}