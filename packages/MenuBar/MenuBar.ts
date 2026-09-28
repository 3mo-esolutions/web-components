import { Component, component, css, event, html, type PropertyValues } from '@a11d/lit'
import { MenuBarController } from './MenuBarController.js'
import { MenuBarItem } from './MenuBarItem.js'

/**
 * The menus of an application along one bar, like File, Edit and View of a desktop program; navigation belongs in `mo-navigation`.
 *
 * Give it an accessible name with `aria-label` or `aria-labelledby`.
 *
 * @element mo-menu-bar
 *
 * @ssr true
 *
 * @slot - The items, which are `mo-menu-bar-item`s.
 *
 * @fires overflowChange - Dispatched when `hasOverflow` changes.
 *
 * @accessibility
 * A `menubar` whose items are `none`, with the button of each a `menuitem` and each item's menu a [menu](?path=/docs/behaviors-menu-controller--overview). The bar is one tab stop.
 *
 * | Key | Does |
 * | --- | --- |
 * | `ArrowRight` `ArrowLeft`, `Home` `End` | The next, previous, first or last item. |
 * | A letter | Typeahead by the items' labels. |
 * | `ArrowDown` `Enter` `Space` | Opens the item's menu on its first item; `ArrowUp` on its last. |
 * | `ArrowRight` `ArrowLeft` | While a menu is open: opens the neighbouring menu instead, as a pointer moving over the items does. |
 *
 * Items that do not fit the bar are hidden and skipped; the bar reports them with `overflowChange`, so offer them another way. Name the bar with `aria-label`.
 */
@component('mo-menu-bar')
export class MenuBar extends Component {
	@event() readonly overflowChange!: EventDispatcher<boolean>

	override role = 'menubar'

	readonly menuBarController: MenuBarController<MenuBarItem, MenuBar> = new MenuBarController<MenuBarItem, MenuBar>(this, host => ({
		get items() { return host.items },
	}))

	get items(): ReadonlyArray<MenuBarItem> {
		return [...this.children].filter((child): child is MenuBarItem => child instanceof MenuBarItem)
	}

	/** Whether some items do not fit. Those carry `data-overflowed` and are hidden. */
	get hasOverflow(): boolean { return this.menuBarController.hasOverflow }

	private announcedOverflow?: boolean

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		if (this.hasOverflow !== this.announcedOverflow) {
			this.announcedOverflow = this.hasOverflow
			this.overflowChange.dispatch(this.hasOverflow)
		}
	}

	static override get styles() {
		return css`
			:host {
				display: flex;
				align-items: center;
				gap: 0.125rem;
				overflow: hidden;
				font-size: 0.875rem;
			}

			::slotted(*) {
				flex: 0 0 auto;
			}

			::slotted([data-overflowed]) {
				display: none;
			}
		`
	}

	protected override get template() {
		return html`<slot @slotchange=${() => this.menuBarController.handleItemsChange()}></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu-bar': MenuBar
	}
}