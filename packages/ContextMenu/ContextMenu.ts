import { component, eventListener, queryConnectedInstances, type PropertyValues } from '@a11d/lit'
import { PopoverFloatingUiPositionController } from '@3mo/popover'
import { Menu } from '@3mo/menu'

/** @element mo-context-menu */
@component('mo-context-menu')
export class ContextMenu extends Menu {
	@queryConnectedInstances() private static readonly container: ReadonlySet<ContextMenu> = new Set<ContextMenu>()

	static get openInstance() {
		return [...ContextMenu.container].find(menu => menu.open)
	}

	close() {
		this.setOpen(false)
	}

	override readonly manual = true

	protected override firstUpdated(props: PropertyValues) {
		super.firstUpdated(props)
		this.updateComplete.then(async () => {
			const popover = this.renderRoot.querySelector('mo-popover')
			const { shift } = await import('@floating-ui/dom')
			if (popover?.positionController instanceof PopoverFloatingUiPositionController) {
				popover.positionController.addMiddleware(shift({ crossAxis: true, padding: 4 }))
			}
		})
	}

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