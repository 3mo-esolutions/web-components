import { Component, component, css, html, property } from '@a11d/lit'
import { type Splitter } from './Splitter.js'

/**
 * An item of a splitter, resized by the resizers beside it.
 *
 * @element mo-splitter-item
 *
 * @attr size - The initial size along the splitter's direction, such as `60%`; the last item takes the rest
 * @attr min - The minimum size along the splitter's direction
 * @attr collapsed - Whether the item shrinks to its content and leaves its space to the others
 *
 * @slot - The content of the item
 */
@component('mo-splitter-item')
export class SplitterItem extends Component {
	@property() size?: string
	@property() min?: string
	@property({ type: Boolean }) collapsed = false

	private get splitter() {
		return this.parentElement as Splitter
	}

	protected override updated(...parameters: Parameters<Component['updated']>) {
		super.updated(...parameters)
		this.splitter.requestUpdate()
	}

	static override get styles() {
		return css`
			:host {
				overflow: hidden;
				position: relative;
				display: block;
				height: 100%;
				width: 100%;
			}

			::slotted(:first-child) {
				height: 100%;
				width: 100%;
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-splitter-item': SplitterItem
	}
}