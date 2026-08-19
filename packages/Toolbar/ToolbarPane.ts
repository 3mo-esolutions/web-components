import { Component, component, css, html } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'

/**
 * @element mo-toolbar-pane
 *
 * A single-line container which lays its items out along the inline axis and clips those which do
 * not fit - the measurable pane of a @see ToolbarController. Spacing between items shall be provided
 * via `gap`, as the controller's measurements do not account for margins.
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