import { component, css } from '@a11d/lit'
import { MenuItem } from './MenuItem.js'

/** @element mo-navigation-menu-item */
@component('mo-navigation-menu-item')
export class NavigationMenuItem extends MenuItem {
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
		'mo-navigation-menu-item': NavigationMenuItem
	}
}