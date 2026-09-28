import { component, css } from '@a11d/lit'
import { SelectableListItem } from '@3mo/list'

/**
 * An item of a `mo-menu` that the menu selects and deselects, one at a time or several at once.
 *
 * @element mo-selectable-menu-item
 *
 * @ssr true
 */
@component('mo-selectable-menu-item')
export class SelectableMenuItem extends SelectableListItem {
	override readonly role = 'menuitem'

	static override get styles() {
		return css`
			${super.styles}
			:host { min-height: 2.25rem; }
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-menu-item': SelectableMenuItem
	}
}