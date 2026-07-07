import { component, css, eventListener, queryConnectedInstances, type PropertyValues } from '@a11d/lit'
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

	static override get styles() {
		return css`
			${super.styles}

			mo-popover {
				/* A context menu is opened at a point (often near a viewport edge) and can be taller
				 * than the viewport. Without these, such a menu overflows every "position-try" fallback
				 * and the browser falls back to the cramped base area, squishing the menu's width.
				 * "min-width: max-content" keeps it at its content width so a cramped area overflows and
				 * the inline flip is chosen; "max-height: 100%" + "overflow-y: auto" cap it to the
				 * resolved area's height and scroll instead of overflowing. */
				min-width: max-content;
				max-height: 100%;
				overflow-y: auto;
			}
		`
	}

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