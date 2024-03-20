import { Component, component, css, eventListener, html, property, unsafeSVG } from '@a11d/lit'
import { Router } from '@a11d/lit-application'

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
				height: 100%;
				cursor: pointer;
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

	@eventListener('click')
	protected handleClick() {
		Router.path = Router.basePath + (Router.path.endsWith('/') ? '' : '/')
	}

	protected override get template() {
		return html`${unsafeSVG(this.source)}`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-application-logo': ApplicationLogo
	}
}