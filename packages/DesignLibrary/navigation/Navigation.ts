import { Component, bind, component, css, eventListener, html, ifDefined, property, query, queryAll, repeat, style, type HTMLTemplateResult } from '@a11d/lit'
import { Key, RouteMatchMode, routerLink, type PageComponent } from '@a11d/lit-application'
import { observeResize } from '@3mo/resize-observer'
import { observeMutation } from '@3mo/mutation-observer'
import { getNavigationLabel, type NavigationDefinition } from './NavigationItem.js'

/**
 * @attr navigations - The navigations to display in the navigation-bar and the drawer.
 *
 * @slot navbar-heading - The heading of the navigation-bar.
 * @slot navbar-end - The content to display at the end of the navigation-bar.
 * @slot drawer-heading - The heading of the drawer.
 */
@component('mo-navigation')
export class Navigation extends Component {
	@property({ type: Array }) navigations = new Array<NavigationDefinition>()

	@property({
		type: Boolean,
		updated(this: Navigation) {
			if (this.drawerOpen) {
				this.drawerNavigationList?.focus()
			} else {
				this.menuButton?.focus()
			}
		}
	}) drawerOpen = false
	@property({ type: Boolean, reflect: true }) mobileNavigation = false

	@query('mo-drawer mo-list') private readonly drawerNavigationList?: HTMLElement
	@query('#navbar-navigations') private readonly navigationsContainer!: HTMLElement
	@queryAll('#navbar-navigations mo-navigation-item') readonly navigationItems!: Array<HTMLElement>
	@query('mo-icon-button[icon=menu]') readonly menuButton?: HTMLElement

	@eventListener({ target: window, type: 'keydown' })
	protected handleKeyPress(event: KeyboardEvent) {
		if (event.key === Key.Alt && event.composedPath().filter(e => e instanceof Element).every(e => e.tagName.toLowerCase() !== 'input')) {
			event.preventDefault()
			const toFocus = this.mobileNavigation ? this.menuButton : this.navigationItems[0]
			toFocus?.focus()
		}
	}

	override role = 'navigation'

	static override get styles() {
		return css`
			mo-drawer {
				--mdc-drawer-width: 292px;
			}

			:host([mobileNavigation]) #navbar-navigations {
				visibility: hidden;
			}

			:host(:not([mobileNavigation])) mo-icon-button[icon=menu] {
				display: none;
			}

			#navbar {
				background: var(--mo-color-accent);
				padding-inline-start: 4px;
				height: 48px;
				overflow: hidden;
			}

			#navbar mo-flex:first-of-type {
				color: var(--mo-color-on-accent);
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			mo-icon-button[icon=menu] {
				font-size: 20px;
			}

			mo-application-logo {
				height: 30px;
				margin: 0 0 0 0.875rem;
			}

			slot[name=heading] span {
				margin: 2px 0 0 8px;
				font-size: 23px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			mo-collapsible-list-item:has(mo-navigation-list-item[slot=details][data-router-selected])::part(summary) {
				color: color-mix(in srgb, var(--mo-color-accent), var(--mo-color-foreground) 25%);
			}

			mo-navigation-list-item[slot=details], mo-collapsible-list-item[slot=details] > mo-list-item {
				padding-inline-start: 56px;
				height: 40px;
				font-size: 0.875rem;
			}
		`
	}

	protected override get template() {
		return html`
			${this.drawerTemplate}
			${this.navbarTemplate}
		`
	}

	private get navbarTemplate() {
		return html`
			<mo-flex id='navbar' direction='horizontal' gap='32px'>
				<mo-flex direction='horizontal' alignItems='center'>
					<mo-icon-button icon='menu' @click=${() => this.drawerOpen = !this.drawerOpen}></mo-icon-button>
					<mo-application-logo></mo-application-logo>
					<slot name='navbar-heading'>${manifest?.short_name}</slot>
				</mo-flex>

				<mo-flex id='navbar-navigations' direction='horizontal' alignItems='center' gap='8px'
					${style({ flex: '1', overflow: 'hidden', opacity: '0' })}
					${observeResize(() => this.checkNavigationOverflow())}
					${observeMutation(() => this.checkNavigationOverflow())}
				>
					${repeat(this.navigations, n => n, navigation => this.getNavigationItemTemplate(navigation))}
				</mo-flex>

				<mo-flex direction='horizontal' alignItems='center' gap='8px'>
					<slot name='navbar-end'></slot>
				</mo-flex>
			</mo-flex>
		`
	}

	private async checkNavigationOverflow() {
		// As the items render using a "repeat" directive, they are not immediately available in the DOM sometimes.
		await new Promise(resolve => setTimeout(resolve))

		const lastNavigationItem = this.navigationsContainer.style.flexDirection === 'row-reverse'
			? this.navigationsContainer.firstElementChild
			: this.navigationsContainer.lastElementChild

		const firstNavigationItem = this.navigationsContainer.style.flexDirection === 'row-reverse'
			? this.navigationsContainer.lastElementChild
			: this.navigationsContainer.firstElementChild

		const scrollWidth = (lastNavigationItem?.getBoundingClientRect().right ?? 0) - (firstNavigationItem?.getBoundingClientRect().left ?? 0)
		this.mobileNavigation = this.navigationsContainer.clientWidth < scrollWidth

		this.navigationsContainer.style.opacity = '1'
	}

	private getNavigationItemTemplate(navigation: NavigationDefinition) {
		return navigation.hidden ? html.nothing : html`
			<mo-navigation-item .navigation=${navigation}
				${!navigation.component ? html.nothing : routerLink({
					...navigation,
					invocationHandler: () => {
						this.drawerOpen = false
						navigation.invocationHandler?.()
					}
				})}
			>${getNavigationLabel(navigation)}</mo-navigation-item>
		`
	}

	private get drawerTemplate() {
		return html`
			<mo-drawer ?open=${bind(this, 'drawerOpen')}>
				<mo-flex ${style({ height: '100%' })}>
					<mo-flex direction='horizontal' alignItems='center' style='padding: 24px'>
						<slot name='drawer-heading'>${manifest?.short_name}</slot>
					</mo-flex>
					<mo-list ${style({ flex: '1' })}>
						${this.navigations.map(navigation => this.getNavigationListItemTemplate(navigation))}
					</mo-list>
				</mo-flex>
			</mo-drawer>
		`
	}

	private getNavigationListItemTemplate(navigation: NavigationDefinition, detailsSlot = false): HTMLTemplateResult {
		if (navigation.hidden) {
			return html.nothing
		}

		const iconTemplate = !navigation.icon ? html.nothing : html`
			<mo-icon icon=${navigation.icon} style='opacity: 0.75; font-size: 24px'></mo-icon>
		`

		const contentTemplate = html`
			${iconTemplate}
			${getNavigationLabel(navigation)}
		`

		const separatorTemplate = !navigation.hasSeparator ? html.nothing : html`<mo-line slot=${ifDefined(detailsSlot ? 'details' : undefined)}></mo-line>`

		if (navigation.children?.length) {
			return html`
				${separatorTemplate}
				<mo-collapsible-list-item slot=${ifDefined(detailsSlot ? 'details' : undefined)}>
					<mo-list-item>
						${contentTemplate}
					</mo-list-item>
					${navigation.children?.map(child => this.getNavigationListItemTemplate(child, true))}
				</mo-collapsible-list-item>
			`
		}

		return html`
			${separatorTemplate}
			<mo-navigation-list-item
				slot=${ifDefined(detailsSlot ? 'details' : undefined)}
				${!navigation.component ? html.nothing : routerLink({ component: navigation.component as PageComponent, matchMode: RouteMatchMode.IgnoreParameters, invocationHandler: () => this.drawerOpen = false })}
			>
				${contentTemplate}
			</mo-navigation-list-item>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation': Navigation
	}
}