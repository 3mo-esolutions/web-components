import { Controller } from '@a11d/lit'
import { PointerController } from '@3mo/pointer-controller'
import { FocusController } from '@3mo/focus-controller'
import { ResizeController } from '@3mo/resize-observer'
import { PopoverPlacement } from './PopoverPlacement.js'
import { Popover } from './Popover.js'
import { PopoverHost, PopoverHostedAlignment, PopoverHostedPlacement } from './PopoverHost.js'

function targetAnchor(this: Popover) {
	return this.anchor
}

export class PopoverController extends Controller {
	constructor(protected override readonly host: Popover) {
		super(host)
	}

	protected readonly anchorFocusController = new FocusController(this.host, {
		target: targetAnchor,
		handleChange: () => this.update(),
	})

	protected readonly pointerController = new PointerController(this.host, {
		handleHoverChange: () => this.update(),
	})

	protected readonly anchorPointerController = new PointerController(this.host, {
		target: targetAnchor,
		handleHoverChange: () => this.update(),
	})

	protected readonly resizeController = new ResizeController(this.host, {
		callback: () => this.update()
	})

	private update() {
		this.openIfApplicable()
		this.updatePosition()
	}

	private openIfApplicable() {
		const openOnFocus = this.host?.openOnFocus ?? false
		const openOnHover = this.host?.openOnHover ?? false

		if (!openOnFocus && !openOnHover) {
			return
		}

		const open =
			(openOnHover && (this.pointerController.hover || this.anchorPointerController.hover)) ||
			(openOnFocus && this.anchorFocusController.focused)

		if (this.host.open === open) {
			return
		}

		this.host.setOpen(open)
	}

	updatePosition() {
		if (this.host.anchor instanceof PopoverHost) {
			this.host.style.position = 'absolute'
			this.host.style.transform = `translate${
				[PopoverHostedPlacement.BlockEnd, PopoverHostedPlacement.BlockStart].includes(this.host.anchor.placement) ? 'X' : 'Y'}(${
					{
						[PopoverHostedAlignment.Start]: '0%',
						[PopoverHostedAlignment.Center]: '-50%',
						[PopoverHostedAlignment.End]: '-100%',
					}[this.host.anchor.alignment]
				})`
			return
		}

		if (this.host.managed) {
			this.host.style.position = 'absolute'
			return
		}

		const anchorRect = this.host.anchor.getBoundingClientRect()
		const popoverRect = this.host.getBoundingClientRect()

		const leftOffset = this.host?.getLeftPositionOffset?.(anchorRect, popoverRect) ?? 0
		const topOffset = this.host?.getTopPositionOffset?.(anchorRect, popoverRect) ?? 0

		let left = 0
		let top = 0

		switch (this.host.placement) {
			case PopoverPlacement.Top:
				left = anchorRect.left + leftOffset
				top = anchorRect.top - popoverRect.height
				break
			case PopoverPlacement.Bottom:
				left = anchorRect.left + leftOffset
				top = anchorRect.top + anchorRect.height
				break
			case PopoverPlacement.Left:
				left = anchorRect.left - popoverRect.width
				top = anchorRect.top + topOffset
				break
			case PopoverPlacement.Right:
				left = anchorRect.left + anchorRect.width
				top = anchorRect.top + topOffset
				break
		}

		const leftOf = (value: number) => Math.max(0, Math.min(value, window.innerWidth - popoverRect.width))
		const topOf = (value: number) => Math.max(0, Math.min(value, window.innerHeight - popoverRect.height))

		this.host.style.left = `${leftOf(left)}px`
		this.host.style.top = `${topOf(top)}px`
	}
}