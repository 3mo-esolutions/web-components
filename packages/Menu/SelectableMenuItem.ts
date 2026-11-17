import { component, css, html } from '@a11d/lit'
import { SelectableListItem } from '@3mo/list'
import { menuItemColumns } from './menuItemColumns.js'

/**
 * An item of a `mo-menu` that the menu selects and deselects, one at a time or several at once.
 *
 * @element mo-selectable-menu-item
 *
 * @slot - The content.
 * @slot start - Content before the content, in the column of the icons, replacing the icon.
 * @slot end - Content after the content.
 *
 * @csspart icon - The icon before the content.
 */
@component('mo-selectable-menu-item')
export class SelectableMenuItem extends SelectableListItem {
	override readonly role = 'menuitem'

	static override get styles() {
		return css`
			${super.styles}
			${menuItemColumns}
			:host { min-height: 2.25rem; }
		`
	}

	protected override get template() {
		return html`
			${super.template}
			<slot name='end'></slot>
		`
	}

	protected override get iconTemplate() {
		return html`<slot name='start'>${super.iconTemplate}</slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-menu-item': SelectableMenuItem
	}
}
