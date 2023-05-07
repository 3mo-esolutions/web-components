import { Component, ReactiveElement, component, html, property, style } from '@a11d/lit'
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
			<mo-flex ${style({ position: 'relative', flexFlow: PopoverHost.flowByAlignment[this.alignment] })}>
				<slot></slot>
				<slot name='popover'></slot>
			</mo-flex>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-popover-host': PopoverHost
	}
}