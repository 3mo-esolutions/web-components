import { Controller, type ReactiveControllerHost } from '@a11d/lit'

export type PointerDrag = {
	/** Where the pointer was pressed, in client coordinates. */
	readonly origin: { readonly x: number, readonly y: number }
	/** How far the pointer has moved since, in pixels. */
	readonly deltaX: number
	readonly deltaY: number
	/** The latest event of the press: the one moving or releasing the pointer. */
	readonly event: PointerEvent
}

export interface PointerDragControllerOptions {
	/** The element a drag starts on and which captures the pointer while it lasts. Defaults to the host. */
	readonly target?: HTMLElement | null
	readonly disabled?: boolean
	/** How far a press travels before it becomes a drag, in pixels. `0` makes the press itself one. Defaults to 4. */
	readonly threshold?: number
	/** How long a touch or pen press is held before it becomes a drag, in milliseconds. Moving earlier leaves it to the browser to scroll with. */
	readonly holdDuration?: number
	/** Return `false` to leave a press alone. */
	handlePress?(event: PointerEvent): boolean | void
	/** Asked once, on the first movement. Return `false` to leave the gesture to the browser. */
	isDrag?(deltaX: number, deltaY: number): boolean
	handleDragStart?(drag: PointerDrag): void
	/** Every movement of a drag, the one which started it included. */
	handleDrag?(drag: PointerDrag): void
	handleDragEnd?(drag: PointerDrag): void
	/** The browser took the pointer over, or its release never arrived. */
	handleDragCancel?(): void
}

type PointerDragPress = {
	readonly pointerId: number
	readonly pointerType: string
	readonly origin: { readonly x: number, readonly y: number }
	readonly target: HTMLElement
	event: PointerEvent
	claimed: boolean
	dragging: boolean
	holdTimer?: ReturnType<typeof setTimeout>
}

/**
 * Turns a press on an element into a drag once it travels far enough, or once a touch is held long enough.
 *
 * ```ts
 * readonly drag = new PointerDragController(this, host => ({
 *   handleDrag: ({ deltaX }) => host.offset = deltaX,
 * }))
 * ```
 *
 * While a drag lasts, the target captures the pointer and the touch is kept from scrolling; the click
 * which follows a drag is swallowed, so a press which never became one is still an ordinary click.
 */
export class PointerDragController<THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller implements EventListenerObject {
	static readonly defaultThreshold = 4
	/** How far a held touch may drift before it counts as scrolling, in pixels. */
	static readonly holdTolerance = 10

	protected readonly options: PointerDragControllerOptions

	constructor(protected override readonly host: THost, options: PointerDragControllerOptions | ((host: THost) => PointerDragControllerOptions) = {}) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		// `super()` already called `hostConnected` for a connected host, before the options existed.
		if ((host as Partial<Node>).isConnected) {
			this.hostConnected()
		}
	}

	private listened?: HTMLElement
	private press?: PointerDragPress

	/** Whether a press has become a drag which is still going on. */
	get dragging() { return !!this.press?.dragging }

	private get threshold() { return this.options.threshold ?? PointerDragController.defaultThreshold }

	private get target() {
		return 'target' in this.options
			? this.options.target ?? undefined
			: this.host instanceof HTMLElement ? this.host : undefined
	}

	override hostConnected() {
		this.listen()
	}

	override hostUpdated() {
		this.listen()
	}

	override hostDisconnected() {
		this.abandon()
		this.listened?.removeEventListener('pointerdown', this)
		this.listened = undefined
	}

	/** Forgets the press or drag in flight without reporting it. */
	abandon() {
		const press = this.press
		this.press = undefined
		window.removeEventListener('pointermove', this)
		window.removeEventListener('touchmove', this)
		window.removeEventListener('pointerup', this)
		window.removeEventListener('pointercancel', this)
		if (press) {
			clearTimeout(press.holdTimer)
			if (press.target.hasPointerCapture(press.pointerId)) {
				press.target.releasePointerCapture(press.pointerId)
			}
		}
	}

	handleEvent(event: Event) {
		switch (event.type) {
			case 'pointerdown': return this.handlePointerDown(event as PointerEvent)
			case 'pointermove': return this.handlePointerMove(event as PointerEvent)
			case 'touchmove': return this.handleTouchMove(event as TouchEvent)
			case 'pointerup': return this.handlePointerUp(event as PointerEvent)
			case 'pointercancel': return this.handlePointerCancel(event as PointerEvent)
			case 'click': return this.handleClick(event)
		}
	}

	private listen() {
		if (!this.options) {
			return
		}
		const target = this.target
		if (target !== this.listened) {
			this.listened?.removeEventListener('pointerdown', this)
			this.listened = target
			target?.addEventListener('pointerdown', this)
		}
	}

	private handlePointerDown(event: PointerEvent) {
		if (this.options.disabled || !event.isPrimary || event.button !== 0 || !this.listened) {
			return
		}
		// A new primary press means the previous one's release never arrived.
		this.cancel()
		if (this.options.handlePress?.(event) === false) {
			return
		}
		const press: PointerDragPress = {
			pointerId: event.pointerId,
			pointerType: event.pointerType,
			origin: { x: event.clientX, y: event.clientY },
			target: this.listened,
			event,
			claimed: false,
			dragging: false,
		}
		this.press = press
		window.addEventListener('pointermove', this)
		// Not passive, as a claimed touch is kept from scrolling.
		window.addEventListener('touchmove', this, { passive: false })
		window.addEventListener('pointerup', this)
		window.addEventListener('pointercancel', this)
		if (this.options.holdDuration !== undefined && press.pointerType !== 'mouse') {
			press.holdTimer = setTimeout(() => this.start(), this.options.holdDuration)
		} else if (this.threshold <= 0) {
			this.start()
		}
	}

	private handlePointerMove(event: PointerEvent) {
		const press = this.press
		if (!press || event.pointerId !== press.pointerId) {
			return
		}
		// A move without the button held means the release happened where it could not be heard.
		if (!(event.buttons & 1)) {
			this.cancel()
			return
		}
		press.event = event
		const { deltaX, deltaY } = this.dragOf(press)
		if (!press.dragging) {
			if (press.holdTimer !== undefined) {
				if (Math.hypot(deltaX, deltaY) > PointerDragController.holdTolerance) {
					this.abandon()
				}
				return
			}
			if (!this.claim(deltaX, deltaY) || Math.hypot(deltaX, deltaY) < this.threshold) {
				return
			}
			this.start()
		}
		this.options.handleDrag?.(this.dragOf(press))
	}

	private handleTouchMove(event: TouchEvent) {
		const press = this.press
		const touch = event.touches[0]
		if (!press || !touch) {
			return
		}
		// Touches can be reported before the pointer moves which they cause.
		if (!press.claimed && press.holdTimer === undefined) {
			this.claim(touch.clientX - press.origin.x, touch.clientY - press.origin.y)
		}
		if (this.press?.claimed && event.cancelable) {
			event.preventDefault()
		}
	}

	private handlePointerUp(event: PointerEvent) {
		const press = this.press
		if (!press || event.pointerId !== press.pointerId) {
			return
		}
		press.event = event
		this.abandon()
		if (press.dragging) {
			this.swallowClick(press.target)
			this.options.handleDragEnd?.(this.dragOf(press))
		}
	}

	private handlePointerCancel(event: PointerEvent) {
		if (event.pointerId === this.press?.pointerId) {
			this.cancel()
		}
	}

	/** Whether the gesture is the drag's, judged on its first movement. */
	private claim(deltaX: number, deltaY: number) {
		const press = this.press!
		if (!press.claimed) {
			if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
				return false
			}
			if (this.options.isDrag?.(deltaX, deltaY) === false) {
				this.abandon()
				return false
			}
			press.claimed = true
		}
		return true
	}

	private start() {
		const press = this.press!
		clearTimeout(press.holdTimer)
		press.holdTimer = undefined
		press.claimed = true
		press.dragging = true
		try {
			press.target.setPointerCapture(press.pointerId)
		} catch {
			// An inactive pointer cannot be captured, and the drag goes on without it.
		}
		press.target.ownerDocument.getSelection()?.removeAllRanges()
		this.options.handleDragStart?.(this.dragOf(press))
	}

	private cancel() {
		const dragging = this.press?.dragging
		this.abandon()
		if (dragging) {
			this.options.handleDragCancel?.()
		}
	}

	private dragOf(press: PointerDragPress): PointerDrag {
		return {
			origin: press.origin,
			deltaX: press.event.clientX - press.origin.x,
			deltaY: press.event.clientY - press.origin.y,
			event: press.event,
		}
	}

	private swallowClick(target: HTMLElement) {
		target.addEventListener('click', this, { capture: true, once: true })
		setTimeout(() => target.removeEventListener('click', this, { capture: true }))
	}

	private handleClick(event: Event) {
		event.preventDefault()
		event.stopImmediatePropagation()
	}
}