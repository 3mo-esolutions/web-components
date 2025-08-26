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
	static override shadowRootOptions: ShadowRootInit = { ...Component.shadowRootOptions, delegatesFocus: false }

	@property({ reflect: true, updated(this: PopoverContainer) { this.assignSlottedPopovers() } }) placement = PopoverPlacement.BlockEnd
	@property({ reflect: true, updated(this: PopoverContainer) { this.assignSlottedPopovers() } }) alignment = PopoverAlignment.Start

	protected readonly slotController = new SlotController(this, this.assignSlottedPopovers.bind(this))

	get popoverElement() {
		return this.slotController.getAssignedElements('popover')[0] as Popover
	}

	get anchorElement() {
		return this.slotController.getAssignedElements('')[0] as HTMLElement
	}

	assignSlottedPopovers() {
		this.popoverElement.anchor = this.anchorElement
		this.popoverElement.placement = this.placement
		this.popoverElement.alignment = this.alignment
	}

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
				position: relative;
			}

			slot:not([name])::slotted(*) {
				anchor-name: --mo-popover-container;
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