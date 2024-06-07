import { Controller, PureEventDispatcher, type ReactiveElement } from '@a11d/lit'

export type PointerType = 'mouse' | 'touch' | 'pen'

export interface PointerTypeControllerOptions {
	handleTypeChange?(type: PointerType): void
}

export class PointerTypeController extends Controller {
	private static readonly change = new PureEventDispatcher<PointerType>()

	private static _type: PointerType
	private static get type() { return this._type ?? (window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse' as PointerType) }
	private static set type(value) {
		if (this._type !== value) {
			this._type = value
			this.change.dispatch(value)
		}
	}

	static {
		for (const event of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'] as const) {
			document?.addEventListener(event, (e: PointerEvent) => {
				switch (e.pointerType as number | PointerType) {
					case 2:
					case 'touch':
						PointerTypeController.type = 'touch'
						break
					case 3:
					case 'pen':
						PointerTypeController.type = 'pen'
						break
					default:
						PointerTypeController.type = 'mouse'
						break
				}
			}, { passive: true })
		}
	}

	constructor(protected override readonly host: ReactiveElement, protected readonly options?: PointerTypeControllerOptions) {
		super(host)
	}

	get type() { return PointerTypeController.type }

	override hostConnected() {
		PointerTypeController.change.subscribe(this.handleChange)
	}

	override hostDisconnected() {
		PointerTypeController.change.unsubscribe(this.handleChange)
	}

	private readonly handleChange = (type: PointerType) => {
		this.options?.handleTypeChange?.(type)
		this.host.requestUpdate()
	}
}