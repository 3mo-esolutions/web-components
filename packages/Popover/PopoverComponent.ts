import { Component, html, css, property, unsafeCSS } from '@a11d/lit'
import { PopoverController } from './PopoverController.js'

export const enum PopoverPlacement {
	Top = 'top',
	Bottom = 'bottom',
	Right = 'right',
	Left = 'left',
}

/**
 * @attr anchor - The anchor element.
 * @attr placement - The placement of the popover relative to the anchor.
 * @attr open - Whether the popover is open.
 *
 * @slot - The content of the popover.
 */
export abstract class PopoverComponent extends Component {
	@property({ type: Object }) anchor!: Element
	@property({ type: String, reflect: true }) placement = PopoverPlacement.Bottom
	@property({ type: Boolean, reflect: true }) open = false

	protected readonly abstract popoverController: PopoverController

	static override get styles() {
		return css`
			:host {
				pointer-events: none;
				position: fixed;
				transition-duration: 0.2s;
				transition-property: opacity, transform;
				transition-timing-function: ease-in-out;
				transform-origin: right center;
				opacity: 0;
				z-index: 99;
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Top)}"]) {
				transform: translateY(+10px);
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Bottom)}"]) {
				transform: translateY(-10px);
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Left)}"]) {
				transform: translateX(+10px);
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Right)}"]) {
				transform: translateX(-10px);
			}

			:host([open]) {
				opacity: 1;
				transform: translate(0);
				transition-delay: 0s;
			}

			slot {
				display: block;
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}