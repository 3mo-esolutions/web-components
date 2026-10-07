import { Controller, EventListenerController, type EventListenerTarget, type ReactiveElement, extractEventTargets } from '@a11d/lit'

export interface PointerHoverControllerOptions {
	/** Where to track the hover instead of the host. */
	target?: EventListenerTarget
	/** Called when the pointer enters or leaves. */
	handleHoverChange?(hover: boolean): void
}

/** Tracks whether a pointer hovers the host from the boundary events, which also fire when the layout moves under a resting pointer. */
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
