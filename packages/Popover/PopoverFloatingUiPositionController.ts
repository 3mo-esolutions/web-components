import { Controller, EventListenerController } from '@a11d/lit'
import { type Popover } from './Popover.js'
import { DirectionsByLanguage } from '@3mo/localization'
import { ResizeController } from '@3mo/resize-observer'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverAlignment } from './PopoverAlignment.js'

export class PopoverFloatingUiPositionController extends Controller {
	private static readonly arrowSideByPlacement = new Map([
		['top', 'bottom'],
		['right', 'left'],
		['bottom', 'top'],
		['left', 'right'],
	])

	constructor(protected override readonly host: Popover) {
		super(host)
	}

	protected readonly resizeController = new ResizeController(this.host, {
		callback: () => this.updatePosition(),
	})

	protected readonly scrollListener = new EventListenerController(this.host, {
		target: window,
		type: 'scroll',
		options: { capture: true, passive: true },
		listener: () => this.updatePosition(),
	})

	private get floatingUiPlacement() {
		const isRtl = DirectionsByLanguage.get() === 'rtl'
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


	private readonly customMiddlewares = new Set<import('@floating-ui/dom').Middleware>()

	addMiddleware(middleware: import('@floating-ui/dom').Middleware) {
		this.customMiddlewares.add(middleware)
	}

	private async updatePosition() {
		if (!this.host.open) {
			return
		}

		const anchor = !this.host.coordinates && this.host.anchor ? this.host.anchor : {
			getBoundingClientRect: () => new DOMRect(...this.host.coordinates ?? [0, 0], 0, 0),
		}

		const { computePosition, flip, shift, arrow, offset } = await import('@floating-ui/dom')

		const response = await computePosition(anchor, this.host, {
			strategy: 'fixed',
			placement: this.floatingUiPlacement,
			middleware: [
				flip(),
				shift({ crossAxis: true, padding: 4 }),
				!this.host.arrowElement ? undefined : arrow({ element: this.host.arrowElement, padding: 4 }),
				!this.host.offset ? undefined : offset(this.host.offset),
				...this.customMiddlewares,
			].filter(Boolean)
		})

		this.host.style.left = `${response.x}px`
		this.host.style.top = `${response.y}px`

		if (this.host.arrowElement) {
			const { x: arrowX, y: arrowY } = response.middlewareData.arrow ?? { x: null, y: null }

			this.host.arrowElement.style.left = arrowX !== null ? `${arrowX}px` : ''
			this.host.arrowElement.style.top = arrowY !== null ? `${arrowY}px` : ''

			const staticSide = PopoverFloatingUiPositionController.arrowSideByPlacement.get(response.placement!.split('-')[0] as any)
			this.host.arrowElement.dataset.placement = staticSide
		}
	}
}