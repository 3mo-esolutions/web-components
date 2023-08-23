import { component, html, Component, nothing, property, css } from '@a11d/lit'
import * as System from 'detect-browser'

@component('mo-pdf')
export class Pdf extends Component {
	@property() source?: string

	@property({ type: Boolean, reflect: true }) protected loading = this.supportsLoading

	static override get styles() {
		return css`
			:host {
				display: block;
			}

			:host([loading]) [data-pdf] {
				visibility: hidden;
			}

			mo-circular-progress {
				position: absolute;
				margin: auto;
				inset: 0;
			}

			[data-pdf] {
				width: 100%;
				height: 100%;
			}
		`
	}

	private get isMacOrSafari() {
		const system = System.detect()
		return system?.os === 'Mac OS' || system?.name === 'safari'
	}

	private get isAndroidChromium() {
		const system = System.detect()
		return system?.os === 'Android OS' && system?.name !== 'firefox'
	}

	private get supportsLoading() {
		return !this.isMacOrSafari && !this.isAndroidChromium
	}

	private get supportsEmbed() {
		return !this.isMacOrSafari
	}

	protected get pdfSource() {
		return this.source
	}

	protected override get template() {
		return !this.pdfSource ? nothing : html`
			${this.loaderTemplate}
			${this.pdfTemplate}
		`
	}

	protected get loaderTemplate() {
		return !this.loading ? nothing : html`<mo-circular-progress indeterminate></mo-circular-progress>`
	}

	protected get pdfTemplate() {
		return this.supportsEmbed
			? html`<embed data-pdf type='application/pdf' src=${this.pdfSource} @load=${() => this.loading = false} />`
			: html`<iframe data-pdf type='application/pdf' src=${this.pdfSource} @load=${() => this.loading = false}></iframe>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-pdf': Pdf
	}
}