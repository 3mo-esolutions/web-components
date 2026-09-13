import { bind, Component, component, css, event, eventListener, html, property, style, type HTMLTemplateResult, type PropertyValues } from '@a11d/lit'
import '@3mo/drawer'
import { type INavigation } from './INavigation.js'
import './NavigationTree.js'

/**
 * Every navigation as a tree, in a modal drawer over the page.
 *
 * @element mo-navigation-drawer
 *
 * @attr navigations - The navigations to present.
 * @attr open - Whether the drawer is open.
 * @attr heading - Placed above the tree.
 *
 * @cssprop --mo-navigation-drawer-width - How wide the drawer is. Defaults to `292px`.
 *
 * @fires openChange - Dispatched with the new state whenever the drawer opens or closes.
 * @fires invoke - Dispatched with the destination which was invoked, on its way up from the tree.
 */
@component('mo-navigation-drawer')
export class NavigationDrawer extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>

	@property({ type: Array }) navigations = new Array<INavigation>()
	@property() heading?: string | HTMLTemplateResult

	@property({ type: Boolean, reflect: true, bindingDefault: true, event: 'openChange' }) open = false

	/* The drawer writes its own state back through the binding, which can skip a property's update hook altogether. */
	private dispatchedOpen = false

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		if (this.dispatchedOpen !== this.open) {
			this.dispatchedOpen = this.open
			this.openChange.dispatch(this.open)
		}
	}

	/** Reaching a destination is what the drawer was opened for. */
	@eventListener('invoke')
	protected handleInvoke() {
		this.open = false
	}

	private get treeElement() { return this.renderRoot?.querySelector('mo-navigation-tree') ?? null }

	override focus(options?: FocusOptions) {
		if (this.treeElement) {
			this.treeElement.focus(options)
		} else {
			super.focus(options)
		}
	}

	static override get styles() {
		return css`
			:host {
				display: contents;
			}

			mo-drawer {
				--mo-drawer-width: var(--mo-navigation-drawer-width, 292px);
			}
		`
	}

	protected override get template() {
		return html`
			<mo-drawer ?open=${bind(this, 'open')}>
				<mo-flex ${style({ height: '100%' })}>
					${!this.heading ? html.nothing : html`
						<mo-flex direction='horizontal' alignItems='center' ${style({ padding: '24px' })}>${this.heading}</mo-flex>
					`}
					<mo-navigation-tree autofocus ${style({ flex: '1' })} .navigations=${this.navigations}></mo-navigation-tree>
				</mo-flex>
			</mo-drawer>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-drawer': NavigationDrawer
	}
}