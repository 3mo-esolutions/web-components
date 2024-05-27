import { Controller, type EventListenerTarget, type ReactiveElement, eventListener, extractEventTargets } from '@a11d/lit'
import { ResizeController } from '@3mo/resize-observer'
import { Throttler } from '@3mo/throttler'
import * as System from 'detect-browser'

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

	private targets = new Array<EventTarget>()

	private get isFirefox() {
		return System.detect()?.name === 'firefox'
	}

	constructor(
		protected override readonly host: ReactiveElement,
		protected readonly options?: PointerHoverControllerOptions
	) {
		super(host)
		this.checkHover = this.checkHover.bind(this)
	}

	protected readonly resizeController = new ResizeController(this.host, {
		target: this.host,
		callback: () => this.checkHover()
	})

	override async hostConnected() {
		super.hostConnected?.()
		if (!this.isFirefox) {
			return
		}
		this.targets = await target.call(this)
		this.targets.forEach(target => {
			target.addEventListener('pointerenter', this.checkHover)
			target.addEventListener('pointerleave', this.checkHover)
		})
	}

	override hostDisconnected() {
		super.hostDisconnected?.()
		if (this.isFirefox) {
			return
		}
		this.targets.forEach(target => {
			target.removeEventListener('pointerenter', this.checkHover)
			target.removeEventListener('pointerleave', this.checkHover)
		})
	}

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