import { component, html, nothing, property } from '@a11d/lit'
import { ListItem } from '@3mo/list'
import { MaterialIcon } from '@3mo/icon'

/**
 * @element mo-menu-item
 * @attr icon
 */
@component('mo-menu-item')
export class MenuItem extends ListItem {
	override readonly role = 'menuitem'

	@property({ reflect: true }) icon?: MaterialIcon

	protected override get template() {
		return html`
			${this.iconTemplate}
			${super.template}
		`
	}

	protected get iconTemplate() {
		return !this.icon ? nothing : html`
			<mo-icon style='opacity: 0.66' icon=${this.icon}></mo-icon>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu-item': MenuItem
	}
}