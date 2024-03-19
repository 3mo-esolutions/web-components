import { component, eventListener, queryConnectedInstances } from '@a11d/lit'
import { Menu } from '@3mo/menu'
import { shift } from '@floating-ui/core'
import { ContextMenuLazyInitializer } from './ContextMenuLazyInitializer.js'

/** @element mo-context-menu */
@component('mo-context-menu')
export class ContextMenu extends Menu {
	@queryConnectedInstances() private static readonly container: ReadonlySet<ContextMenu> = new Set<ContextMenu>()

	static get openInstance() {
		return [...ContextMenu.container].find(menu => menu.open)
	}

	static open(...[openWithParameter, initializeParameter]: [...Parameters<typeof ContextMenu.prototype.openWith>, Parameters<typeof ContextMenuLazyInitializer.initialize>[1]]) {
		const contextMenu = new ContextMenu()
		ContextMenuLazyInitializer.initialize(contextMenu, initializeParameter)
		contextMenu.openWith(openWithParameter)
		return contextMenu
	}

	protected override initialized(): void {
		super.initialized()
		this.positionMiddleware = [shift({
			crossAxis: true,
			padding: 4,
		})]
	}

	override readonly manual = true
	override readonly fixed = true

	@eventListener({ target: document, type: 'click' })
	protected handleClick(e: PointerEvent) {
		if (this.open && e.composedPath().includes(this) === false) {
			e.stopPropagation()
			this.setOpen(false)
		}
	}

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
		if (this.open) {
			this.updateComplete.then(() => this.items[0]?.focus())
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-context-menu': ContextMenu
	}
}