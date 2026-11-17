import { component, css, html } from '@a11d/lit'
import { ListItem } from '@3mo/list'
import { menuItemColumns } from './menuItemColumns.js'

/**
 * A command in a `mo-menu`. Its start, content and end line up with those of the other items of the menu.
 *
 * @element mo-menu-item
 *
 * @slot - The content.
 * @slot start - Content before the content, in the column of the icons, replacing the icon.
 * @slot end - Content after the content, such as a keyboard shortcut.
 *
 * @csspart icon - The icon before the content.
 */
@component('mo-menu-item')
export class MenuItem extends ListItem {
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
			<slot name='end'>${this.endSlotDefaultContent}</slot>
		`
	}

	protected override get iconTemplate() {
		return html`<slot name='start'>${super.iconTemplate}</slot>`
	}

	protected get endSlotDefaultContent() {
		return html.nothing
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu-item': MenuItem
	}
}
