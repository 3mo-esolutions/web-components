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
 * @attr alignment - The alignment of the popover relative to the anchor.
 * @attr open - Whether the popover is open.
 * @attr openOnHover - Whether the popover should open on hover.
 * @attr openOnFocus - Whether the popover should open on focus.
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
	@property({ type: Object }) anchor?: HTMLElement
	@property({ reflect: true }) placement = PopoverPlacement.BlockEnd
	@property({ reflect: true }) alignment = PopoverAlignment.Start
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: Boolean }) openOnHover?: boolean
	@property({ type: Boolean }) openOnFocus?: boolean

	protected readonly popoverController = new PopoverController(this)

	setOpen(open: boolean) {
		if (this.open !== open) {
			this.open = open
			this.openChange.dispatch(open)
		}
	}

	static get translationStyles() {
		return css`
			:host(:not([fixed])[placement=block-start]) {
				inset-block-end: 100%;
			}
			:host(:not([fixed])[placement=block-end]) {
				inset-block-start: 100%;
			}
			:host(:not([fixed])[placement=inline-start]) {
				inset-inline-end: 100%;
			}
			:host(:not([fixed])[placement=inline-end]) {
				inset-inline-start: 100%;
			}

			:host(:not([fixed])[placement=block-start][alignment=start]),
			:host(:not([fixed])[placement=block-end][alignment=start]) {
				--mo-popover-translate-x: 0%;
				inset-inline-start: 0;
			}
			:host(:not([fixed])[placement=block-start][alignment=center]),
			:host(:not([fixed])[placement=block-end][alignment=center]) {
				--mo-popover-translate-x: -50%;
				left: 50%;
			}
			:host(:not([fixed])[placement=block-start][alignment=end]),
			:host(:not([fixed])[placement=block-end][alignment=end]) {
				--mo-popover-translate-x: 0%;
				inset-inline-end: 0;
			}

			:host(:not([fixed])[placement=inline-start][alignment=start]),
			:host(:not([fixed])[placement=inline-end][alignment=start]) {
				--mo-popover-translate-y: 0%;
				inset-block-start: 0;
			}
			:host(:not([fixed])[placement=inline-start][alignment=center]),
			:host(:not([fixed])[placement=inline-end][alignment=center]) {
				--mo-popover-translate-y: -50%;
				top: 50%;
			}
			:host(:not([fixed])[placement=inline-start][alignment=end]),
			:host(:not([fixed])[placement=inline-end][alignment=end]) {
				--mo-popover-translate-y: 0%;
				inset-block-end: 0;
			}
		`
	}

	static override get styles() {
		return css`
			:host {
				position: absolute;
				box-shadow: var(--mo-shadow);
				width: max-content;
				opacity: 0;
				z-index: 99;
				transition: all .3s ease, transform none !important;
				transform: translate(calc(var(--mo-popover-translate-x, 0%) + var(--mo-popover-correction-x, 0px)),
					calc(var(--mo-popover-translate-y, 0%) + var(--mo-popover-correction-y, 0px)));
			}

			:host([fixed]) {
				position: fixed;
			}

			:host(:not([open])) {
				visibility: collapse;
				pointer-events: none;
			}

			:host([open]) {
				opacity: 1;
			}

			${Popover.translationStyles}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}