import { Component, component, css, html } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'

/**
 * The single-line pane a `ToolbarController` measures, clipping the items that do not fit.
 *
 * Space its items with `gap`, as the measurements do not count margins.
 *
 * @element mo-toolbar-pane
 *
 * @slot - The toolbar items
 */
@component('mo-toolbar-pane')
export class ToolbarPane extends Component {
	readonly slotController = new SlotController(this)

	get items() { return this.slotController.getAssignedElements('') }

	static override get styles() {
		return css`
			:host {
				display: flex;
				flex: 1 1 0;
				width: 0;
				align-items: center;
				overflow: clip;
			}

			:host(:focus) {
				outline: none;
			}

			::slotted(*) {
				flex: 0 0 0%;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-toolbar-pane': ToolbarPane
	}
}