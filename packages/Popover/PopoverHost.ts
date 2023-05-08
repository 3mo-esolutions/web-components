import { Component, component, html } from '@a11d/lit'

@component('mo-popover-host')
export class PopoverHost extends Component {
	static get instance() {
		return document.querySelector('mo-popover-host') ?? document.body
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-popover-host': PopoverHost
	}
}