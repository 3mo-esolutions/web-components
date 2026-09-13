import { Component, component, css, event, eventListener, html, property, repeat } from '@a11d/lit'
import { OverflowController } from '@3mo/overflow-controller'
import { visibleNavigations, type INavigation } from './INavigation.js'
import './NavigationBarItem.js'

/**
 * The navigations as a horizontal row, each group opening its destinations as a dropdown.
 *
 * It reports through `hasOverflow` whether its navigations still fit, which is what an orchestrating
 * `mo-navigation` decides by whether the bar is the presentation it can afford.
 *
 * @element mo-navigation-bar
 *
 * @attr navigations - The navigations to present.
 * @fires invoke - Dispatched with the navigation which was invoked.
 */
@component('mo-navigation-bar')
export class NavigationBar extends Component {
	@event({ bubbles: true, composed: true }) readonly invoke!: EventDispatcher<INavigation>

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