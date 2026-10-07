import { component, css } from '@a11d/lit'
import { Sheet, type SheetPlacement } from '@3mo/sheet'

/**
 * A navigation panel that comes in from the side: a sheet anchored to an inline edge.
 *
 * @element mo-drawer
 *
 * @attr open - Whether the drawer is open.
 * @attr placement - The edge the drawer is anchored to. Defaults to `inline-start`.
 * @attr label - The accessible name of the drawer.
 *
 * @slot - Content of the drawer.
 *
 * @cssprop --mo-drawer-width - The width of the drawer. Defaults to `256px`.
 *
 * @fires openChange - Dispatched with the new state whenever the drawer opens or closes.
 * @fires requestClose - Dispatched with the source before the drawer closes itself. Cancelable to keep it open.
 *
 * @accessibility
 * A native modal `dialog`, so the page behind it is inert. It is named by `label`, the element with `autofocus` inside takes focus as it opens, and `Escape` fires the cancelable `requestClose` and closes.
 */
@component('mo-drawer')
export class Drawer extends Sheet {
	override placement: SheetPlacement = 'inline-start'

	static override get styles() {
		return css`
			${super.styles}

			:host {
				/* "--mdc-drawer-width" sized the drawer while it was a Material one, and is read as a
				   fallback so that consumers which still set it are not left behind. */
				--mo-sheet-size: var(--mo-drawer-width, var(--mdc-drawer-width, 256px));
			}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-drawer': Drawer
	}
}
