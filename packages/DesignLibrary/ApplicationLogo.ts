import { Component, component, css, html, property, unsafeSVG } from '@a11d/lit'

@component('mo-application-logo')
export class ApplicationLogo extends Component {
	static source?: string
	@property() source = ApplicationLogo.source

	static override get styles() {
		return css`
			:host {
				color: var(--mo-color-on-accent);
				display: flex;
				justify-content: center;
				height: 100%
			}

			a {
				color: inherit;
				height: 100%;
			}

			svg {
				height: 100%;
				width: auto;
			}
		`
	}

	protected override get template() {
		return html`
			<a href='/'>
				${unsafeSVG(this.source)}
			</a>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-application-logo': ApplicationLogo
	}
}