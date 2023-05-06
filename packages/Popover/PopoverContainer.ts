import { Component, component, css, html, property } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { PopoverPlacement, Popover, PopoverAlignment } from '@3mo/popover'

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
	@property({ reflect: true }) placement?: PopoverPlacement
	@property({ reflect: true }) alignment?: PopoverAlignment

	protected readonly slotController = new SlotController(this, () => {
		this.slotController.getAssignedElements('popover')
			.forEach(x => {
				const popover = x as Popover
				popover.fixed = false
				popover.anchor = this
			})
	})

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
				position: relative;
			}

			/* TODO [Popover] Move both placement and alignment logic to popover */
			:host([placement=blockStart]) { flex-flow: column-reverse; }
			:host([placement=blockEnd]) { flex-flow: column; }
			:host([placement=inlineStart]) { flex-flow: row-reverse; }
			:host([placement=inlineEnd]) { flex-flow: row; }

			:host([alignment=start]) { align-items: flex-start; }
			:host([alignment=center]) { align-items: center; }
			:host([alignment=end]) { align-items: flex-end; }

			:host([alignment=start]) ::slotted([slot=popover]) { transform: translateX(0%); }
			:host([alignment=center]) ::slotted([slot=popover]) { transform: translateX(-50%); }
			:host([alignment=end]) ::slotted([slot=popover]) { transform: translateX(-100%); }
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