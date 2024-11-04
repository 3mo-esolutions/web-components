import { component, css } from '@a11d/lit'
import { ListItem } from '@3mo/list'

/** @element mo-navigation-list-item */
@component('mo-navigation-list-item')
export class NavigationListItem extends ListItem {
	get selected() {
		return this.hasAttribute('data-router-selected')
	}

	static override get styles() {
		return css`
			${super.styles}

			:host { cursor: pointer; }

			:host([data-router-selected]) {
				background-color: var(--mo-color-selected);
				color: var(--mo-color-on-selected);
			}
		`
	}

	protected override get startSlotDefaultContent() {
		return !this.icon ? html.nothing : html`
			<mo-icon part='icon' icon=${this.icon}></mo-icon>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-list-item': NavigationListItem
	}
}