import { Controller, EventListenerController } from '@a11d/lit'
import { type Popover } from './Popover.js'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { ResizeController } from '@3mo/resize-observer'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverAlignment } from './PopoverAlignment.js'

export class PopoverPositionController extends Controller {
	constructor(protected override readonly host: Popover) {
		super(host)
	}

	protected readonly resizeController = new ResizeController(this.host, {
		callback: () => this.updatePosition(),
	})

	protected readonly scrollListener = new EventListenerController(this.host, {
		target: window,
		type: 'scroll',
		options: { capture: true, passive: true } as any,
		listener: () => this.updatePosition(),
	})

	private get floatingUiPlacement() {
		const isRtl = getComputedStyle(this.host).direction === 'rtl'
		const placement = this.host.placement
		const alignment = this.host.alignment

		switch (true) {
			case placement === undefined && alignment === undefined:
				return undefined

			case placement === PopoverPlacement.BlockStart && alignment === PopoverAlignment.Start:
				return 'top-start'
			case placement === PopoverPlacement.BlockStart && alignment === PopoverAlignment.End:
				return 'top-end'
			case placement === PopoverPlacement.BlockStart:
				return 'top'

			case placement === PopoverPlacement.BlockEnd && alignment === PopoverAlignment.Start:
				return 'bottom-start'
			case placement === PopoverPlacement.BlockEnd && alignment === PopoverAlignment.End:
				return 'bottom-end'
			case placement === PopoverPlacement.BlockEnd:
				return 'bottom'

			case placement === PopoverPlacement.InlineStart && alignment === PopoverAlignment.Start:
				return isRtl ? 'right-start' : 'left-start'
			case placement === PopoverPlacement.InlineStart && alignment === PopoverAlignment.End:
				return isRtl ? 'right-end' : 'left-end'
			case placement === PopoverPlacement.InlineStart:
				return isRtl ? 'right' : 'left'

			case placement === PopoverPlacement.InlineEnd && alignment === PopoverAlignment.Start:
				return isRtl ? 'left-start' : 'right-start'
			case placement === PopoverPlacement.InlineEnd && alignment === PopoverAlignment.End:
				return isRtl ? 'left-end' : 'right-end'
			case placement === PopoverPlacement.InlineEnd:
				return isRtl ? 'left' : 'right'

			default:
				return undefined
		}
	}

	override hostUpdated() {
		this.updatePosition()
	}

	private async updatePosition() {
		if (!this.host.open) {
			return
		}

		const anchor = !this.host.coordinates && this.host.anchor ? this.host.anchor : {
			getBoundingClientRect: () => new DOMRect(...this.host.coordinates ?? [0, 0], 0, 0),
		}

		const response = await computePosition(anchor, this.host, {
			strategy: this.host.fixed ? 'fixed' : 'absolute',
			placement: this.floatingUiPlacement,
			middleware: [
				flip(),
				shift(),
				!this.host.offset ? undefined : offset(this.host.offset),
				...this.host.positionMiddleware ?? [],
			].filter(Boolean)
		})

		this.host.style.left = `${response.x}px`
		this.host.style.top = `${response.y}px`

		this.host.positionComputed?.(response)
	}
}