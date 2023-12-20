import { Controller, ReactiveElement } from '@a11d/lit'

export type PointerType = 'mouse' | 'touch' | 'pen'

export interface PointerTypeControllerOptions {
	handleTypeChange?(type: PointerType): void
}

export class PointerTypeController extends Controller {
	private static readonly events = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'] as const

	constructor(protected override readonly host: ReactiveElement, protected readonly options?: PointerTypeControllerOptions) {
		super(host)
	}

	override hostConnected() {
		PointerTypeController.events.forEach(type => document.addEventListener(type, this))
	}

	override hostDisconnected() {
		PointerTypeController.events.forEach(type => document.removeEventListener(type, this))
	}

	handleEvent(e: PointerEvent) {
		switch (e.pointerType as number | PointerType) {
			case 2:
			case 'touch':
				return this.type = 'touch'
			case 3:
			case 'pen':
				return this.type = 'pen'
			default:
				return this.type = 'mouse'
		}
	}

	private _type?: PointerType
	get type() { return this._type ?? (window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse' as PointerType) }
	private set type(type) {
		if (type !== this._type) {
			this._type = type
			this.options?.handleTypeChange?.(type)
			this.host.requestUpdate()
		}
	}
}