import { ListItem } from '@3mo/list'
import { component, html } from '@a11d/lit'

@component('mo-list-submenu')
export class Submenu extends ListItem {
	protected override get template() {
		return html`
			${super.template}
			<mo-icon icon='chevron_right'></mo-icon>
			<mo-menu .anchor=${this}>
				<slot name='menu'></slot>
			</mo-menu>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-submenu': Submenu
	}
}