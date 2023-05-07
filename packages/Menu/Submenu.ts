import { Component, component, html } from '@a11d/lit'

@component('mo-list-submenu')
export class Submenu extends Component {
	protected override get template() {
		return html`
			<mo-popover-host>
				<mo-list-item>
					<slot></slot>
					<mo-icon icon='chevron_right'></mo-icon>
				</mo-list-item>
				<mo-menu slot='popover'>
					<slot name='menu'></slot>
				</mo-menu>
			</mo-popover-host>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-submenu': Submenu
	}
}