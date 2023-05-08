import { Component, component, css, html, property } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { type Popover, PopoverAlignment, PopoverPlacement } from './index.js'

/**
 * @element mo-popover-container
 *
 * @attr alignment
 * @attr placement
 *
 * @slot - The content to be anchored
 * @slot popover - The popover to be anchored
 */
@component('mo-popover-container')
export class PopoverContainer extends Component {
	@property({ reflect: true, updated(this: PopoverContainer) { this.assignSlottedPopovers() } }) placement = PopoverPlacement.BlockEnd
	@property({ reflect: true, updated(this: PopoverContainer) { this.assignSlottedPopovers() } }) alignment = PopoverAlignment.Start

	protected readonly slotController = new SlotController(this, this.assignSlottedPopovers.bind(this))

	assignSlottedPopovers() {
		this.slotController.getAssignedElements('popover')
			.forEach(x => {
				const popover = x as Popover
				popover.fixed = false
				popover.anchor = this
				popover.placement = this.placement
				popover.alignment = this.alignment
			})
	}

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
				position: relative;
			}

			:host([placement=block-start]) { flex-flow: column-reverse; }
			:host([placement=block-end]) { flex-flow: column; }
			:host([placement=inline-start]) { flex-flow: row-reverse; }
			:host([placement=inline-end]) { flex-flow: row; }

			:host([alignment=start]) { align-items: flex-start; }
			:host([alignment=center]) { align-items: center; }
			:host([alignment=end]) { align-items: flex-end; }
		`
	}

	protected override get template() {
		return html`
			<slot></slot>
			<slot name='popover'></slot>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-popover-container': PopoverContainer
	}
}