import { component, css, html, nothing, property } from '@a11d/lit'
import { ListItem } from '@3mo/list'
import { MaterialIcon } from '@3mo/icon'

/**
 * @element mo-navigation-list-item
 * @attr icon
 */
@component('mo-navigation-list-item')
export class NavigationListItem extends ListItem {
	@property() icon?: MaterialIcon

	static override get styles() {
		return css`
			${super.styles}

			:host { cursor: pointer; }

			:host([data-router-selected]) {
				background-color: var(--mo-color-accent-transparent);
				color: var(--mo-color-accent);
			}
		`
	}

	protected override get template() {
		return html`
			${!this.icon ? nothing : html`<mo-icon icon=${this.icon}></mo-icon>`}
			${super.template}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-list-item': NavigationListItem
	}
}