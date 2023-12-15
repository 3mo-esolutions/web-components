import { Controller, ReactiveElement } from '@a11d/lit'
import { PointerHoverController, PointerHoverControllerOptions } from './PointerHoverController.js'
import { PointerPressController, PointerPressControllerOptions } from './PointerPressController.js'

export interface PointerControllerOptions extends PointerPressControllerOptions, PointerHoverControllerOptions { }

export class PointerController extends Controller {
	constructor(protected override readonly host: ReactiveElement, protected readonly options?: PointerControllerOptions) {
		super(host)
	}

	get hover() { return this.hoverController.hover }
	get press() { return this.pressController.press }

	private readonly hoverController = new PointerHoverController(this.host, {
		target: this.options?.target,
		handleHoverChange: this.options?.handleHoverChange
	})

	private readonly pressController = new PointerPressController(this.host, {
		target: this.options?.target,
		handlePressChange: this.options?.handlePressChange
	})
}