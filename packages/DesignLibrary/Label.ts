import { Component, component, html } from '@a11d/lit'

@component('mo-label')
export class Label extends Component {
	protected override get template() {
		return html`
			<style>
				:host {
					padding: 2px 6px;
					border-radius: var(--mo-border-radius);
					margin: 0 4px;
					color: var(--mo-color-accent);
					font-weight: 500;
					background: var(--mo-color-accent-gradient-transparent);
				}
			</style>
			<slot></slot>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-label': Label
	}
}