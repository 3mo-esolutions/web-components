import { Component, component, css, event, html, property } from '@a11d/lit'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverController } from './PopoverController.js'

/**
 * @element mo-popover
 *
 * @attr anchor - The anchor element for the popover.
 * @attr placement - The placement of the popover relative to the anchor.
 * @attr open - Whether the popover is open.
 * @attr openOnHover - Whether the popover should open on hover.
 * @attr openOnFocus - Whether the popover should open on focus.
 * @attr getLeftPositionOffset - A function that returns the left position offset of the popover.
 * @attr getTopPositionOffset - A function that returns the top position offset of the popover.
 *
 * @slot - Default slot for popover content
 *
 * @fires openChange - Fired when the popover is opened or closed.
 */
@component('mo-popover')
export class Popover extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>

	@property({ type: Object }) anchor!: HTMLElement
	@property({ reflect: true }) placement = PopoverPlacement.Bottom
	@property({ type: Boolean, reflect: true, updated(this: Popover) {
		this.popoverController.updatePosition()
	} }) open = false
	@property({ type: Boolean }) openOnHover?: boolean
	@property({ type: Boolean }) openOnFocus?: boolean
	@property({ type: Object }) getLeftPositionOffset?: (anchorRect: DOMRect, popoverRect: DOMRect) => number
	@property({ type: Object }) getTopPositionOffset?: (anchorRect: DOMRect, popoverRect: DOMRect) => number

	protected readonly popoverController = new PopoverController(this)

	setOpen(open: boolean) {
		this.open = open
		this.openChange.dispatch(open)
	}

	static override get styles() {
		return css`
			:host {
				position: fixed;
				box-shadow: var(--mo-shadow, 0 2px 4px rgba(0, 0, 0, 0.2));
				width: max-content;
				opacity: 0;
				z-index: 99;
			}

			:host(:not([open])) {
				pointer-events: none;
			}

			:host([open]) {
				opacity: 1;
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}