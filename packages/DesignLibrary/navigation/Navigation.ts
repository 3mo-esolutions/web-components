import { Component, bind, component, css, eventListener, html, property, type PropertyValues, query, queryAll, repeat, style } from '@a11d/lit'
import { Key } from '@a11d/lit-application'
import { OverflowController } from '@3mo/overflow-controller'
import { TreeItem, type Tree } from '@3mo/tree'
import { type INavigation } from './INavigation.js'
import './NavigationTreeItem.js'

/**
 * @attr navigations - The navigations to display in the navigation-bar and the drawer.
 *
 * @slot navbar-heading - The heading of the navigation-bar.
 * @slot navbar-end - The content to display at the end of the navigation-bar.
 * @slot drawer-heading - The heading of the drawer.
 */
@component('mo-navigation')
export class Navigation extends Component {
	@property({ type: Array }) navigations = new Array<INavigation>()

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

	@query('mo-drawer mo-tree') private readonly drawerNavigationList?: Tree
	@query('#navbar-navigations') private readonly navigationsContainer?: HTMLElement
	@queryAll('#navbar-navigations mo-navigation-item') readonly navigationItems!: Array<HTMLElement>
	@query('mo-icon-button[icon=menu]') readonly menuButton?: HTMLElement

	/**
	 * The navigation-bar collapses as a whole rather than item by item, so only the controller's
	 * verdict on whether *anything* overflows is of interest - which items do is left unapplied.
	 */
	private readonly overflowController = new OverflowController(this, host => ({
		get container() { return host.navigationsContainer },
		get items() { return host.navigationItems },
		// A bar which has not been laid out yet would report all of its items as overflowing,
		// collapsing the navigation into the hamburger until the first resize corrects it.
		get disabled() { return !host.navigationsContainer?.clientWidth },
	}))

	@eventListener({ target: window, type: 'keydown' })
	protected handleKeyPress(event: KeyboardEvent) {
		if (event.key === Key.Alt && event.composedPath().filter(e => e instanceof Element).every(e => e.tagName.toLowerCase() !== 'input')) {
			event.preventDefault()
			const toFocus = this.mobileNavigation ? this.menuButton : this.navigationItems[0]
			toFocus?.focus()
		}
	}

	override role = 'navigation'

	protected override update(props: PropertyValues<this>) {
		this.mobileNavigation = this.overflowController.hasOverflow
		super.update(props)
	}

	static override get styles() {
		return css`
			mo-drawer {
				--mo-drawer-width: 292px;
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

			mo-tree {
				padding-block: 8px;
			}

			/* The section a page sits in reads as current too, which is what a group of rows is for. */
			mo-navigation-tree-item:has([data-router-selected])::part(row) {
				color: var(--mo-color-accent);
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

				<mo-flex id='navbar-navigations' direction='horizontal' alignItems='center' gap='8px' ${style({ flex: '1', overflow: 'hidden' })}>
					${repeat(this.navigations, n => n, navigation => navigation.getItemTemplate({ navigationInvocationHandler: () => this.drawerOpen = false }))}
				</mo-flex>

				<mo-flex direction='horizontal' alignItems='center' gap='8px'>
					<slot name='navbar-end'></slot>
				</mo-flex>
			</mo-flex>
		`
	}

	private get drawerTemplate() {
		return html`
			<mo-drawer ?open=${bind(this, 'drawerOpen')}>
				<mo-flex ${style({ height: '100%' })}>
					<mo-flex direction='horizontal' alignItems='center' style='padding: 24px'>
						<slot name='drawer-heading'>${manifest?.short_name}</slot>
					</mo-flex>
					<mo-tree ${style({ flex: '1' })} @navigationSelected=${this.handleNavigationSelected}>
						${repeat(this.navigations, n => n, navigation => navigation.getTreeItemTemplate({ navigationInvocationHandler: () => this.drawerOpen = false }))}
					</mo-tree>
				</mo-flex>
			</mo-drawer>
		`
	}

	/** The router marked a row as the current page: its ancestors open so that it can be seen. */
	private readonly handleNavigationSelected = (event: Event) => {
		if (event.target instanceof TreeItem) {
			(event.currentTarget as Tree).reveal(event.target)
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation': Navigation
	}
}