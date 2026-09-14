import { bind, Component, component, css, event, html, ifDefined, property, repeat, type HTMLTemplateResult } from '@a11d/lit'
import { visibleNavigations, type INavigation } from './INavigation.js'
import '@3mo/menu'

/**
 * A navigation of a navigation bar: a destination, or a group opening its destinations as a dropdown.
 *
 * @element mo-navigation-bar-item
 *
 * @attr navigation - The navigation this item stands for.
 * @attr open - Whether the group's dropdown is open.
 * @attr data-current - Whether this navigation, or one nested in it, is the page being shown.
 * @fires invoke - Dispatched with the destination which was invoked.
 */
@component('mo-navigation-bar-item')
export class NavigationBarItem extends Component {
	@event({ bubbles: true, composed: true }) readonly invoke!: EventDispatcher<INavigation>

	@property({ type: Object }) navigation!: INavigation
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: Boolean, reflect: true, attribute: 'data-current' }) current = false
	override tabIndex = 0

	private get childNavigations() {
		return visibleNavigations(this.navigation?.children)
	}

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
			}

			:host([data-router-selected]), :host([data-current]), :host(:hover) {
				background-color: color-mix(in srgb, var(--mo-color-background), transparent 88%);
			}

			span {
				line-height: 2rem;
				font-weight: 500;
				font-size: medium;
			}

			mo-menu {
				color: var(--mo-color-foreground);
			}

			mo-focus-ring {
				--mo-focus-ring-color: var(--mo-color-on-accent);
			}

			mo-navigation-menu-item, mo-nested-menu-item {
				font-size: 14px;
				min-width: 200px;
				&[aria-current] {
					background-color: var(--mo-color-selected);
					color: var(--mo-color-on-selected);
				}
			}
		`
	}

	protected override get template() {
		return html`
			<mo-focus-ring .control=${this} inward></mo-focus-ring>
			<mo-flex id='button' direction='horizontal' alignItems='center' justifyContent='center' gap='2px'>
				<span>${this.navigation?.label}</span>
				${!this.childNavigations.length ? html.nothing : html`
					<mo-icon icon=${this.open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} style='font-size: large'></mo-icon>
				`}
			</mo-flex>
			${!this.childNavigations.length ? html.nothing : html`
				<mo-menu target='button' .anchor=${this} ?open=${bind(this, 'open')}>
					${repeat(this.childNavigations, child => child, child => this.menuItemTemplate(child))}
				</mo-menu>
			`}
		`
	}

	private menuItemTemplate(navigation: INavigation, slot?: string): HTMLTemplateResult {
		const children = visibleNavigations(navigation.children)
		return html`
			${navigation.hasSeparator !== true ? html.nothing : html`<mo-line slot=${ifDefined(slot)}></mo-line>`}
			${children.length === 0 ? html`
				<mo-navigation-menu-item slot=${ifDefined(slot)}
					aria-current=${ifDefined(navigation.current === true ? 'page' : undefined)}
					${navigation.link?.({ invocationHandler: () => { this.open = false; this.invoke.dispatch(navigation) } }) ?? html.nothing}
				>${navigation.label}</mo-navigation-menu-item>
			` : html`
				<mo-nested-menu-item slot=${ifDefined(slot)}
					aria-current=${ifDefined(navigation.current === true ? 'page' : undefined)}
				>
					${navigation.label}
					${repeat(children, child => child, child => this.menuItemTemplate(child, 'submenu'))}
				</mo-nested-menu-item>
			`}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-bar-item': NavigationBarItem
	}
}