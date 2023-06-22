import { Component, component, css, property } from '@a11d/lit'

@component('mo-toolbar-item-alibi')
export class ToolbarItemAlibi extends Component {
	@property({ type: Number, reflect: true }) width?: number = undefined
	@property({ type: Number, reflect: true }) height?: number = undefined

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				background-color: peachpuff;
			}

			:host([width]) {
				width: attr(width px);
			}

			:host([height]) {
				height: attr(height px);
			}
		`
	}

	constructor(public origin: Element) {
		super()
		this.width = origin.getBoundingClientRect().width
		this.height = origin.getBoundingClientRect().height
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-toolbar-item-alibi': ToolbarItemAlibi
	}
}