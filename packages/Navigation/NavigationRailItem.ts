import { Component, component, css, html, property } from '@a11d/lit'
import { type INavigation } from './INavigation.js'

/**
 * A navigation of a navigation rail: an icon with its label beneath it.
 *
 * @element mo-navigation-rail-item
 *
 * @attr navigation - The navigation this item stands for.
 * @attr data-current - Whether this navigation, or one nested in it, is the page being shown.
 * @attr selected - Whether the rail is showing this navigation's destinations.
 *
 * @csspart indicator - The shape behind the icon, which marks the navigation the page belongs to.
 * @csspart label - The label beneath the icon.
 */
@component('mo-navigation-rail-item')
export class NavigationRailItem extends Component {
	@property({ type: Object }) navigation!: INavigation
	@property({ type: Boolean, reflect: true, attribute: 'data-current' }) current = false
	@property({ type: Boolean, reflect: true }) selected = false

	override tabIndex = 0

	static override get styles() {
		return css`
			:host {
				position: relative;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4px;
				padding-block: 8px;
				border-radius: var(--mo-border-radius);
				color: var(--mo-color-foreground-transparent);
				cursor: pointer;
				outline: none;
				-webkit-tap-highlight-color: transparent;
			}

			:host([selected]) {
				background: var(--mo-color-transparent-gray-1);
			}

			:host([data-current]), :host([data-router-selected]) {
				color: var(--mo-color-on-selected);
			}

			[part=indicator] {
				display: grid;
				place-items: center;
				inline-size: 56px;
				block-size: 32px;
				border-radius: 16px;
				transition: background-color 0.2s ease;

				mo-icon {
					font-size: 24px;
				}
			}

			:host([data-current]) [part=indicator], :host([data-router-selected]) [part=indicator] {
				background: var(--mo-color-selected);
			}

			:host(:hover:not([data-current])) [part=indicator] {
				background: var(--mo-color-transparent-gray-2);
			}

			[part=label] {
				font-size: 0.75rem;
				line-height: 1.2;
				font-weight: 500;
				text-align: center;
				max-inline-size: 100%;
				padding-inline: 4px;
				overflow: hidden;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-focus-ring .control=${this} inward></mo-focus-ring>
			<span part='indicator'>
				${!this.navigation?.icon ? html.nothing : html`<mo-icon icon=${this.navigation.icon}></mo-icon>`}
			</span>
			<span part='label'>${this.navigation?.label}</span>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-rail-item': NavigationRailItem
	}
}