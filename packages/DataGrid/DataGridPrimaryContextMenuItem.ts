import { component, css } from '@a11d/lit'
import { ContextMenuItem } from '@3mo/context-menu'

@component('mo-data-grid-primary-context-menu-item')
export class DataGridPrimaryContextMenuItem extends ContextMenuItem {
	static override get styles() {
		return css`
			${super.styles}
			:host {
				font-weight: bold;
			}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-primary-context-menu-item': DataGridPrimaryContextMenuItem
	}
}