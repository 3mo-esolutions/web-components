import { Component, component, html, property } from '@a11d/lit'
import { ToolbarController } from '@3mo/toolbar'

/** Two panes, the right one laid out right-to-left, whose overflowing items gather in one list toggled by the button between them. */
@component('story-split-toolbar')
export class SplitToolbar extends Component {
	@property({ type: Boolean, reflect: true }) open = false

	protected readonly leftToolbarController = new ToolbarController(this, {
		paneSlotName: 'left',
		overflowContentSlotName: 'left-overflow',
	})

	protected readonly rightToolbarController = new ToolbarController(this, {
		paneSlotName: 'right',
		overflowContentSlotName: 'right-overflow',
	})

	protected override get template() {
		return html`
			<div style='display: flex; width: 100%; gap: 5px'>
				<mo-toolbar-pane ${this.leftToolbarController.pane.ref()} style='flex: 1 1'>
					<slot name=${this.leftToolbarController.paneSlotName}></slot>
				</mo-toolbar-pane>
				<mo-button style='flex: 0 0 auto' @click=${() => this.open = !this.open}>More</mo-button>
				<mo-toolbar-pane ${this.rightToolbarController.pane.ref()} style='flex: 1 1; direction: rtl'>
					<slot name=${this.rightToolbarController.paneSlotName}></slot>
				</mo-toolbar-pane>
			</div>
			<mo-list style='max-width: 350px; margin: 10px auto; border-radius: var(--mo-border-radius); background: var(--mo-color-transparent-gray-1); display: ${this.open ? 'block' : 'none'}'>
				<slot name=${this.leftToolbarController.overflowContentSlotName}></slot>
				<slot name=${this.rightToolbarController.overflowContentSlotName}></slot>
			</mo-list>
		`
	}
}
