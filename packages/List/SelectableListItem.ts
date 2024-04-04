import { component, css, eventListener, property } from '@a11d/lit'
import { SelectionListItem } from './SelectionListItem.js'

/**
 * @element mo-selectable-list-item
 *
 * @attr selected - Whether the list item is selected
 * @attr toggleable - Whether the list item selection can be toggled on and off
 *
 * @fires change - Dispatched when the list item is selected or deselected
 */
@component('mo-selectable-list-item')
export class SelectableListItem extends SelectionListItem {
	@property({ type: Boolean, reflect: true }) selected = false
	@property({ type: Boolean }) toggleable = false

	static override get styles() {
		return css`
			${super.styles}

			:host([selected]) {
				background-color: var(--mo-selectable-list-item-selected-background, color-mix(in srgb, var(--mo-color-accent), transparent 90%));
				color: var(--mo-selectable-list-item-selected-color, color-mix(in srgb, var(--mo-color-accent), var(--mo-color-foreground) 25%));
			}
		`
	}

	@eventListener('click')
	protected handleClick() {
		this.selected = this.toggleable ? !this.selected : true
		this.change.dispatch(this.selected)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-list-item': SelectableListItem
	}
}