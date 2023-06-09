import { Controller, EventListenerController, EventListenerTarget, ReactiveElement } from '@a11d/lit'

export interface FocusControllerOptions {
	target?: EventListenerTarget
	handleChange?(focused: boolean, bubbled: boolean): void
}

export class FocusController extends Controller {
	constructor(protected override readonly host: ReactiveElement, protected readonly options?: FocusControllerOptions) {
		super(host)
	}

	private bubbled = false

	protected _focused = false
	get focused() { return this._focused }
	protected set focused(value) {
		if (value !== this._focused) {
			this._focused = value
			this.options?.handleChange?.(value, this.bubbled)
			this.host.requestUpdate()
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