import { Component, component, html } from '@a11d/lit'

@component('mo-tooltip-host')
export class TooltipHost extends Component {
	static get instance() {
		return document.querySelector('mo-tooltip-host') ?? document.body
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tooltip-host': TooltipHost
	}
}