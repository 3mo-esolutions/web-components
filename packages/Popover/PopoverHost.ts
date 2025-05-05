import { component, Component } from '@a11d/lit'

@component('mo-popover-host')
export class PopoverHost extends Component {
	static get(anchor: HTMLElement): HTMLElement {
		const node = anchor.getRootNode()
		const root = node instanceof Document ? node.body : node as ShadowRoot
		return root.querySelector('mo-popover-host') ?? root.appendChild(document.createElement('mo-popover-host'))
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-popover-host': PopoverHost
	}
}