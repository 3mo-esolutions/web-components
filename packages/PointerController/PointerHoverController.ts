import { Controller, type EventListenerTarget, type ReactiveElement, eventListener, extractEventTargets } from '@a11d/lit'
import { ResizeController } from '@3mo/resize-observer'
import { Throttler } from '@3mo/throttler'

export interface PointerHoverControllerOptions {
	target?: EventListenerTarget
	handleHoverChange?(hover: boolean): void
}

function target(this: PointerHoverController) {
	return extractEventTargets(this.host, this.options?.target)
}

export class PointerHoverController extends Controller {
	protected _hover = false
	get hover() { return this._hover }

	private readonly throttler = new Throttler(10)

	constructor(protected override readonly host: ReactiveElement, protected readonly options?: PointerHoverControllerOptions) {
		super(host)
	}


	protected readonly resizeController = new ResizeController(this.host, {
		target: this.host,
		callback: () => this.checkHover()
	})

	@eventListener({ type: 'pointerenter', target })
	@eventListener({ type: 'pointerleave', target })
	@eventListener({ type: 'pointerdown', target: document })
	@eventListener({ type: 'pointerup', target: document })
	@eventListener({ type: 'pointercancel', target: document })
	protected async checkHover() {
		await this.throttler.throttle()
		const elements = await extractEventTargets(this.host, this.options?.target) as Array<Element>
		const hover = elements.some(e => e.matches(':hover'))
		if (this._hover !== hover) {
			this._hover = hover
			this.options?.handleHoverChange?.(hover)
			this.host.requestUpdate()
		}
	}
}