import { Controller } from '@a11d/lit'
import { PointerController } from '@3mo/pointer-controller'
import { FocusController } from '@3mo/focus-controller'
import { ResizeController } from '@3mo/resize-observer'
import { PopoverPlacement } from './PopoverPlacement.js'
import { Popover } from './Popover.js'
import { PopoverAlignment } from './PopoverAlignment.js'

function targetAnchor(this: Popover) {
	return this.anchor || []
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

	override hostUpdated() {
		this.update()
	}

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
			(openOnHover && (this.pointerController?.hover || this.anchorPointerController?.hover || false)) ||
			(openOnFocus && (this.anchorFocusController?.focused || false))

		this.host.setOpen(open)
	}

	updatePosition() {
		if (this.host.fixed) {
			this.positionFixed()
		} else {
			this.positionAbsolute()
		}
	}

	private positionAbsolute() {
		if (!this.host.anchor) {
			return
		}
		this.host.anchor.style.position = 'relative'

		if (!this.host.open) {
			return
		}

		const popoverRect = this.host.getBoundingClientRect()
		const anchorRect = this.host.anchor.getBoundingClientRect()
		const naturalX = popoverRect.x - Number(this.host.style.getPropertyValue('--mo-popover-correction-x').replace('px', ''))
		const naturalY = popoverRect.y - Number(this.host.style.getPropertyValue('--mo-popover-correction-y').replace('px', ''))

		const leftOf = Math.max(0, Math.min(naturalX, window.innerWidth - popoverRect.width))
		const topOf = Math.max(0, Math.min(naturalY, window.innerHeight - popoverRect.height))

		switch (this.host.placement) {
			case PopoverPlacement.BlockStart:
				this.host.style.setProperty('--mo-popover-correction-x', `${leftOf - naturalX}px`)
				if (naturalY + anchorRect.height + popoverRect.height <= window.innerHeight) {
					this.host.style.setProperty('--mo-popover-correction-y', `100% + ${anchorRect.height}px`)
				} else {
					this.host.style.setProperty('--mo-popover-correction-y', `${topOf - naturalY}px`)
				}
				break

			case PopoverPlacement.BlockEnd:
				this.host.style.setProperty('--mo-popover-correction-x', `${leftOf - naturalX}px`)
				if (naturalY - anchorRect.height - popoverRect.height >= 0) {
					this.host.style.setProperty('--mo-popover-correction-y', `-100% - ${anchorRect.height}px`)
				} else {
					this.host.style.setProperty('--mo-popover-correction-y', `${topOf - naturalY}px`)
				}
				break

			case PopoverPlacement.InlineStart:
				this.host.style.setProperty('--mo-popover-correction-y', `${topOf - naturalY}px`)
				if (naturalX + anchorRect.width + popoverRect.width <= window.innerWidth) {
					this.host.style.setProperty('--mo-popover-correction-x', `100% + ${anchorRect.width}px`)
				} else {
					this.host.style.setProperty('--mo-popover-correction-x', `${leftOf - naturalX}px`)
				}
				break

			case PopoverPlacement.InlineEnd:
				this.host.style.setProperty('--mo-popover-correction-y', `${topOf - naturalY}px`)
				if (naturalX - anchorRect.width - popoverRect.width >= 0) {
					this.host.style.setProperty('--mo-popover-correction-x', `-100% - ${anchorRect.width}px`)
				} else {
					this.host.style.setProperty('--mo-popover-correction-x', `${leftOf - naturalX}px`)
				}
				break
		}
	}

	private positionFixed() {
		// TODO: [Popover] Find a way to remove this constraint.
		if (!this.host.open) {
			return
		}
		const popoverRect = this.host.getBoundingClientRect()
		const reverse = getComputedStyle(this.host).direction === 'rtl'

		let startWeight, endWeight
		switch (this.host.alignment) {
			case PopoverAlignment.Start:
				startWeight = 1
				endWeight = 0
				break
			case PopoverAlignment.Center:
				startWeight = .5
				endWeight = .5
				break
			case PopoverAlignment.End:
				startWeight = 0
				endWeight = 1
				break
		}
		if ([PopoverPlacement.BlockEnd, PopoverPlacement.BlockStart].includes(this.host.placement) && reverse) {
			startWeight = 1 - startWeight
			endWeight = 1 - endWeight
		}

		let left = 0
		let top = 0

		const anchorRect = this.host.coordinates
			? new DOMRect(...this.host.coordinates, 0, 0)
			: this.host.anchor?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)

		switch (this.host.placement) {
			case PopoverPlacement.BlockStart:
				left = anchorRect.left * startWeight + anchorRect.right * endWeight - popoverRect.width * endWeight
				top = anchorRect.top - popoverRect.height
				break
			case PopoverPlacement.BlockEnd:
				left = anchorRect.left * startWeight + anchorRect.right * endWeight - popoverRect.width * endWeight
				top = anchorRect.top + anchorRect.height
				break
			case PopoverPlacement.InlineStart:
				left = anchorRect.left - popoverRect.width
				top = anchorRect.top * startWeight + anchorRect.bottom * endWeight - popoverRect.height * endWeight
				break
			case PopoverPlacement.InlineEnd:
				left = anchorRect.left + anchorRect.width
				top = anchorRect.top * startWeight + anchorRect.bottom * endWeight - popoverRect.height * endWeight
				break
		}

		const leftOf = (value: number) => Math.max(0, Math.min(value, window.innerWidth - popoverRect.width))
		const topOf = (value: number) => Math.max(0, Math.min(value, window.innerHeight - popoverRect.height))

		this.host.style.left = `${leftOf(left)}px`
		this.host.style.top = `${topOf(top)}px`
	}
}