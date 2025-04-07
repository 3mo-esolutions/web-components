import { component, html, Component, property, css } from '@a11d/lit'
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

	private get isIOS() {
		return System.detect()?.os === 'iOS'
	}

	private get supportsLoading() {
		return !this.isMacOrSafari && !this.isAndroidChromium && !this.isIOS
	}

	private get supportsEmbed() {
		return !this.isMacOrSafari && !this.isIOS
	}

	protected get pdfSource() {
		return this.source
	}

	protected override get template() {
		return !this.pdfSource ? html.nothing : html`
			${this.loaderTemplate}
			${this.pdfTemplate}
		`
	}

	protected get loaderTemplate() {
		return !this.loading ? html.nothing : html`<mo-circular-progress indeterminate></mo-circular-progress>`
	}

	protected get pdfTemplate() {
		return this.supportsEmbed
			? html`<embed data-pdf type='application/pdf' src=${this.pdfSource} @load=${() => this.loading = false}>`
			: html`<iframe data-pdf type='application/pdf' src=${this.pdfSource} @load=${() => this.loading = false}></iframe>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-pdf': Pdf
	}
}