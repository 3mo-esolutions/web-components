import { Controller, EventListenerController, EventListenerTarget, ReactiveElement } from '@a11d/lit'

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
	protected set hover(value) {
		if (value !== this._hover) {
			this._hover = value
			this.options?.handleHoverChange?.(value)
			this.host.requestUpdate()
		}
	}

	protected readonly anchorPointerIn = new EventListenerController(this.host, {
		type: 'pointerenter',
		target: this.options?.target ?? this.host,
		listener: () => this.hover = true
	})

	protected readonly anchorPointerOut = new EventListenerController(this.host, {
		type: 'pointerleave',
		target: this.options?.target ?? this.host,
		listener: () => this.hover = false
	})
}