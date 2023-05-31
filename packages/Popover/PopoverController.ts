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
	static readonly marginToViewport = 8

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

		// Note that we shall not use the x/y coordinates of the popover bounding rect
		// as they can be changed as a result of the out-of-bound-correction operations.
		const { width: popoverWidth, height: popoverHeight } = this.host.getBoundingClientRect()
		const anchorRect = this.host.anchor.getBoundingClientRect()

		switch (this.host.placement) {
			case PopoverPlacement.BlockStart:
				this.host.setAttribute('data-placement',
					anchorRect.y - popoverHeight < PopoverController.marginToViewport
						? PopoverPlacement.BlockEnd
						: PopoverPlacement.BlockStart
				)
				break
			case PopoverPlacement.BlockEnd:
				this.host.setAttribute('data-placement',
					anchorRect.y + anchorRect.height + popoverHeight > window.innerHeight + PopoverController.marginToViewport
						? PopoverPlacement.BlockStart
						: PopoverPlacement.BlockEnd
				)
				break
			case PopoverPlacement.InlineStart:
				this.host.setAttribute('data-placement',
					anchorRect.x - popoverWidth < PopoverController.marginToViewport
						? PopoverPlacement.InlineEnd
						: PopoverPlacement.InlineStart
				)
				break
			case PopoverPlacement.InlineEnd:
				this.host.setAttribute('data-placement',
					anchorRect.x + anchorRect.width + popoverWidth > window.innerWidth + PopoverController.marginToViewport
						? PopoverPlacement.InlineStart
						: PopoverPlacement.InlineEnd
				)
				break
		}

		this.host.setAttribute('data-alignment', this.host.alignment)

		switch (this.host.getAttribute('data-placement')) {
			case PopoverPlacement.InlineStart:
			case PopoverPlacement.InlineEnd:
				if (anchorRect.y + popoverHeight > window.innerHeight + PopoverController.marginToViewport) {
					this.host.setAttribute('data-alignment', PopoverAlignment.End)
				}

				if (anchorRect.y + anchorRect.height - popoverHeight < PopoverController.marginToViewport) {
					this.host.setAttribute('data-alignment', PopoverAlignment.Start)
				}
				break
			case PopoverPlacement.BlockStart:
			case PopoverPlacement.BlockEnd:
				if (anchorRect.x + popoverWidth > window.innerWidth + PopoverController.marginToViewport) {
					this.host.setAttribute('data-alignment', PopoverAlignment.End)
				}

				if (anchorRect.x + anchorRect.width - popoverWidth < PopoverController.marginToViewport) {
					this.host.setAttribute('data-alignment', PopoverAlignment.Start)
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

		const [x, y] = [
			Math.max(0, Math.min(left, window.innerWidth - popoverRect.width + PopoverController.marginToViewport)),
			Math.max(0, Math.min(top, window.innerHeight - popoverRect.height + PopoverController.marginToViewport))
		]

		this.host.style.left = `${x}px`
		this.host.style.top = `${y}px`
	}
}