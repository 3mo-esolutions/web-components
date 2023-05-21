import { Component, component, eventListener, html, nothing, property, style, TemplateResult } from '@a11d/lit'
import { Key, PageComponent, routerLink } from '@a11d/lit-application'
import { Navigation } from './Navigation.js'

@component('mo-navigation-item')
export class NavigationItem extends Component {
	@property({ type: Object }) navigation!: Navigation
	@property({ type: Boolean }) open = false

	override tabIndex = 0

	private get menuContentTemplate() {
		const getItemTemplate = (navigation: Navigation): TemplateResult => navigation.hidden ? nothing : !navigation.children ? html`
			<mo-navigation-list-item ${!navigation.component ? nothing : routerLink({
			component: navigation.component as PageComponent,
			matchMode: navigation.matchMode,
			invocationHandler: () => this.open = false
		})}>${navigation.label} ${navigation.openInNewPage ? '...' : ''}</mo-navigation-list-item>
		` : html`
			<mo-nested-menu-item>
				${navigation.label}
				<mo-context-menu activatable absolute slot='submenu'>
					${navigation.children.map(child => getItemTemplate(child))}
				</mo-context-menu>
			</mo-nested-menu-item>
		`

		return !this.navigation.children || this.navigation.hidden ? nothing : html`
			${this.navigation.children.map(child => getItemTemplate(child))}
		`
	}

	@eventListener('click')
	protected readonly clickHandler = () => this.open = true

	@eventListener('keydown')
	protected keyDownHandler(e: KeyboardEvent) {
		if (e.keyCode === 32) {
			this.open = !this.open
		} else if (e.key === Key.Enter) {
			this.open = true
		} else if (e.key === Key.Escape) {
			this.open = false
		}
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
					background-color: rgba(var(--mo-color-background-base), 0.12);
				}

				:host(:hover) {
					background-color: rgba(var(--mo-color-background-base), 0.12);
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
			<mo-flex direction='horizontal' alignItems='center' justifyContent='center' gap='2px'>
				<span>${this.navigation.label}</span>
				${!this.navigation.children ? nothing : html`
					<mo-icon icon=${this.open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} ${style({ fontSize: 'large' })}></mo-icon>
				`}
			</mo-flex>
			<mo-menu fixed .anchor=${this}>
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