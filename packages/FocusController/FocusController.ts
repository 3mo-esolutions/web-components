import { Controller, EventListenerController, type EventListenerTarget, type ReactiveElement, extractEventTargets } from '@a11d/lit'

export type FocusMethod = 'pointer' | 'keyboard' | 'programmatic'

export interface FocusControllerOptions {
	target?: EventListenerTarget
	handleChange?(focused: boolean, bubbled: boolean, method: FocusMethod): void
}

export class FocusController extends Controller {
	/** The innermost focused element, descending into shadow roots. */
	static get activeElement() {
		let element = document.activeElement
		while (element?.shadowRoot?.activeElement) {
			element = element.shadowRoot.activeElement
		}
		return element
	}

	static get focusVisible() {
		return FocusController.activeElement?.matches(':focus-visible') ?? false
	}

	private static contains(element: Element, node: Node | null) {
		for (let current = node; current; current = current.parentNode ?? (current instanceof ShadowRoot ? current.host : null)) {
			if (current === element) {
				return true
			}
		}
		return false
	}

	/** Whether the focus within the element, across shadow boundaries, is visible. */
	static focusVisibleWithin(element: Element) {
		const active = FocusController.activeElement
		return FocusController.contains(element, active) && !!active?.matches(':focus-visible')
	}

	constructor(protected override readonly host: ReactiveElement, protected readonly options?: FocusControllerOptions) {
		super(host)
	}

	private readonly target = () => extractEventTargets(this.host, this.options?.target)

	protected readonly focusInController = new EventListenerController(this.host, {
		type: 'focusin', target: this.target,
		listener: (e: FocusEvent) => this.handleFocusIn(e),
	})

	protected readonly focusOutController = new EventListenerController(this.host, {
		type: 'focusout', target: this.target,
		listener: (e: FocusEvent) => this.handleFocusOut(e),
	})

	private interaction?: Exclude<FocusMethod, 'programmatic'>

	protected readonly pointerDownController = new EventListenerController(this.host, {
		type: 'pointerdown', target: this.target,
		listener: () => this.interaction = 'pointer',
	})

	protected readonly keyDownController = new EventListenerController(this.host, {
		type: 'keydown', target: this.target,
		listener: () => this.interaction = 'keyboard',
	})

	/** Re-binds the listeners, e.g. after the target has changed. */
	resubscribe() {
		this.focusInController.resubscribe()
		this.focusOutController.resubscribe()
		this.pointerDownController.resubscribe()
		this.keyDownController.resubscribe()
	}

	private bubbled = false
	private method: FocusMethod = 'programmatic'

	protected _focused = false
	get focused() { return this._focused }
	protected set focused(value) {
		if (value !== this._focused) {
			this._focused = value
			this.options?.handleChange?.(value, this.bubbled, this.method)
			this.host.requestUpdate()
		}
	}

	focusIn() {
		this.handleFocusIn(new FocusEvent('focusin', { bubbles: true }))
	}

	focusOut() {
		this.handleFocusOut(new FocusEvent('focusout', { bubbles: true }))
	}

	private handleFocusIn(e: FocusEvent) {
		this.bubbled = e.target !== this.host
		this.method = this.interaction === 'pointer' ? 'pointer' : FocusController.focusVisible ? 'keyboard' : 'programmatic'
		this.interaction = undefined
		this.focused = true
	}

	private handleFocusOut(e: FocusEvent) {
		this.bubbled = e.target !== this.host
		this.method = this.interaction ?? 'programmatic'
		this.interaction = undefined
		this.focused = false
	}
}