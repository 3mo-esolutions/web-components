import { component } from '@a11d/lit'
import { NestedMenuItem } from '@3mo/menu'

/** @element mo-context-menu-item */
@component('mo-context-menu-item')
export class ContextMenuItem extends NestedMenuItem { }

declare global {
	interface HTMLElementTagNameMap {
		'mo-context-menu-item': ContextMenuItem
	}
}