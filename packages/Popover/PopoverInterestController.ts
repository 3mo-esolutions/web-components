import { Controller, type EventListenerTarget, type ReactiveElement, extractEventTargets } from '@a11d/lit'
import { FocusController } from '@3mo/focus-controller'
import { PointerHoverController, PointerPressController, PointerTypeController } from '@3mo/pointer-controller'

export interface PopoverInterestControllerOptions {
	/** The anchor element(s) whose "interest" (hover, keyboard-focus, or touch-press) is tracked. */
	anchor?: EventListenerTarget
	handleChange?(interested: boolean): void
}

/**
 * Tracks the user's "interest" in an anchor — hover of the anchor or the host itself, keyboard focus,
 * or a held touch press — mirroring the semantics of the Interest Invokers API (`interestfor`) so
 * that it can delegate to the platform once that is baseline.
 */
export class PopoverInterestController extends Controller {
	constructor(protected override readonly host: ReactiveElement, protected readonly options?: PopoverInterestControllerOptions) {
		super(host)
	}

	private _interested = false
	get interested() { return this._interested }

	private readonly anchor = () => extractEventTargets(this.host, this.options?.anchor)

	protected readonly pointerTypeController = new PointerTypeController(this.host, {
		handleTypeChange: () => this.requestEvaluation(),
	})

	protected readonly anchorHoverController = new PointerHoverController(this.host, {
		target: this.anchor,
		handleHoverChange: () => this.requestEvaluation(),
	})

	protected readonly hostHoverController = new PointerHoverController(this.host, {
		handleHoverChange: () => this.requestEvaluation(),
	})

	protected readonly anchorPressController = new PointerPressController(this.host, {
		target: this.anchor,
		handlePressChange: () => this.requestEvaluation(),
	})

	private focusedViaKeyboard = false
	protected readonly anchorFocusController = new FocusController(this.host, {
		target: this.anchor,
		handleChange: (focused, _bubbled, method) => {
			this.focusedViaKeyboard = focused && method === 'keyboard'
			// Focus comes without the boundary-event bursts pointer movement produces
			this.evaluate()
		},
	})

	/** Re-binds the anchor-bound listeners, e.g. after the anchor has changed. */
	resubscribe() {
		this.anchorHoverController.resubscribe()
		this.anchorPressController.resubscribe()
		this.anchorFocusController.resubscribe()
	}

	override async hostConnected() {
		const anchors = [...await this.anchor()].filter(anchor => anchor instanceof Element) as Array<Element>
		this.focusedViaKeyboard = anchors.some(anchor => FocusController.focusVisibleWithin(anchor))
		this.evaluate()
		await this.anchorHoverController.refresh()
		this.evaluate()
	}

	private evaluationRequest?: number
	// Coalesces boundary-event bursts, e.g. leaving the anchor while entering the popover in one move
	private requestEvaluation() {
		this.evaluationRequest ??= requestAnimationFrame(() => {
			this.evaluationRequest = undefined
			this.evaluate()
		})
	}

	protected evaluate() {
		// Focus shows interest whatever the pointer is, as the pointer type is shared by the whole
		// document and latches to "touch" until the next mouse interaction anywhere on it
		const interested = this.focusedViaKeyboard || (this.pointerTypeController.type === 'touch'
			? this.anchorPressController.press
			: this.anchorHoverController.hover || this	.hostHoverController.hover)
		if (this._interested !== interested) {
			this._interested = interested
			this.options?.handleChange?.(interested)
			this.host.requestUpdate()
		}
	}
}