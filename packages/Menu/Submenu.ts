import { ListItem } from '@3mo/list'
import { component, css, html } from '@a11d/lit'

@component('mo-list-submenu')
export class Submenu extends ListItem {

	static override get styles() {
		return css`
			${super.styles}

			:host {
				position: relative;
				padding-inline-end: 0;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-list-item-ripple ?focused=${this.focused} ?disabled=${this.disabled}></mo-list-item-ripple>
			<mo-flex style='flex-flow: row; flex: 1; align-items: center'>
				<slot></slot>
			</mo-flex>
			<mo-icon icon='chevron_right'></mo-icon>
			<mo-menu .anchor=${this} style='align-self: flex-start' managed>
				<slot name='detail'></slot>
			</mo-menu>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-submenu': Submenu
	}
}