import { Component, component, css, html, property } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import { FocusController } from '@3mo/focus-controller'
import './ListItemRipple.js'

/**
 * @element mo-list-item
 *
 * @attr disabled - Whether the list item is disabled
 *
 * @slot - Default slot for content
 */
@component('mo-list-item')
export class ListItem extends Component {
	@disabledProperty({ blockFocus: true }) disabled = false
	@property({ type: Boolean, reflect: true }) protected focused = false

	protected readonly focusController = new FocusController(this, {
		handleChange: focused => this.focused = focused
	})

	override role = 'listitem'
	override tabIndex = 0

	static override get styles() {
		return css`
			:host {
				position: relative;
				width: 100%;
				box-sizing: border-box;
				user-select: none;
				font-size: 16px;
				padding-inline: 16px;
			}

			:host, .container {
				display: flex;
				gap: 16px;
				align-items: center;
				height: 48px;
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

	protected override get template() {
		return html`
			<mo-list-item-ripple ?focused=${this.focused} ?disabled=${this.disabled}></mo-list-item-ripple>
			<slot></slot>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-item': ListItem
	}
}