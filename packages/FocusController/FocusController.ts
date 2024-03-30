import { Controller, EventListenerTarget, ReactiveElement, eventListener, extractEventTargets } from '@a11d/lit'

export type FocusMethod = 'pointer' | 'keyboard' | 'programmatic'

export interface FocusControllerOptions {
	target?: EventListenerTarget
	handleChange?(focused: boolean, bubbled: boolean, method: FocusMethod): void
}

function target(this: FocusController) {
	return extractEventTargets(this.host, this.options?.target)
}

export class FocusController extends Controller {
	constructor(protected override readonly host: ReactiveElement, protected readonly options?: FocusControllerOptions) {
		super(host)
	}

	private method: FocusMethod = 'programmatic'

	@eventListener({ target: document, type: 'pointerdown' })
	protected handlePointerDown() {
		this.method = 'pointer'
	}

	@eventListener({ target: document, type: 'keydown' })
	protected handleKeyDown() {
		this.method = 'keyboard'
	}

	private bubbled = false

	protected _focused = false
	get focused() { return this._focused }
	protected set focused(value) {
		if (value !== this._focused) {
			this._focused = value
			this.options?.handleChange?.(value, this.bubbled, this.method)
			this.host.requestUpdate()
			this.method = 'programmatic'
		}
	}

	focusIn() {
		this.handleFocusIn(new FocusEvent('focusin', { bubbles: true }))
	}

	focusOut() {
		this.handleFocusOut(new FocusEvent('focusout', { bubbles: true }))
	}

	@eventListener({ type: 'focusin', target })
	private handleFocusIn(e: FocusEvent) {
		this.bubbled = e.target !== this.host
		this.focused = true
	}

	@eventListener({ type: 'focusout', target })
	private handleFocusOut(e: FocusEvent) {
		this.bubbled = e.target !== this.host
		this.focused = false
	}
}