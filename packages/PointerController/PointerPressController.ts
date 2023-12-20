import { Controller, EventListenerController, EventListenerTarget, ReactiveElement } from '@a11d/lit'

export interface PointerPressControllerOptions {
	target?: EventListenerTarget
	handlePressChange?(press: boolean): void
}

export class PointerPressController extends Controller {
	constructor(protected override readonly host: ReactiveElement, protected readonly options?: PointerPressControllerOptions) {
		super(host)
	}

	protected _press = false
	get press() { return this._press }

	protected setPress(press: boolean) {
		if (this._press !== press) {
			this._press = press
			this.options?.handlePressChange?.(press)
			this.host.requestUpdate()
		}
	}

	protected readonly pointerDown = new EventListenerController(this.host, {
		type: 'pointerdown',
		target: this.options?.target,
		listener: () => this.setPress(true)
	})

	protected readonly pointerUp = new EventListenerController(this.host, {
		type: 'pointerup',
		target: document,
		listener: () => this.setPress(false)
	})

	protected readonly pointerCancel = new EventListenerController(this.host, {
		type: 'pointercancel',
		target: document,
		listener: () => this.setPress(false)
	})
}