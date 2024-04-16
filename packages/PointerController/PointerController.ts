import { Controller, type ReactiveElement } from '@a11d/lit'
import { PointerHoverController, type PointerHoverControllerOptions } from './PointerHoverController.js'
import { PointerPressController, type PointerPressControllerOptions } from './PointerPressController.js'
import { PointerTypeController, type PointerTypeControllerOptions } from './PointerTypeController.js'

export interface PointerControllerOptions extends PointerPressControllerOptions, PointerHoverControllerOptions, PointerTypeControllerOptions { }

export class PointerController extends Controller {
	constructor(protected override readonly host: ReactiveElement, protected readonly options?: PointerControllerOptions) {
		super(host)
	}

	get hover() { return this.hoverController.hover }
	private readonly hoverController = new PointerHoverController(this.host, {
		target: this.options?.target,
		handleHoverChange: this.options?.handleHoverChange
	})

	get press() { return this.pressController.press }
	private readonly pressController = new PointerPressController(this.host, {
		target: this.options?.target,
		handlePressChange: this.options?.handlePressChange
	})

	get type() { return this.typeController.type }
	private readonly typeController = new PointerTypeController(this.host, {
		handleTypeChange: this.options?.handleTypeChange
	})
}