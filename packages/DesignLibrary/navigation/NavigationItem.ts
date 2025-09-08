import { bind, Component, component, css, html, property, repeat } from '@a11d/lit'
import { NavigationGroup, type INavigation } from './INavigation.js'


@component('mo-navigation-item')
export class NavigationItem extends Component {
	@property({ type: Object }) navigation!: INavigation
	@property({ type: Boolean }) open = false

	override tabIndex = 0

	static override get styles() {
		return css`
			:host {
				position: relative;
				display: inline-block;
				border-radius: var(--mo-border-radius);
				padding: 0 0.5rem;
				color: var(--mo-color-on-accent);
				cursor: pointer;
				white-space: nowrap;
				outline: none;
				anchor-name: --mo-navigation-item;
			}

			:host([data-router-selected]) {
				background-color: color-mix(in srgb, var(--mo-color-background), transparent 88%);
			}

			:host(:hover) {
				background-color: color-mix(in srgb, var(--mo-color-background), transparent 88%);
			}

			span {
				line-height: 2rem;
				font-weight: 500;
				font-size: medium;
			}

			mo-menu {
				color: var(--mo-color-foreground);
				position-anchor: --mo-navigation-item;
			}

			mo-focus-ring {
				--mo-focus-ring-color: var(--mo-color-on-accent);
			}

			mo-navigation-menu-item {
				font-size: 14px;
				min-width: 200px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-focus-ring .control=${this} inward></mo-focus-ring>
			<mo-flex id='button' direction='horizontal' alignItems='center' justifyContent='center' gap='2px'>
				${this.navigation.getItemContentTemplate(this.open)}
			</mo-flex>
			<mo-menu target='button' .anchor=${this} ?open=${bind(this, 'open')}>
				${!(this.navigation instanceof NavigationGroup) ? html.nothing : repeat(
					this.navigation.children,
					c => c,
					child => child.getMenuItemTemplate({ navigationInvocationHandler: () => this.open = false })
				)}
			</mo-menu>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-item': NavigationItem
	}
}