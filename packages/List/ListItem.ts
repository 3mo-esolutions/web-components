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
				/*
				 * Only takes effect for list-items used without a list; inside one,
				 * the list turns the item into a subgrid. No gap here on purpose:
				 * a subgrid's own gap overrides the one inherited from the list, which
				 * would reintroduce gutters around empty start/end columns.
				 */
				display: flex;
			}

			:host([disabled]) {
				pointer-events: none;
				opacity: 0.5;
			}

			:host([data-navigability=current]) {
				background-color: var(--mo-color-transparent-gray);
			}

			:host(:focus) {
				outline: none;
			}

			slot[name=start], slot:not([name]), slot[name=end] {
				display: inline-flex;
				align-items: center;
			}

			slot:not([name]) {
				/* Preserves the spacing of content that is not slotted into start/end */
				gap: var(--mo-list-item-spacing, 1rem);
				/* For list-items without a list */
				flex: 1;
			}

			slot[name=end] {
				justify-content: end;
			}

			/*
			 * The spacing between the columns is carried by whatever occupies them
			 * rather than by a column-gap on the list, so that a start/end column
			 * nobody uses takes up exactly no space. Both selectors are needed:
			 * "::slotted" for consumer content, "> *" for the item's own default content.
			 */
			slot[name=start]::slotted(*), slot[name=start] > * {
				margin-inline-end: var(--mo-list-item-spacing, 1rem);
			}

			slot[name=end]::slotted(*), slot[name=end] > * {
				margin-inline-start: var(--mo-list-item-spacing, 1rem);
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