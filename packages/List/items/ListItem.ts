import { Component, component, css, eventListener, html, property } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import './ListItemRipple.js'
import '@3mo/flex'

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

	override role = 'listitem'
	override tabIndex = 0

	@eventListener('focus')
	protected handleFocus() {
		this.focused = true
	}

	@eventListener('blur')
	protected handleBlur() {
		this.focused = false
	}

	static override get styles() {
		return css`
			:host {
				display: flex;
				position: relative;
				width: 100%;
				box-sizing: border-box;
				height: 48px;
				user-select: none;
				font-size: 16px;
				padding: 0 16px;
				gap: 16px;
				align-items: center;
			}

			:host([disabled]) {
				opacity: 0.5;
			}

			:host(:focus) {
				outline: none;
			}

			slot {
				display: inline-flex;
				gap: inherit;
				align-items: inherit;
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