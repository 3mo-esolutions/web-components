import { Component, ReactiveElement, component, html, property } from '@a11d/lit'
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
 * @attr alignment
 */
@component('mo-popover-host')
export class PopoverHost extends Component {
	protected static readonly flowByPosition = {
		[PopoverHostedPlacement.InlineEnd]: 'row',
		[PopoverHostedPlacement.InlineStart]: 'row-reverse',
		[PopoverHostedPlacement.BlockEnd]: 'column',
		[PopoverHostedPlacement.BlockStart]: 'column-reverse',
	}

	protected static readonly alignByAlignment = {
		[PopoverHostedAlignment.Start]: 'flex-start',
		[PopoverHostedAlignment.Center]: 'center',
		[PopoverHostedAlignment.End]: 'flex-end',
	}

	@property() placement = PopoverHostedPlacement.InlineEnd
	@property() alignment = PopoverHostedAlignment.Start

	protected readonly slotController = new SlotController(this, () => {
		this.slotController.getAssignedElements('popover').forEach(x => (x as ReactiveElement & { anchor: HTMLElement }).anchor = this)
	})

	protected override get template() {
		return html`
			<style>
				:host \{
					display: inline-flex;
					position: relative;
					flex-flow: ${PopoverHost.flowByPosition[this.placement] || 'unset'};
					align-items: ${PopoverHost.alignByAlignment[this.alignment] || 'unset'};
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