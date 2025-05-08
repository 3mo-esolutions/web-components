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
				background-color: var(--mo-selectable-list-item-selected-background, color-mix(in srgb, var(--mo-color-accent), transparent 90%));
				color: var(--mo-selectable-list-item-selected-color, color-mix(in srgb, var(--mo-color-accent), var(--mo-color-foreground) 25%));
			}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-list-item': NavigationListItem
	}
}