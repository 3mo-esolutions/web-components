import { Component, component, css, event, eventListener, html, property, repeat, state } from '@a11d/lit'
import { visibleNavigations, type INavigation } from './INavigation.js'
import './NavigationRailItem.js'
import './NavigationTree.js'

/**
 * The navigations as a vertical strip at the leading edge, each one an icon with its label beneath it.
 *
 * A group's destinations are shown in a panel beside the strip: docked next to the page while there is
 * room for both, and overlaid over the page while there is not.
 *
 * @element mo-navigation-rail
 *
 * @attr navigations - The navigations to present.
 * @attr docked - Whether the panel stands beside the page rather than over it.
 * @fires invoke - Dispatched with the destination which was invoked.
 *
 * @slot header - Placed above the navigations, e.g. a logo or a button which creates something.
 * @slot footer - Placed below the navigations.
 *
 * @csspart strip - The strip of navigations.
 * @csspart panel - The panel holding the destinations of the navigation being shown.
 *
 * @cssprop --mo-navigation-rail-size - How wide the strip is. Defaults to `5.5rem`.
 * @cssprop --mo-navigation-rail-panel-size - How wide the panel is. Defaults to `17rem`.
 */
@component('mo-navigation-rail')
export class NavigationRail extends Component {
	@event({ bubbles: true, composed: true }) readonly invoke!: EventDispatcher<INavigation>

	@property({ type: Array }) navigations = new Array<INavigation>()
	@property({ type: Boolean, reflect: true }) docked = false

	@state() private selection?: INavigation

	get items() {
		return [...this.renderRoot?.querySelectorAll('mo-navigation-rail-item') ?? []]
	}

	/** The navigation whose destinations the panel shows. */
	get shownNavigation() {
		const selection = this.selection && this.navigations.includes(this.selection) ? this.selection : undefined
		return selection ?? (this.docked ? this.currentNavigation : undefined)
	}

	private get currentNavigation() {
		return visibleNavigations(this.navigations).find(navigation => navigation.current === true && visibleNavigations(navigation.children).length > 0)
	}

	@eventListener({ target: window, type: 'popstate' })
	protected handleLocationChange() {
		this.requestUpdate()
	}

	/** A destination was reached, from the strip or from the panel, so the panel has done its job. */
	@eventListener('invoke')
	protected handleInvoke() {
		this.selection = undefined
	}

	@eventListener({ target: document, type: 'pointerdown' })
	protected handleDocumentPointerDown(event: PointerEvent) {
		if (!this.docked && this.selection && !event.composedPath().includes(this)) {
			this.selection = undefined
		}
	}

	@eventListener({ target: window, type: 'keydown' })
	protected handleKeyDown(event: KeyboardEvent) {
		if (!this.docked && this.selection && event.key === 'Escape') {
			const dismissed = this.selection
			this.selection = undefined
			this.items.find(item => item.navigation === dismissed)?.focus()
		}
	}

	override focus(options?: FocusOptions) {
		const item = this.items[0]
		if (item) {
			item.focus(options)
		} else {
			super.focus(options)
		}
	}

	static override get styles() {
		return css`
			:host {
				position: relative;
				z-index: 1;
				display: flex;
				flex-direction: row;
				background: var(--mo-color-surface);
			}

			[part=strip] {
				display: flex;
				flex-direction: column;
				inline-size: var(--mo-navigation-rail-size, 5.5rem);
				border-inline-end: 1px solid var(--mo-color-transparent-gray-3);
				overflow: hidden;
			}

			#items {
				display: flex;
				flex-direction: column;
				gap: 4px;
				padding: 8px 6px;
				flex: 1;
				overflow-y: auto;
				overflow-x: hidden;
				scrollbar-width: thin;
			}

			[part=panel] {
				display: flex;
				flex-direction: column;
				inline-size: var(--mo-navigation-rail-panel-size, 17rem);
				background: var(--mo-color-surface);
				border-inline-end: 1px solid var(--mo-color-transparent-gray-3);
				overflow: hidden;
			}

			/* Without room for both, the panel leaves the layout and stands over the page instead. */
			:host(:not([docked])) [part=panel] {
				position: absolute;
				inset-block: 0;
				inset-inline-start: 100%;
				box-shadow: var(--mo-shadow);
				translate: 0;
				opacity: 1;
				transition: translate var(--mo-duration-quick, 250ms) cubic-bezier(0.2, 0, 0, 1), opacity var(--mo-duration-quick, 250ms);

				/* An overlay is only ever inserted, so it comes in from the strip it belongs to and leaves at once. */
				@starting-style {
					translate: -1.5rem 0;
					opacity: 0;
				}
			}

			:host(:not([docked])) [part=panel]:dir(rtl) {
				@starting-style {
					translate: 1.5rem 0;
				}
			}

			#panel-heading {
				padding: 20px 20px 8px;
				font-size: 1.125rem;
				font-weight: 500;
			}

			mo-navigation-tree {
				flex: 1;
				overflow-y: auto;
				scrollbar-width: thin;
			}
		`
	}

	protected override get template() {
		return html`
			<nav part='strip' role='navigation'>
				<slot name='header'></slot>
				<div id='items'>
					${repeat(visibleNavigations(this.navigations), navigation => navigation, navigation => this.itemTemplate(navigation))}
				</div>
				<slot name='footer'></slot>
			</nav>
			${this.panelTemplate}
		`
	}

	private itemTemplate(navigation: INavigation) {
		return html`
			<mo-navigation-rail-item
				.navigation=${navigation}
				.current=${navigation.current === true}
				.selected=${navigation === this.shownNavigation}
				@click=${() => this.handleItemClick(navigation)}
				${navigation.link?.({ invocationHandler: () => this.invoke.dispatch(navigation) })}
			></mo-navigation-rail-item>
		`
	}

	private get panelTemplate() {
		const navigation = this.shownNavigation
		return !navigation ? html.nothing : html`
			<div part='panel'>
				<div id='panel-heading'>${navigation.label}</div>
				<mo-navigation-tree .navigations=${[...visibleNavigations(navigation.children)]}></mo-navigation-tree>
			</div>
		`
	}

	private handleItemClick(navigation: INavigation) {
		if (visibleNavigations(navigation.children).length === 0) {
			this.selection = undefined
			return
		}
		this.selection = this.shownNavigation === navigation && !this.docked ? undefined : navigation
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-rail': NavigationRail
	}
}