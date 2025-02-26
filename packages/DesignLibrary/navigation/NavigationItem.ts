import { bind, Component, component, css, html, ifDefined, property, repeat, style, type TemplateResult } from '@a11d/lit'
import { routerLink, type Routable, NavigationStrategy } from '@a11d/lit-application'
import type { MaterialIcon } from '@3mo/icon'

type RouterLinkParameters = Exclude<Parameters<typeof routerLink>[0], Routable>

export type NavigationDefinition = {
	key?: string
	label: string | TemplateResult
	icon?: MaterialIcon
	hidden?: boolean
	hasSeparator?: boolean
} & (
	| RouterLinkParameters & { children?: never }
	| ({ [_ in keyof RouterLinkParameters]?: never } & { children: NavigationDefinition[] })
)

@component('mo-navigation-item')
export class NavigationItem extends Component {
	@property({ type: Object }) navigation!: NavigationDefinition
	@property({ type: Boolean }) open = false

	override tabIndex = 0

	private get menuContentTemplate() {
		const getItemTemplate = (navigation: NavigationDefinition, subMenu: boolean): TemplateResult => navigation.hidden ? html.nothing : html`
			${!navigation.hasSeparator ? html.nothing : html`<mo-line></mo-line>`}

			${!navigation.children ? html`
				<mo-navigation-menu-item slot=${ifDefined(subMenu ? 'submenu' : undefined)}
					${routerLink({ ...navigation, invocationHandler: () => {
						this.open = false
						navigation.invocationHandler?.()
					} })}
				>
					${navigation.label} ${(navigation.navigationStrategy ?? NavigationStrategy.Page) === NavigationStrategy.Page ? '' : '...'}
				</mo-navigation-menu-item>
			` : html`
				<mo-nested-menu-item slot=${ifDefined(subMenu ? 'submenu' : undefined)}>
					${navigation.label}
					${repeat(navigation.children, c => c.key ?? c, child => getItemTemplate(child, true))}
				</mo-nested-menu-item>
			`}
		`

		return !this.navigation.children || this.navigation.hidden ? html.nothing : html`
			${repeat(this.navigation.children, c => c.key ?? c, child => getItemTemplate(child, false))}
		`
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