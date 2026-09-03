import { Controller, EventListenerController, type EventListenerTarget, type ReactiveElement, extractEventTargets } from '@a11d/lit'

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

	protected readonly pressController = new EventListenerController(this.host, {
		type: 'pointerdown', target: () => extractEventTargets(this.host, this.options?.target),
		listener: () => this.setPressTrue(),
	})

	resubscribe() {
		this.pressController.resubscribe()
	}

	private readonly handleRelease = () => this.setPressFalse()

	protected setPressTrue() {
		// Attached for the duration of the press alone
		document.addEventListener('pointerup', this.handleRelease, { once: true })
		document.addEventListener('pointercancel', this.handleRelease, { once: true })
		this.setPress(true)
	}

	protected setPressFalse() {
		document.removeEventListener('pointerup', this.handleRelease)
		document.removeEventListener('pointercancel', this.handleRelease)
		this.setPress(false)
	}

	override hostDisconnected() {
		this.setPressFalse()
	}
}