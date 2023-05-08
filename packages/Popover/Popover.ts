import { Component, component, css, event, html, property } from '@a11d/lit'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverController } from './PopoverController.js'
import { PopoverAlignment } from './PopoverAlignment.js'
import { PopoverCoordinates } from './PopoverCoordinates.js'

/**
 * @element mo-popover
 *
 * @attr fixed - Whether the popover is fixed.
 * @attr anchor - The anchor element for the popover.
 * @attr placement - The placement of the popover relative to the anchor.
 * @attr open - Whether the popover is open.
 * @attr openOnHover - Whether the popover should open on hover.
 * @attr openOnFocus - Whether the popover should open on focus.
 * @attr getLeftPositionOffset - A function that returns the left position offset of the popover.
 * @attr getTopPositionOffset - A function that returns the top position offset of the popover.
 * @attr coordinates - The coordinates of the popover.
 *
 * @slot - Default slot for popover content
 *
 * @fires openChange - Fired when the popover is opened or closed.
 */
@component('mo-popover')
export class Popover extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>

	@property({ type: Boolean, reflect: true }) fixed = false
	@property({ type: Array }) coordinates?: PopoverCoordinates
	@property({ type: Object }) anchor!: HTMLElement
	@property({ reflect: true }) placement = PopoverPlacement.BlockEnd
	@property({ reflect: true }) alignment = PopoverAlignment.Start
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: Boolean }) openOnHover?: boolean
	@property({ type: Boolean }) openOnFocus?: boolean
	// TODO [Popover] Think of eliminating these two properties in favor of alignment
	@property({ type: Object }) getLeftPositionOffset?: (anchorRect: DOMRect, popoverRect: DOMRect) => number
	@property({ type: Object }) getTopPositionOffset?: (anchorRect: DOMRect, popoverRect: DOMRect) => number

	protected readonly popoverController = new PopoverController(this)

	setOpen(open: boolean) {
		this.open = open
		this.openChange.dispatch(open)
	}

	static get translationStyles() {
		return css`
			:host(:not([fixed])[placement=block-start]) {
				--mo-popover-translate-y: -100%;
			}
			:host(:not([fixed])[placement=inline-start]) {
				--mo-popover-translate-x: -100%;
			}

			:host(:not([fixed])[placement=block-start][alignment=start]),
			:host(:not([fixed])[placement=block-end][alignment=start]) {
				--mo-popover-translate-x: 0%;
			}
			:host(:not([fixed])[placement=block-start][alignment=center]),
			:host(:not([fixed])[placement=block-end][alignment=center]) {
				--mo-popover-translate-x: -50%;
			}
			:host(:not([fixed])[placement=block-start][alignment=end]),
			:host(:not([fixed])[placement=block-end][alignment=end]) {
				--mo-popover-translate-x: -100%;
			}
			
			:host(:not([fixed])[placement=inline-start][alignment=start]),
			:host(:not([fixed])[placement=inline-end][alignment=start]) {
				--mo-popover-translate-y: 0%;
			}
			:host(:not([fixed])[placement=inline-start][alignment=center]),
			:host(:not([fixed])[placement=inline-end][alignment=center]) {
				--mo-popover-translate-y: -50%;
			}
			:host(:not([fixed])[placement=inline-start][alignment=end]),
			:host(:not([fixed])[placement=inline-end][alignment=end]) {
				--mo-popover-translate-y: -100%;
			}
		`
	}

	static override get styles() {
		return css`
			${Popover.translationStyles}

			:host {
				position: fixed;
				box-shadow: var(--mo-shadow, 0 2px 4px rgba(0, 0, 0, 0.2));
				width: max-content;
				opacity: 0;
				z-index: 99;
				transform: translate(var(--mo-popover-translate-x, 0%), var(--mo-popover-translate-y, 0%)) var(--mo-popover-transform-extra);
			}

			:host(:not([open])) {
				visibility: collapse;
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