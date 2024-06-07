import { bind, Component, component, css, html, property, repeat, style, type TemplateResult } from '@a11d/lit'
import { type PageComponent, routerLink, type DialogComponent, type RouteMatchMode } from '@a11d/lit-application'
import type { MaterialIcon } from '@3mo/icon'

export type NavigationDefinition = {
	key?: string
	label: string | TemplateResult
	icon?: MaterialIcon
	hidden?: boolean
	openInNewPage?: boolean
	component?: PageComponent<any> | DialogComponent<any, any>
	matchMode?: RouteMatchMode
	children?: Array<NavigationDefinition>
	/** If true, a separator will be rendered before this item. */
	hasSeparator?: boolean
}

@component('mo-navigation-item')
export class NavigationItem extends Component {
	@property({ type: Object }) navigation!: NavigationDefinition
	@property({ type: Boolean }) open = false

	override tabIndex = 0

	private get menuContentTemplate() {
		const getItemTemplate = (navigation: NavigationDefinition): TemplateResult => navigation.hidden ? html.nothing : html`
			${!navigation.hasSeparator ? html.nothing : html`<mo-line></mo-line>`}

			${!navigation.children ? html`
				<mo-navigation-menu-item ${!navigation.component ? html.nothing : routerLink({
					component: navigation.component as PageComponent,
					matchMode: navigation.matchMode,
					invocationHandler: () => this.open = false,
				})}>
					${navigation.label} ${navigation.openInNewPage ? '...' : ''}
				</mo-navigation-menu-item>
			` : html`
				<mo-nested-menu-item>
					${navigation.label}
					<mo-menu slot='submenu'>
						${repeat(navigation.children, c => c.key ?? c, child => getItemTemplate(child))}
					</mo-menu>
				</mo-nested-menu-item>
			`}
		`

		return !this.navigation.children || this.navigation.hidden ? html.nothing : html`
			${repeat(this.navigation.children, c => c.key ?? c, child => getItemTemplate(child))}
		`
	}

	static override get styles() {
		return css`
			:host {
				position: relative;
				display: inline-block;
				border-radius: var(--mo-border-radius);
				padding: 0 var(--mo-thickness-l);
				color: var(--mo-color-on-accent);
				cursor: pointer;
				white-space: nowrap;
				outline: none;
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
				letter-spacing: 0.0125em;
				font-size: medium;
			}

			mo-menu {
				color: var(--mo-color-foreground);
			}

			mo-focus-ring {
				--mo-focus-ring-color: var(--mo-color-on-accent);
			}

			mo-navigation-menu-item {
				font-size: 14px;
				height: 40px;
				min-width: 200px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-focus-ring .control=${this} inward></mo-focus-ring>
			<mo-flex id='button' direction='horizontal' alignItems='center' justifyContent='center' gap='2px'>
				<span>${this.navigation.label}</span>
				${!this.navigation.children ? html.nothing : html`
					<mo-icon icon=${this.open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} ${style({ fontSize: 'large' })}></mo-icon>
				`}
			</mo-flex>
			<mo-menu fixed target='button' .anchor=${this} ?open=${bind(this, 'open')}>
				${this.menuContentTemplate}
			</mo-menu>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-item': NavigationItem
	}
}