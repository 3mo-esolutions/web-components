import { EventListenerController, component, event, html, property } from '@a11d/lit'
import { ListItem } from '@3mo/list'
import { MaterialIcon } from '@3mo/icon'

/**
 * @element mo-menu-item
 * @attr icon
 */
@component('mo-menu-item')
export class MenuItem extends ListItem {
	@event({ bubbles: true, composed: true }) readonly menuItemClick!: EventDispatcher

	@property({ reflect: true }) icon?: MaterialIcon

	override readonly role = 'menuitem'

	protected override get template() {
		return html`
			${this.iconTemplate}
			${super.template}
		`
	}

	protected get iconTemplate() {
		return !this.icon ? html.nothing : html`
			<mo-icon style='opacity: 0.66' icon=${this.icon}></mo-icon>
		`
	}

	protected readonly clickEventListenerController = new EventListenerController(this, 'click', this.handleClick.bind(this))

	protected handleClick() {
		this.menuItemClick.dispatch()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu-item': MenuItem
	}
}