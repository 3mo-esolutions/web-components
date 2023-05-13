import { component, eventListener } from '@a11d/lit'
import { queryConnectedInstances } from '@3mo/query-connected-instances'
import { Menu } from '@3mo/menu'
import { ContextMenuLazyInitializer } from './ContextMenuLazyInitializer.js'

/** @element mo-context-menu */
@component('mo-context-menu')
export class ContextMenu extends Menu {
	@queryConnectedInstances() private static readonly container = new Set<ContextMenu>()

	static get openInstance() {
		return [...ContextMenu.container].find(menu => menu.open)
	}

	static open(...[openWithParameter, initializeParameter]: [...Parameters<typeof ContextMenu.prototype.openWith>, Parameters<typeof ContextMenuLazyInitializer.initialize>[1]]) {
		const contextMenu = new ContextMenu()
		ContextMenuLazyInitializer.initialize(contextMenu, initializeParameter)
		contextMenu.openWith(openWithParameter)
		return contextMenu
	}

	override readonly manualOpen = true
	override readonly fixed = true

	@eventListener({ type: 'contextmenu', target(this: ContextMenu) { return this.anchor || [] } })
	protected handleAnchorContextMenu(event: PointerEvent) {
		event.preventDefault()
		this.openWith(event)
	}

	override openWith(...parameters: Parameters<Menu['openWith']>) {
		if (this.open) {
			this.setOpen(false)
		}
		for (const contextMenu of [...ContextMenu.container].filter(t => t !== this)) {
			contextMenu.setOpen(false)
		}
		super.openWith(...parameters)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-context-menu': ContextMenu
	}
}