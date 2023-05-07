import { Controller } from '@a11d/lit'
import { PointerController } from '@3mo/pointer-controller'
import { FocusController } from '@3mo/focus-controller'
import { ResizeController } from '@3mo/resize-observer'
import { PopoverPlacement } from './PopoverPlacement.js'
import { Popover } from './Popover.js'
import { PopoverAlignment } from './PopoverAlignment.js'

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
			(openOnHover && (this.pointerController.hover || this.anchorPointerController.hover)) ||
			(openOnFocus && this.anchorFocusController.focused)

		if (this.host.open === open) {
			return
		}

		this.host.setOpen(open)
	}

	updatePosition() {
		if (!this.host.open) {
			return
		}

		if (this.host.fixed) {
			this.positionFixed()
		} else {
			this.positionAbsolute()
		}
	}

	private positionAbsolute() {
		this.host.style.position = 'absolute'
		// TODO: [Popover] Out-of-bounds-correction
	}

	private positionFixed() {
		const anchorRect = this.host.anchor.getBoundingClientRect()
		const popoverRect = this.host.getBoundingClientRect()

		const reverse = getComputedStyle(this.host.anchor).direction === 'rtl'
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
		if (reverse) {
			startWeight = 1 - startWeight
			endWeight = 1 - endWeight
		}

		if (this.host.coordinates) {
			const [x, y] = this.host.coordinates
			this.host.style.left = `${x - popoverRect.width * endWeight}px`
			this.host.style.top = `${y - popoverRect.height * endWeight}px`
			return
		}

		const leftOffset = this.host?.getLeftPositionOffset?.(anchorRect, popoverRect) ?? 0
		const topOffset = this.host?.getTopPositionOffset?.(anchorRect, popoverRect) ?? 0

		let left = 0
		let top = 0

		// TODO: [Popover] Did renaming this to Inline/Block break any calculations?

		switch (this.host.placement) {
			case PopoverPlacement.BlockStart:
				left = anchorRect.left * startWeight + anchorRect.right * endWeight - popoverRect.width * endWeight + leftOffset
				top = anchorRect.top - popoverRect.height
				break
			case PopoverPlacement.BlockEnd:
				left = anchorRect.left * startWeight + anchorRect.right * endWeight - popoverRect.width * endWeight + leftOffset
				top = anchorRect.top + anchorRect.height
				break
			case PopoverPlacement.InlineStart:
				left = anchorRect.left - popoverRect.width
				top = anchorRect.top * startWeight + anchorRect.bottom * endWeight - popoverRect.height * endWeight + topOffset
				break
			case PopoverPlacement.InlineEnd:
				left = anchorRect.left + anchorRect.width
				top = anchorRect.top * startWeight + anchorRect.bottom * endWeight - popoverRect.height * endWeight + topOffset
				break
		}

		// TODO: [Popover] is Out-of-bounds-correction correct?
		const leftOf = (value: number) => Math.max(0, Math.min(value, window.innerWidth - popoverRect.width))
		const topOf = (value: number) => Math.max(0, Math.min(value, window.innerHeight - popoverRect.height))

		this.host.style.insetInlineStart = `${leftOf(left)}px`
		this.host.style.insetBlockStart = `${topOf(top)}px`
	}
}