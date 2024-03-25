import { bind, Component, component, html, property, repeat, style, TemplateResult } from '@a11d/lit'
import { PageComponent, routerLink } from '@a11d/lit-application'
import { Navigation } from './Navigation.js'

@component('mo-navigation-item')
export class NavigationItem extends Component {
	@property({ type: Object }) navigation!: Navigation
	@property({ type: Boolean }) open = false

	override tabIndex = 0

	private get menuContentTemplate() {
		const getItemTemplate = (navigation: Navigation): TemplateResult => navigation.hidden ? html.nothing : !navigation.children ? html`
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
				<mo-context-menu slot='submenu'>
					${repeat(navigation.children, c => c.key ?? c, child => getItemTemplate(child))}
				</mo-context-menu>
			</mo-nested-menu-item>
		`

		return !this.navigation.children || this.navigation.hidden ? html.nothing : html`
			${repeat(this.navigation.children, c => c.key ?? c, child => getItemTemplate(child))}
		`
	}

	protected override get template() {
		return html`
			<style>
				:host {
					position: relative;
					display: inline-block;
					border-radius: var(--mo-border-radius);
					padding: 0 var(--mo-thickness-l);
					color: var(--mo-color-on-accent);
					cursor: pointer;
					white-space: nowrap;
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
			</style>
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