import { Controller, EventListenerController, EventListenerTarget, ReactiveElement } from '@a11d/lit'

export type FocusMethod = 'pointer' | 'keyboard' | 'programmatic'

export interface FocusControllerOptions {
	target?: EventListenerTarget
	handleChange?(focused: boolean, bubbled: boolean, method: FocusMethod): void
}

export class FocusController extends Controller {
	constructor(protected override readonly host: ReactiveElement, protected readonly options?: FocusControllerOptions) {
		super(host)
	}

	private method: FocusMethod = 'programmatic'

	protected readonly pointerDown = new EventListenerController(this.host, {
		type: 'pointerdown',
		target: document,
		listener: () => this.method = 'pointer'
	})

	protected readonly keyDown = new EventListenerController(this.host, {
		type: 'keydown',
		target: document,
		listener: () => this.method = 'keyboard'
	})

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

	protected readonly anchorFocusIn = new EventListenerController(this.host, {
		type: 'focusin',
		target: this.options?.target ?? this.host,
		listener: (e: FocusEvent) => this.handleFocusIn(e)
	})

	protected readonly anchorFocusOut = new EventListenerController(this.host, {
		type: 'focusout',
		target: this.options?.target ?? this.host,
		listener: (e: FocusEvent) => this.handleFocusOut(e)
	})

	focusIn() {
		this.handleFocusIn(new FocusEvent('focusin', { bubbles: true }))
	}

	focusOut() {
		this.handleFocusOut(new FocusEvent('focusout', { bubbles: true }))
	}

	private handleFocusIn(e: FocusEvent) {
		this.bubbled = e.target !== this.host
		this.focused = true
	}

	private handleFocusOut(e: FocusEvent) {
		this.bubbled = e.target !== this.host
		this.focused = false
	}
}