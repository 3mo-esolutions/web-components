import { Controller, EventListenerController } from '@a11d/lit'
import { PointerController } from '@3mo/pointer-controller'
import { FocusController } from '@3mo/focus-controller'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverComponent } from './PopoverComponent.js'

export interface PopoverControllerOptions {
	readonly openOnHover?: boolean
	readonly openOnFocus?: boolean
	getPositionOffset?: {
		left?: (anchorRect: DOMRect, popoverRect: DOMRect) => number
		top?: (anchorRect: DOMRect, popoverRect: DOMRect) => number
	}
	handleOpen?: () => void
	handleClose?: () => void
}

function targetAnchor(this: PopoverComponent) {
	return this.anchor
}

export class PopoverController extends Controller {
	constructor(protected override readonly host: PopoverComponent, protected readonly options?: PopoverControllerOptions) {
		super(host)
	}

	protected readonly anchorFocusController = new FocusController(this.host, {
		target: targetAnchor,
		handleChange: () => this.update(),
	})

	protected readonly pointerController = new PointerController(this.host)

	protected readonly anchorPointerController = new PointerController(this.host, {
		target: targetAnchor,
		handleHoverChange: () => this.update(),
	})

	protected readonly slotChangeHandler = new EventListenerController(this.host, 'slotchange', () => this.updatePosition())

	private update() {
		this.openIfApplicable()
		this.updatePosition()
	}

	private openIfApplicable() {
		const openOnFocus = this.options?.openOnFocus ?? false
		const openOnHover = this.options?.openOnHover ?? false

		if (!openOnFocus && !openOnHover) {
			return
		}

		const open =
			(openOnHover && (this.pointerController.hover || this.anchorPointerController.hover)) ||
			(openOnFocus && this.anchorFocusController.focused)

		if (this.host.open === open) {
			return
		}

		this.host.open = open
	}

	private updatePosition() {
		const anchorRect = this.host.anchor.getBoundingClientRect()
		const popoverRect = this.host.getBoundingClientRect()

		const leftOffset = this.options?.getPositionOffset?.left?.(anchorRect, popoverRect) ?? 0
		const topOffset = this.options?.getPositionOffset?.top?.(anchorRect, popoverRect) ?? 0

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