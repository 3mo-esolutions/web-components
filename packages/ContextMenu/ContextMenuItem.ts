import { component, css } from '@a11d/lit'
import { NestedMenuItem } from '@3mo/menu'

/** @element mo-context-menu-item */
@component('mo-context-menu-item')
export class ContextMenuItem extends NestedMenuItem {
	static override get styles() {
		return css`
			${super.styles}

			:host {
				min-height: 40px;
			}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-context-menu-item': ContextMenuItem
	}
}