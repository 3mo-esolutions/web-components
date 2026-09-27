import { component } from '@a11d/lit'
import { NestedMenuItem } from '@3mo/menu'

/**
 * An item of a `mo-context-menu`, which opens the items in its `submenu` slot as a submenu.
 *
 * @element mo-context-menu-item
 */
@component('mo-context-menu-item')
export class ContextMenuItem extends NestedMenuItem { }

declare global {
	interface HTMLElementTagNameMap {
		'mo-context-menu-item': ContextMenuItem
	}
}