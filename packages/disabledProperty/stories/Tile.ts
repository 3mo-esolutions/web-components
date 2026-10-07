import { Component, component, css, html } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'

/** A focusable tile that leaves the tab order while it is disabled. */
@component('story-tile')
export class Tile extends Component {
	@disabledProperty({ blockFocus: true }) disabled = false

	static override get styles() {
		return css`
			:host {
				display: grid; place-content: center; inline-size: 8rem; block-size: 4rem;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius); cursor: pointer;
			}
			:host(:focus-visible) { outline: 2px solid var(--mo-color-accent); outline-offset: 2px; }
			:host([disabled]) { opacity: 0.4; cursor: default; }
		`
	}

	protected override connected() {
		this.tabIndex = 0
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}
