import { Controller } from '@a11d/lit'
import { Popover } from './Popover.js'
import { arrow, autoPlacement, computePosition, flip, offset, shift, type Middleware, type MiddlewareArguments } from '@floating-ui/dom'
import { ResizeController } from '@3mo/resize-observer'

const TIP_SIDES_MAP = {
	top: 'bottom',
	right: 'left',
	bottom: 'top',
	left: 'right',
}

const TIP_WIDTH = 6

const adjust = () => ({
	name: 'adjust',
	async fn(args: MiddlewareArguments) {
		const { x, y, elements } = args

		let isOnTopLayer = false

		let diff = { x: 0, y: 0 }

    try {
      isOnTopLayer ||= elements.floating.matches(':open')
    } catch {
			/** @empty */
		}

		try {
      isOnTopLayer ||= elements.floating.matches(':modal')
    } catch {
			/** @empty */
		}

    if (isOnTopLayer) {
      diff = elements.reference.getBoundingClientRect()
    }

    return { x: x + diff.x, y: y + diff.y, data: diff }
	},
})

export class PopoverController extends Controller {
	constructor(protected override readonly host: Popover) {
		super(host)
	}

	protected readonly resizeController = new ResizeController(this.host, {
		callback: () => this.host.requestUpdate(),
	})

	private get arrowElement() {
		return this.host.querySelector('#tip') as HTMLElement
	}

	private get middleware() {
		const middleware = [
			autoPlacement(),
			offset(this.host.offset),
			flip(),
			adjust(),
			shift(),
		]
		if (this.arrowElement) {
			middleware.push(
				arrow({ element: this.arrowElement })
			)
		}
		return middleware
	}

	override async hostUpdated() {
		if (!this.host.open) {
			return
		}

		const {
			x,
			y,
			middlewareData: {
				arrow: { x: arrowX, y: arrowY } = {},
			},
			placement,
		} = await computePosition(
			this.host.anchor!,
			this.host,
			{ middleware: this.middleware },
		)

		Object.assign(this.host.style, { left: `${x}px`, top: `${y}px` })

		if (this.arrowElement) {
			const staticSide = TIP_SIDES_MAP[placement.split('-')[0] as keyof typeof TIP_SIDES_MAP]

			Object.assign(this.arrowElement.style, {
				left: arrowX !== null ? `${arrowX}px` : '',
				top: arrowY !== null ? `${arrowY}px` : '',
				[staticSide!]: `${-TIP_WIDTH / 2}px`,
			})
		}
	}
}