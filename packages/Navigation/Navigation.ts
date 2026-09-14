import { bind, Component, component, css, eventListener, html, ifDefined, isServer, property, query, state, type HTMLTemplateResult, type PropertyValues } from '@a11d/lit'
import { type INavigation } from './INavigation.js'
import { type NavigationPresentation } from './NavigationPresentation.js'
import './NavigationBar.js'
import './NavigationRail.js'
import './NavigationDrawer.js'

/**
 * The application's shell: a header, the page beside or beneath it, and the navigations presented as
 * whichever of `bar`, `rail` and `drawer` fits.
 *
 * `presentations` is the order they are preferred in, and the first one which fits is the one shown —
 * the bar as long as its navigations fit its row, the rail as long as the page keeps
 * `--mo-navigation-min-content-size` beside it, and the drawer, which always fits. Demoting the bar is
 * therefore a matter of leaving it out of the order rather than of replacing the shell.
 *
 * @element mo-navigation
 *
 * @attr navigations - The navigations to present.
 * @attr presentations - The presentations to choose from, most preferred first. Defaults to `bar` then `drawer`.
 * @attr presentation - The presentation being shown. Derived, and reflected for styling.
 * @attr heading - The application's heading, shown in the header and above the drawer's navigations.
 * @attr drawerOpen - Whether the drawer is open. Only of consequence while the drawer is the presentation.
 *
 * @slot - The page.
 * @slot logo - Placed at the start of the header, and at the top of the rail.
 * @slot end - Placed at the end of the header.
 *
 * @csspart app-bar - The header above the page.
 * @csspart content - What the page is placed in.
 *
 * @cssprop --mo-navigation-min-content-size - How much room the page keeps beside the rail. Defaults to `32rem`, which puts the rail's threshold at Material's medium window.
 * @cssprop --mo-navigation-rail-size - How wide the rail's strip is. Defaults to `5.5rem`.
 * @cssprop --mo-navigation-rail-panel-size - How wide the rail's panel is. Defaults to `17rem`.
 *
 * @i18n "Navigation"
 */
@component('mo-navigation')
export class Navigation extends Component {
	@property({ type: Array }) navigations = new Array<INavigation>()
	@property({ type: Array }) presentations = new Array<NavigationPresentation>('bar', 'drawer')
	@property() heading?: string | HTMLTemplateResult
	@property({ reflect: true }) presentation: NavigationPresentation = 'bar'

	@property({ type: Boolean }) drawerOpen = false

	@state() private railDocked = false

	get navigationBar() { return this.renderRoot?.querySelector('mo-navigation-bar') ?? null }
	get navigationRail() { return this.renderRoot?.querySelector('mo-navigation-rail') ?? null }
	get menuButton() { return this.renderRoot?.querySelector<HTMLElement>('mo-icon-button[icon=menu]') ?? null }

	@query('#metrics-rail') private readonly railMetrics?: HTMLElement
	@query('#metrics-rail-docked') private readonly railDockedMetrics?: HTMLElement

	private readonly resizeObserver = isServer ? undefined : new ResizeObserver(() => this.requestUpdate())

	override connectedCallback() {
		super.connectedCallback()
		this.resizeObserver?.observe(this)
	}

	override disconnectedCallback() {
		this.resizeObserver?.disconnect()
		super.disconnectedCallback()
	}

	@eventListener({ target: window, type: 'keydown' })
	protected handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Alt' && event.composedPath().filter(e => e instanceof Element).every(e => e.tagName.toLowerCase() !== 'input')) {
			event.preventDefault()
			this.focus()
		}
	}

	override focus(options?: FocusOptions) {
		switch (this.presentation) {
			case 'bar':
				this.navigationBar?.focus(options)
				break
			case 'rail':
				this.navigationRail?.focus(options)
				break
			default:
				this.menuButton?.focus(options)
				break
		}
	}

	protected override update(props: PropertyValues<this>) {
		this.presentation = this.resolvePresentation()
		this.railDocked = this.hasRoomFor(this.railDockedMetrics) ?? false
		super.update(props)
	}

	/* The drawer writes its own state back, which can skip a property's update hook altogether. */
	private drawerWasOpen = false

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		if (this.drawerWasOpen && this.drawerOpen === false) {
			this.menuButton?.focus()
		}
		this.drawerWasOpen = this.drawerOpen
	}

	private resolvePresentation() {
		return this.presentations.find(presentation => this.fits(presentation))
			?? this.presentations[this.presentations.length - 1]
			?? 'drawer'
	}

	private fits(presentation: NavigationPresentation) {
		switch (presentation) {
			case 'bar':
				return this.navigationBar?.hasOverflow !== true
			case 'rail':
				return this.hasRoomFor(this.railMetrics) ?? true
			default:
				return true
		}
	}

	/**
	 * Whether the shell is at least as wide as the probe, which is what resolves the rail's sizes
	 * without the rail having to be there. Unknown until both have been laid out.
	 */
	private hasRoomFor(probe: HTMLElement | undefined) {
		const required = probe?.offsetWidth
		return !required || !this.clientWidth ? undefined : this.clientWidth >= required
	}

	static override get styles() {
		return css`
			:host {
				display: grid;
				grid-template-columns: auto minmax(0, 1fr);
				flex: 1;
				min-block-size: 0;
			}

			#metrics {
				position: absolute;
				visibility: hidden;
				pointer-events: none;
				inline-size: 0;
				block-size: 0;
				overflow: hidden;

				#metrics-rail {
					inline-size: calc(var(--mo-navigation-rail-size, 5.5rem) + var(--mo-navigation-min-content-size, 32rem));
				}

				#metrics-rail-docked {
					inline-size: calc(var(--mo-navigation-rail-size, 5.5rem) + var(--mo-navigation-rail-panel-size, 17rem) + var(--mo-navigation-min-content-size, 32rem));
				}
			}

			mo-navigation-rail {
				grid-column: 1;
			}

			#main {
				grid-column: 2;
				display: flex;
				flex-direction: column;
				min-inline-size: 0;
			}

			[part=app-bar] {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 32px;
				flex: 0 0 auto;
				block-size: 48px;
				padding-inline-start: 4px;
				background: var(--mo-color-accent);
				color: var(--mo-color-on-accent);
				overflow: hidden;
			}

			#brand {
				display: flex;
				flex-direction: row;
				align-items: center;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			slot[name=logo]::slotted(*) {
				block-size: 30px;
				margin-inline-start: 0.875rem;
			}

			#heading {
				margin: 2px 0 0 8px;
				font-size: 1.125rem;
				font-weight: 500;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			mo-navigation-bar {
				flex: 1;
				min-inline-size: 0;
				/* The bar keeps its place even while another presentation is shown, since only a bar which is
				   laid out can report that its navigations fit again. */
				&:not([data-presentation=bar]) {
					visibility: hidden;
				}
			}

			#end {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 8px;
				margin-inline-start: auto;
			}

			mo-icon-button[icon=menu] {
				font-size: 20px;
			}

			[part=content] {
				display: flex;
				flex-direction: column;
				flex: 1;
				min-block-size: 0;
			}
		`
	}

	protected override get template() {
		return html`
			<div id='metrics' aria-hidden='true'>
				<div id='metrics-rail'></div>
				<div id='metrics-rail-docked'></div>
			</div>

			${this.railTemplate}

			<div id='main'>
				<header part='app-bar'>
					<div id='brand'>
						${this.presentation !== 'drawer' ? html.nothing : html`
							<mo-icon-button icon='menu' aria-label=${t('Navigation')} @click=${() => this.drawerOpen = !this.drawerOpen}></mo-icon-button>
						`}
						${this.presentation === 'rail' ? html.nothing : html`<slot name='logo'></slot>`}
						<div id='heading'>${this.heading}</div>
					</div>

					${this.barTemplate}

					<div id='end'>
						<slot name='end'></slot>
					</div>
				</header>

				<div part='content'>
					<slot></slot>
				</div>
			</div>

			${this.drawerTemplate}
		`
	}

	private get barTemplate() {
		return !this.presentations.includes('bar') ? html.nothing : html`
			<mo-navigation-bar
				.navigations=${this.navigations}
				data-presentation=${this.presentation}
			></mo-navigation-bar>
		`
	}

	private get railTemplate() {
		return this.presentation !== 'rail' ? html.nothing : html`
			<mo-navigation-rail ?docked=${this.railDocked} .navigations=${this.navigations}>
				<slot name='logo' slot='header'></slot>
			</mo-navigation-rail>
		`
	}

	private get drawerTemplate() {
		return this.presentation !== 'drawer' ? html.nothing : html`
			<mo-navigation-drawer
				?open=${bind(this, 'drawerOpen')}
				heading=${ifDefined(this.heading)}
				.navigations=${this.navigations}
			></mo-navigation-drawer>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation': Navigation
	}
}