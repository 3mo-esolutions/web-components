import { component, css } from '@a11d/lit'
import { ListItem } from '@3mo/list'

/**
 * @element mo-menu-item
 */
@component('mo-menu-item')
export class MenuItem extends ListItem {
	override readonly role = 'menuitem'

	static override get styles() {
		return css`
			${super.styles}

			:host {
				min-height: 2.25rem;
			}
		`
	}

	protected override get startSlotDefaultContent() {
		return this.iconTemplate
	}

	protected get iconTemplate() {
		return !this.icon ? html.nothing : html`
			<mo-icon part='icon' style='opacity: 0.66' icon=${this.icon}></mo-icon>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu-item': MenuItem
	}
}