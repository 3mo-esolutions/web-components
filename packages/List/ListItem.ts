import { Component, component, css, html, property } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import type { MaterialIcon } from '@3mo/icon'
import './ListItemRipple.js'

/**
 * @element mo-list-item
 *
 * @attr disabled - Whether the list item is disabled
 * @attr icon - Icon to be displayed in the list item
 * @attr preventClickOnSpace - Whether the list item should prevent click on space
 *
 * @slot - Default slot for content
 * @slot start - Slot for content at the start
 * @slot end - Slot for content at the end
 */
@component('mo-list-item')
export class ListItem extends Component {
	@disabledProperty({ blockFocus: true }) disabled = false
	@property() icon?: MaterialIcon
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
				padding-inline: 1rem;
				padding-block: 0.48em;
				align-items: center;
				min-height: 3rem;
				/* For list-items without a list */
				display: flex;
				gap: 16px;
			}

			:host([disabled]) {
				pointer-events: none;
				opacity: 0.5;
			}

			:host(:focus) {
				outline: none;
			}

			slot[name=start], slot:not([name]), slot[name=end] {
				display: inline-flex;
			}

			slot:not([name]) {
				/* For list-items without a list */
				flex: 1;
			}

			slot[name=end] {
				justify-content: end;
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
			<slot name='start'>${this.startSlotDefaultContent}</slot>
			<slot></slot>
			<slot name='end'>${this.endSlotDefaultContent}</slot>
		`
	}

	protected get startSlotDefaultContent() {
		return html.nothing
	}

	protected get endSlotDefaultContent() {
		return html.nothing
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-item': ListItem
	}
}