import { Component, component, css, event, eventListener, html, property, repeat, type PropertyValues } from '@a11d/lit'
import { OverflowController } from '@3mo/overflow-controller'
import { visibleNavigations, type INavigation } from './INavigation.js'
import './NavigationBarItem.js'

/**
 * The navigations as a horizontal row, each group opening its destinations as a dropdown.
 *
 * It reports through `hasOverflow` whether its navigations still fit, which is what an orchestrating
 * `mo-navigation` decides by whether the bar is the presentation it can afford. The verdict is measured a
 * frame after the layout that changed it, so it is announced rather than left to be read: whoever decides
 * by it would otherwise read the previous one and never be told that it has moved on.
 *
 * @element mo-navigation-bar
 *
 * @attr navigations - The navigations to present.
 * @fires invoke - Dispatched with the navigation which was invoked.
 * @fires overflowChange - Dispatched with the new verdict whenever whether the navigations fit changes.
 */
@component('mo-navigation-bar')
export class NavigationBar extends Component {
	@event({ bubbles: true, composed: true }) readonly invoke!: EventDispatcher<INavigation>
	@event({ bubbles: true, composed: true }) readonly overflowChange!: EventDispatcher<boolean>

	@property({ type: Array }) navigations = new Array<INavigation>()

	override readonly role = 'navigation'

	private readonly overflowController: OverflowController<HTMLElementTagNameMap['mo-navigation-bar-item'], NavigationBar> = new OverflowController(this, host => ({
		get disabled() { return !host.overflowController.containerElement?.clientWidth },
	}))

	get items() {
		return this.overflowController.items
	}

	get hasOverflow() {
		return this.overflowController.hasOverflow
	}

	@eventListener({ target: window, type: 'popstate' })
	protected handleLocationChange() {
		this.requestUpdate()
	}

	private announcedOverflow?: boolean

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		if (this.hasOverflow !== this.announcedOverflow) {
			this.announcedOverflow = this.hasOverflow
			this.overflowChange.dispatch(this.hasOverflow)
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
				display: block;
				overflow: hidden;
			}

			#items {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 8px;
				overflow: hidden;
			}

			mo-navigation-bar-item {
				flex: 0 0 auto;
			}
		`
	}

	protected override get template() {
		return html`
			<div id='items' ${this.overflowController.container()}>
				${repeat(visibleNavigations(this.navigations), navigation => navigation, navigation => html`
					<mo-navigation-bar-item ${this.overflowController.item()}
						.navigation=${navigation}
						.current=${navigation.current === true}
						${navigation.link?.({ invocationHandler: () => this.invoke.dispatch(navigation) }) ?? html.nothing}
					></mo-navigation-bar-item>
				`)}
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-bar': NavigationBar
	}
}