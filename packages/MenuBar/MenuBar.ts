import { Component, component, css, event, html, type PropertyValues } from '@a11d/lit'
import { MenuBarController } from './MenuBarController.js'
import { MenuBarItem } from './MenuBarItem.js'

/**
 * The menus of an application along one bar, like File, Edit and View of a desktop program.
 * It is meant for commands; a site's navigation belongs in `mo-navigation`.
 *
 * Give it an accessible name with `aria-label` or `aria-labelledby`.
 *
 * ```html
 * <mo-menu-bar aria-label='Editor'>
 *     <mo-menu-bar-item>
 *         File
 *         <mo-menu slot='menu'>
 *             <mo-menu-item>New</mo-menu-item>
 *         </mo-menu>
 *     </mo-menu-bar-item>
 * </mo-menu-bar>
 * ```
 *
 * @element mo-menu-bar
 *
 * @ssr false
 *
 * @slot - The items, which are `mo-menu-bar-item`s.
 *
 * @fires overflowChange - Dispatched when `hasOverflow` changes.
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