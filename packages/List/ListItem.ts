import { Component, component, css, html, property } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import './ListItemRipple.js'

/**
 * @element mo-list-item
 *
 * @attr disabled - Whether the list item is disabled
 * @attr preventClickOnSpace - Whether the list item should prevent click on space
 *
 * @slot - Default slot for content
 */
@component('mo-list-item')
export class ListItem extends Component {
	@disabledProperty({ blockFocus: true }) disabled = false
	@property({ type: Boolean }) preventClickOnSpace = false
	@property({ type: Boolean, reflect: true }) protected focused = false

	override role = 'listitem'
	override tabIndex = 0

	static override get styles() {
		return css`
			:host {
				position: relative;
				width: 100%;
				box-sizing: border-box;
				user-select: none;
				padding-inline: 16px;
				padding-block: 0.48em;
				display: flex;
				gap: 16px;
				align-items: center;
				min-height: 48px;
			}

			:host([disabled]) {
				pointer-events: none;
				opacity: 0.5;
			}

			:host(:focus) {
				outline: none;
			}

			slot:not([name]) {
				display: inline-flex;
				gap: inherit;
				align-items: inherit;
				justify-content: inherit;
				flex: 1;
			}
		`
	}

	protected get rippleActive() {
		return this.focused
	}

	protected get focusRingActive() {
		return this.focused && this.hasAttribute('data-keyboard-focus')
	}

	protected override get template() {
		return html`
			${!this.focusRingActive ? html.nothing : html`<mo-focus-ring inward visible></mo-focus-ring>`}
			<mo-list-item-ripple ?focused=${this.rippleActive} ?disabled=${this.disabled} ?preventClickOnSpace=${this.preventClickOnSpace}></mo-list-item-ripple>
			<slot></slot>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-item': ListItem
	}
}