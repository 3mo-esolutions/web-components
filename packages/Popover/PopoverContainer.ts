import { Component, component, css, html, property, unsafeCSS } from '@a11d/lit'
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

			:host([placement=block-start]) { flex-flow: column-reverse; }
			:host([placement=block-end]) { flex-flow: column; }
			:host([placement=inline-start]) { flex-flow: row-reverse; }
			:host([placement=inline-end]) { flex-flow: row; }

			:host([alignment=start]) { align-items: flex-start; }
			:host([alignment=center]) { align-items: center; }
			:host([alignment=end]) { align-items: flex-end; }

			:host([placement=block-start]) ::slotted([slot=popover]) {
				--mo-popover-translate-y: -100%;
			}
			:host([placement=inline-start]) ::slotted([slot=popover]) {
				--mo-popover-translate-x: -100%;
			}

			:host([placement=block-start][alignment=start]) ::slotted([slot=popover]),
			:host([placement=block-end][alignment=start]) ::slotted([slot=popover]) {
				--mo-popover-translate-x: 0%;
			}
			:host([placement=block-start][alignment=center]) ::slotted([slot=popover]),
			:host([placement=block-end][alignment=center]) ::slotted([slot=popover]) {
				--mo-popover-translate-x: -50%;
			}
			:host([placement=block-start][alignment=end]) ::slotted([slot=popover]),
			:host([placement=block-end][alignment=end]) ::slotted([slot=popover]) {
				--mo-popover-translate-x: -100%;
			}
			
			:host([placement=inline-start][alignment=start]) ::slotted([slot=popover]),
			:host([placement=inline-end][alignment=start]) ::slotted([slot=popover]) {
				--mo-popover-translate-y: 0%;
			}
			:host([placement=inline-start][alignment=center]) ::slotted([slot=popover]),
			:host([placement=inline-end][alignment=center]) ::slotted([slot=popover]) {
				--mo-popover-translate-y: -50%;
			}
			:host([placement=inline-start][alignment=end]) ::slotted([slot=popover]),
			:host([placement=inline-end][alignment=end]) ::slotted([slot=popover]) {
				--mo-popover-translate-y: -100%;
			}
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