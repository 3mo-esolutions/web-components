import { Controller, ElementRef, type ReactiveControllerHost } from '@a11d/lit'
import { SwipeabilityController, type SwipeabilityAxis, type SwipeabilityDirection } from '@3mo/swipeability'
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
export class SheetController extends Controller implements EventListenerObject {
	private static readonly dialogEventTypes = ['cancel', 'close', 'click']

	readonly dialog = new ElementRef<HTMLDialogElement>({
		updated: element => this.listen(element, SheetController.dialogEventTypes, 'addEventListener'),
		disconnected: element => this.listen(element, SheetController.dialogEventTypes, 'removeEventListener'),
	})

	readonly panel = new ElementRef<HTMLElement>()

	readonly handle = new ElementRef<HTMLElement>({
		updated: element => this.listen(element, ['click'], 'addEventListener'),
		disconnected: element => this.listen(element, ['click'], 'removeEventListener'),
	})

	readonly motion: SheetMotionController
	readonly swipe: SwipeabilityController

	private reconciledOpen = false

	constructor(protected override readonly host: SheetControllerHost, protected readonly options: SheetControllerOptions = {}) {
		super(host)
		const controller = this
		this.motion = new SheetMotionController(host, {
			get dialog() { return controller.dialog.value },
			get panel() { return controller.panel.value },
			get placement() { return controller.host.placement },
		})
		this.swipe = new SwipeabilityController(host, {
			// A sheet leaves the way its placement names, which is the axis and direction of that name.
			get axis() { return controller.host.placement.split('-')[0] as SwipeabilityAxis },
			get direction() { return controller.host.placement.split('-')[1] as SwipeabilityDirection },
			get surface() { return controller.panel.value },
			get detents() { return [0, controller.motion.travelSize] },
			// A sheet is only ever swiped from fully open: dismissing it closes the dialog outright.
			detent: 0,
			get disabled() { return controller.host.open === false || (controller.options.swipeDisabled?.() ?? false) },
			handleSwipeStart: () => controller.motion.pin(),
			handleSwipe: offset => controller.motion.offset(offset),
			handleSwipeEnd: detent => controller.handleSwipeEnd(detent),
		})
	}

	// Idempotent for one and the same listener, so re-declaring the element on every render costs nothing.
	private listen(element: Element, types: ReadonlyArray<string>, method: 'addEventListener' | 'removeEventListener') {
		for (const type of types) {
			element[method](type, this)
		}
	}

	handleEvent(event: Event) {
		switch (event.type) {
			case 'cancel': return this.handleCancel(event)
			case 'close': return this.handleClose()
			case 'click': return this.handleClick(event)
		}
	}

	override hostUpdated() {
		const dialog = this.dialog.value
		if (dialog) {
			dialog.dataset.placement = this.host.placement
		}
		if (this.host.open !== this.reconciledOpen) {
			this.reconciledOpen = this.host.open
			this.reconcile()
		}
	}

	private async handleSwipeEnd(detent: number) {
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
		const dialog = this.dialog.value
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
		if (event.currentTarget === this.handle.value) {
			this.requestClose('handle')
		} else if (event.composedPath()[0] === this.dialog.value) {
			this.requestClose('backdrop')
		}
	}
}