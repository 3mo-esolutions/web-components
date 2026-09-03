import { Controller, EventListenerController, type EventListenerTarget, type ReactiveElement, extractEventTargets } from '@a11d/lit'

export interface PointerHoverControllerOptions {
	target?: EventListenerTarget
	handleHoverChange?(hover: boolean): void
}

/**
 * Follows the pointer boundary events, which engines also dispatch for layout changes underneath
 * a resting pointer, so that the state stays in sync with `:hover` without ever polling it.
 */
export class PointerHoverController extends Controller {
	protected _hover = false
	get hover() { return this._hover }

	constructor(protected override readonly host: ReactiveElement, protected readonly options?: PointerHoverControllerOptions) {
		super(host)
	}

	private readonly target = () => extractEventTargets(this.host, this.options?.target)

	protected readonly enterController = new EventListenerController(this.host, {
		type: 'pointerenter', target: this.target,
		listener: () => this.setHover(true),
	})

	protected readonly leaveController = new EventListenerController(this.host, {
		type: 'pointerleave', target: this.target,
		listener: () => this.setHover(false),
	})

	resubscribe() {
		this.enterController.resubscribe()
		this.leaveController.resubscribe()
	}

	/** Adopts a hover the listeners missed, e.g. of a target hovered before they were bound, leaving a reported state untouched otherwise. */
	async refresh() {
		const elements = await this.target() as Array<Element>
		// Engines settle the hover flag one frame after layout
		await new Promise(requestAnimationFrame)
		if ([...elements].some(element => element.matches(':hover'))) {
			this.setHover(true)
		}
	}

	protected setHover(hover: boolean) {
		if (this._hover !== hover) {
			this._hover = hover
			this.options?.handleHoverChange?.(hover)
			this.host.requestUpdate()
		}
	}
}