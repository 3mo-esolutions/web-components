import { Controller, EventListenerController } from '@a11d/lit'
import { type PopoverComponent, PopoverPlacement } from './PopoverComponent.js'

export interface PopoverControllerOptions {
	readonly openOnHover?: boolean
	readonly openOnFocus?: boolean
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

	private _hover = false
	get hover() { return this._hover }
	set hover(value) {
		this._hover = value
		this.update()
	}

	private _anchorHover = false
	get anchorHover() { return this._anchorHover }
	set anchorHover(value) {
		this._anchorHover = value
		this.update()
	}

	private _anchorFocused = false
	get anchorFocused() { return this._anchorFocused }
	set anchorFocused(value) {
		this._anchorFocused = value
		this.update()
	}

	protected readonly pointerEnter = new EventListenerController(this.host, 'pointerenter', () => {
		this.hover = true
	})

	protected readonly pointerLeave = new EventListenerController(this.host, 'pointerleave', () => {
		this.hover = false
	})

	protected readonly anchorPointerEnter = new EventListenerController(this.host, {
		type: 'pointerenter',
		target: targetAnchor,
		listener: () => this.anchorHover = true
	})

	protected readonly anchorPointerLeave = new EventListenerController(this.host, {
		type: 'pointerleave',
		target: targetAnchor,
		listener: () => this.anchorHover = false
	})

	protected readonly anchorFocusIn = new EventListenerController(this.host, {
		type: 'focusin',
		target: targetAnchor,
		listener: (e: any) => {
			if (!e.sourceCapabilities?.firesTouchEvents) {
				this.anchorFocused = true
			}
		}
	})

	protected readonly anchorFocusOut = new EventListenerController(this.host, {
		type: 'focusout',
		target: targetAnchor,
		listener: () => {
			this.anchorFocused = false
		}
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
			openOnHover && (this.hover || this.anchorHover) ||
			openOnFocus && this.anchorFocused

		if (this.host.open === open) {
			return
		}

		this.host.open = open

		if (open) {
			this.options?.handleOpen?.()
		} else {
			this.options?.handleClose?.()
		}
	}

	private updatePosition() {
		const { left: anchorLeft, width: anchorWidth, top: anchorTop, height: anchorHeight } = this.host.anchor.getBoundingClientRect()
		const { height: tooltipHeight, width: tooltipWidth } = this.host.getBoundingClientRect()

		// TODO: Support RTL

		const leftOf = (value: number) => Math.max(0, Math.min(value, window.innerWidth - tooltipWidth))
		const topOf = (value: number) => Math.max(0, Math.min(value, window.innerHeight - tooltipHeight))

		switch (this.host.placement) {
			case PopoverPlacement.Top:
				this.host.style.left = `${leftOf(anchorLeft + anchorWidth / 2 - tooltipWidth / 2)}px`
				this.host.style.top = `${topOf(anchorTop - tooltipHeight)}px`
				break
			case PopoverPlacement.Bottom:
				this.host.style.left = `${leftOf(anchorLeft + anchorWidth / 2 - tooltipWidth / 2)}px`
				this.host.style.top = `${topOf(anchorTop + anchorHeight)}px`
				break
			case PopoverPlacement.Left:
				this.host.style.left = `${leftOf(anchorLeft - tooltipWidth)}px`
				this.host.style.top = `${topOf(anchorTop + anchorHeight / 2 - tooltipHeight / 2)}px`
				break
			case PopoverPlacement.Right:
				this.host.style.left = `${leftOf(anchorLeft + anchorWidth)}px`
				this.host.style.top = `${topOf(anchorTop + anchorHeight / 2 - tooltipHeight / 2)}px`
				break
		}
	}
}