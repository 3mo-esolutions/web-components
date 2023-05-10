import { component } from '@a11d/lit'
import { ListItem } from '@3mo/list'

@component('mo-menu-item')
export class MenuItem extends ListItem {
	override readonly role = 'menuitem'
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu-item': MenuItem
	}
}