import { Component, component, css, html } from '@a11d/lit'

@component('mo-label')
export class Label extends Component {
	static override get styles() {
		return css`
			:host {
				padding: 0.125rem 0.375rem;
				border-radius: var(--mo-border-radius);
				color: var(--mo-color-accent);
				font-weight: 500;
				background: color-mix(in srgb, currentColor, transparent 75%);
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-label': Label
	}
}