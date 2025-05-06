import { component, Component, css, html } from '@a11d/lit'

@component('mo-popover-host')
export class PopoverHost extends Component {
	static get(anchor: HTMLElement): HTMLElement {
		const node = anchor.getRootNode()
		const root = node instanceof Document ? node.body : node as ShadowRoot
		return root.querySelector('mo-popover-host') ?? root.appendChild(document.createElement('mo-popover-host'))
	}

	static override get styles() {
		return css`
			:host {
				width: 0;
				height: 0;
				position: absolute;
			}
		`
	}

	override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-popover-host': PopoverHost
	}
}