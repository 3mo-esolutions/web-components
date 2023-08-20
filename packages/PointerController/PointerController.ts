import { Controller, EventListenerController, EventListenerTarget, ReactiveElement, extractEventTargets } from '@a11d/lit'
import { ResizeController } from '@3mo/resize-observer'

export interface PointerControllerOptions {
	target?: EventListenerTarget
	handleHoverChange?(hover: boolean): void
}

export class PointerController extends Controller {
	constructor(protected override readonly host: ReactiveElement, protected readonly options?: PointerControllerOptions) {
		super(host)
	}

	protected _hover = false
	get hover() { return this._hover }

	protected async checkHover() {
		await new Promise(resolve => setTimeout(resolve))
		const elements = await extractEventTargets.call(this.host, this.options?.target) as Array<Element>
		const hover = elements.some(e => e.matches(':hover'))
		if (this._hover !== hover) {
			this._hover = hover
			this.options?.handleHoverChange?.(hover)
			this.host.requestUpdate()
		}
	}

	protected readonly pointerEnter = new EventListenerController(this.host, {
		type: 'pointerenter',
		target: this.options?.target,
		listener: () => this.checkHover()
	})

	protected readonly pointerLeave = new EventListenerController(this.host, {
		type: 'pointerleave',
		target: this.options?.target,
		listener: () => this.checkHover()
	})

	protected readonly resizeController = new ResizeController(this.host, {
		target: this.host,
		callback: () => this.checkHover()
	})
}