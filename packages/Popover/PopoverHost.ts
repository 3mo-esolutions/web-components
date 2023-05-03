import { Component, ReactiveElement, component, css, html, property } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'

export const enum PopoverHostedPlacement {
	BlockStart = 'blockStart',
	BlockEnd = 'blockEnd',
	InlineStart = 'inlineStart',
	InlineEnd = 'inlineEnd',
}

export const enum PopoverHostedAlignment {
	Start = 'start',
	Center = 'center',
	End = 'end',
}

/**
 * @element mo-popover-host
 *
 * @attr alignment
 * @attr placement
 *
 * @slot - The content to be anchored
 * @slot popover - The popover to be anchored
 */
@component('mo-popover-host')
export class PopoverHost extends Component {
	@property({ reflect: true }) placement = PopoverHostedPlacement.InlineEnd
	@property({ reflect: true }) alignment = PopoverHostedAlignment.Start

	protected readonly slotController = new SlotController(this, () => {
		this.slotController.getAssignedElements('popover')
			.forEach(x => {
				const popover = x as ReactiveElement & {
					anchor: HTMLElement
					managed: boolean
				}
				popover.anchor = this
				popover.managed = true
			})
	})

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
				position: relative;
			}

			:host([placement=blockStart]) { flex-flow: column-reverse; }
			:host([placement=blockEnd]) { flex-flow: column; }
			:host([placement=inlineStart]) { flex-flow: row-reverse; }
			:host([placement=inlineEnd]) { flex-flow: row; }

			:host([alignment=start]) { align-items: flex-start; }
			:host([alignment=center]) { align-items: center; }
			:host([alignment=end]) { align-items: flex-end; }

			/* FIX: Merge this API with the popover managed logic */
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
		'mo-popover-host': PopoverHost
	}
}