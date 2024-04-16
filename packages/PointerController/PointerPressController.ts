import { Controller, type EventListenerTarget, type ReactiveElement, eventListener, extractEventTargets } from '@a11d/lit'

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

	@eventListener({ type: 'pointerdown', target(this: PointerPressController) { return extractEventTargets(this.host, this.options?.target) } })
	protected setPressTrue() {
		this.setPress(true)
	}

	@eventListener({ type: 'pointerup', target: document })
	@eventListener({ type: 'pointercancel', target: document })
	protected setPressFalse() {
		this.setPress(false)
	}
}