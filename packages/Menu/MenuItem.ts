import { component, css, html, property } from '@a11d/lit'
import { ListItem } from '@3mo/list'
import { type MaterialIcon } from '@3mo/icon'

/**
 * @element mo-menu-item
 *
 * @attr icon
 *
 * @csspart icon
 */
@component('mo-menu-item')
export class MenuItem extends ListItem {
	@property({ reflect: true }) icon?: MaterialIcon

	override readonly role = 'menuitem'

	static override get styles() {
		return css`
			${super.styles}

			:host {
				min-height: 36px;
			}
		`
	}

	protected override get template() {
		return html`
			${this.iconTemplate}
			${super.template}
		`
	}

	protected get iconTemplate() {
		return !this.icon ? html.nothing : html`
			<mo-icon part='icon' style='opacity: 0.66' icon=${this.icon}></mo-icon>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu-item': MenuItem
	}
}