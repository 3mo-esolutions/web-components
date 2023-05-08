import { component, eventListener } from '@a11d/lit'
import { Menu } from '@3mo/menu'

/** @element mo-context-menu */
@component('mo-context-menu')
export class ContextMenu extends Menu {
	@eventListener({
		target: function (this: ContextMenu) { return this.anchor },
		type: 'contextmenu',
	})
	protected handleAnchorContextMenu(event: MouseEvent) {
		event.preventDefault()
		this.open = true
	}

}

declare global {
	interface HTMLElementTagNameMap {
		'mo-context-menu': ContextMenu
	}
}