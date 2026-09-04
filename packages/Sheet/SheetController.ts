import { Controller, type ReactiveControllerHost } from '@a11d/lit'
import { SwipeabilityController, type SwipeabilityAxis, type SwipeabilityDirection } from '@3mo/swipeability'
import { part } from './part.js'
import { SheetMotionController } from './SheetMotionController.js'
import type { SheetPlacement } from './SheetPlacement.js'

export type SheetRequestCloseSource = 'escape' | 'backdrop' | 'handle' | 'gesture' | 'api'

export interface SheetControllerHost extends ReactiveControllerHost, EventTarget {
	open: boolean
	readonly placement: SheetPlacement
}

export type SheetControllerOptions = {
	readonly autofocusTarget?: () => HTMLElement | null | undefined
	readonly swipeDisabled?: () => boolean
}

/**
 * Manages modal sheet behavior, reconciling host `open` state with the native dialog,
 * coordinating open/close transitions, cancelable `requestClose` events, and swipe gestures.
 */
export class SheetController extends Controller {
	readonly dialog = part<HTMLDialogElement>({
		listeners: {
			cancel: event => this.handleCancel(event),
			close: () => this.handleClose(),
			click: event => this.handleClick(event),
		}
	})

	readonly panel = part<HTMLElement>()

	readonly handle = part<HTMLElement>({
		listeners: {
			click: () => this.requestClose('handle'),
		}
	})

	readonly motion: SheetMotionController
	readonly swipe: SwipeabilityController

	private reconciledOpen = false

	constructor(protected override readonly host: SheetControllerHost, protected readonly options: SheetControllerOptions = {}) {
		super(host)
		const controller = this
		this.motion = new SheetMotionController(host, {
			get dialog() { return controller.dialog.element },
			get panel() { return controller.panel.element },
			get placement() { return controller.host.placement },
		})
		this.swipe = new SwipeabilityController(host, {
			// A sheet leaves the way its placement names, which is the axis and direction of that name.
			get axis() { return controller.host.placement.split('-')[0] as SwipeabilityAxis },
			get direction() { return controller.host.placement.split('-')[1] as SwipeabilityDirection },
			get surface() { return controller.panel.element },
			get detents() { return [0, controller.motion.travelSize] },
			// A sheet is only ever swiped from fully open: dismissing it closes the dialog outright.
			detent: 0,
			get disabled() { return controller.host.open === false || (controller.options.swipeDisabled?.() ?? false) },
			handleSwipeStart: () => controller.motion.pin(),
			handleSwipe: offset => controller.motion.offset(offset),
			handleSwipeEnd: detent => controller.handleSwipeEnd(detent),
		})
	}

	override hostUpdated() {
		const dialog = this.dialog.element
		if (dialog) {
			dialog.dataset.placement = this.host.placement
		}
		if (this.host.open !== this.reconciledOpen) {
			this.reconciledOpen = this.host.open
			this.reconcile()
		}
	}

	private async handleSwipeEnd(detent: number) {
		// Exit motion continues from current gesture release position.
		if (detent > 0 && this.requestClose('gesture')) {
			return
		}
		await this.motion.settle()
	}

	requestClose(source: SheetRequestCloseSource) {
		const uncancelled = this.host.dispatchEvent(new CustomEvent<{ source: SheetRequestCloseSource }>('requestClose', { detail: { source }, cancelable: true }))
		if (uncancelled) {
			this.host.open = false
		}
		return uncancelled
	}

	private async reconcile() {
		const dialog = this.dialog.element
		if (!dialog) {
			return
		}

		if (this.host.open) {
			const shown = dialog.open
			if (!shown) {
				dialog.showModal()
			}
			this.motion.enter()
			if (!shown) {
				await new Promise(requestAnimationFrame)
				this.options.autofocusTarget?.()?.focus()
			}
			return
		}

		if (dialog.open) {
			await this.motion.exit()
			if (this.host.open === false) {
				dialog.close()
				this.motion.reset()
			}
		}
	}

	private handleCancel(event: Event) {
		// Intercept native close to allow requestClose veto and exit motion.
		event.preventDefault()
		this.requestClose('escape')
	}

	private handleClose() {
		if (this.host.open) {
			this.host.open = false
		}
	}

	private handleClick(event: Event) {
		if (event.composedPath()[0] === this.dialog.element) {
			this.requestClose('backdrop')
		}
	}
}