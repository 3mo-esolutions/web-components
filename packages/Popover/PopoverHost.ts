import { Component, ReactiveElement, component, html, property, unsafeCSS } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'

export const enum PopoverAlignment {
	BlockStart = 'blockStart',
	BlockEnd = 'blockEnd',
	InlineStart = 'inlineStart',
	InlineEnd = 'inlineEnd',
}

/**
 * @attr alignment
 */
@component('mo-popover-host')
export class PopoverHost extends Component {
	protected static readonly flowByAlignment = {
		[PopoverAlignment.InlineEnd]: 'row',
		[PopoverAlignment.InlineStart]: 'row-reverse',
		[PopoverAlignment.BlockEnd]: 'column',
		[PopoverAlignment.BlockStart]: 'column-reverse',
	}

	@property() alignment = PopoverAlignment.InlineEnd

	protected readonly slotController = new SlotController(this, () => {
		this.slotController.getAssignedElements('popover').forEach(x => (x as ReactiveElement & { anchor: HTMLElement }).anchor = this)
	})

	protected override get template() {
		return html`
			<style>
				:host \{
					display: inline-flex;
					position: relative;
					flex-flow: ${PopoverHost.flowByAlignment[this.alignment]};
				\}
			</style>
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