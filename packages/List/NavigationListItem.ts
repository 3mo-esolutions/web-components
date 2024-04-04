import { component, css, html, property } from '@a11d/lit'
import { ListItem } from '@3mo/list'
import { MaterialIcon } from '@3mo/icon'

/**
 * @element mo-navigation-list-item
 * @attr icon
 * @csspart icon
 */
@component('mo-navigation-list-item')
export class NavigationListItem extends ListItem {
	@property() icon?: MaterialIcon

	get selected() {
		return this.hasAttribute('data-router-selected')
	}

	static override get styles() {
		return css`
			${super.styles}

			:host { cursor: pointer; }

			:host([data-router-selected]) {
				background-color: var(--mo-selectable-list-item-selected-background, color-mix(in srgb, var(--mo-color-accent), transparent 90%));
				color: var(--mo-selectable-list-item-selected-color, color-mix(in srgb, var(--mo-color-accent), var(--mo-color-foreground) 25%));
			}
		`
	}

	protected override get template() {
		return html`
			${!this.icon ? html.nothing : html`<mo-icon part='icon' icon=${this.icon}></mo-icon>`}
			${super.template}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-list-item': NavigationListItem
	}
}