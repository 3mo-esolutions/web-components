import { component, html } from '@a11d/lit'
import { NonInertableComponent } from '@a11d/non-inertable-component'

@component('mo-popover-host')
export class PopoverHost extends NonInertableComponent {
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