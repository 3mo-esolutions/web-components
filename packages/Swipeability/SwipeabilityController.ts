import { Controller, type ReactiveControllerHost } from '@a11d/lit'
import { PointerDragController, type PointerDrag } from '@3mo/pointer-controller'

export type SwipeabilityAxis = 'block' | 'inline'

export type SwipeabilityDirection = 'start' | 'end'

export type SwipeabilityState = 'idle' | 'swiping'

export type SwipeabilityPointerType = 'mouse' | 'pen' | 'touch'

export type SwipeabilityControllerOptions = {
	readonly surface?: HTMLElement | undefined
	readonly axis: SwipeabilityAxis
	/** The way along the axis in which offsets grow. Logical: on the inline axis it follows the writing direction. */
	readonly direction: SwipeabilityDirection
	/** The rest positions the surface settles at, in pixels. */
	readonly detents: Array<number>
	/** The rest position the surface currently sits at. Defaults to the last settled detent. */
	readonly detent?: number
	readonly disabled?: boolean
	/** The kinds of pointer which may start a gesture. Defaults to all of them. */
	readonly pointerTypes?: Array<SwipeabilityPointerType>
	/** Fraction of the way to the next detent past which a release commits to it. Defaults to 0.25. */
	readonly threshold?: number
	/** Speed which commits to the next detent however short the gesture, in px/s. Defaults to 400. */
	readonly velocityThreshold?: number
	handleSwipeStart?(): void
	/** The offset the surface is to be placed at, in pixels, as the gesture moves. */
	handleSwipe?(offset: number): void
	/** The detent to settle at, and the offset the gesture left the surface at. */
	handleSwipeEnd?(detent: number, offset: number): void
}

/**
 * Drags a surface along one axis between rest positions.
 *
 * It measures and decides only - placing and animating the surface is the caller's, which is what
 * lets one surface be moved by a transform, another by a scroll position, and a third by layout.
 * A release commits to the next detent once it has covered a fraction of the way there, or on the
 * strength of a flick, and returns to where it started when the flick reverses. The surface never
 * leaves the span of its detents: there is nothing out there for it to occupy.
 *
 * The first movement decides whose gesture it is: the browser's if it runs across the axis or if
 * something beneath the finger can still scroll that way, otherwise the surface's - claimed by
 * preventing the touch's default, since a touch left to the browser goes on panning the page and
 * cancels the pointer out from under the gesture.
 *
 * Options are usually provided as a factory, whose host parameter enables getter-backed,
 * lazily-read options right in a field initializer:
 *
 * ```ts
 * readonly swipeability = new SwipeabilityController(this, host => ({
 *     axis: 'inline',
 *     direction: 'start',
 *     get surface() { return host },
 *     get detents() { return [0, host.actionsWidth] },
 *     handleSwipe: offset => host.offset = offset,
 * }))
 * ```
 *
 * @ssr true
 */
export class SwipeabilityController<THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller {
	static readonly threshold = 0.25
	static readonly velocityThreshold = 400
	/** Sampling window (ms) for velocity calculation. */
	static readonly velocityWindow = 100
	static readonly velocityMinimumInterval = 20

	private readonly drag: PointerDragController<THost>
	private stamped?: HTMLElement
	private origin?: { readonly detent: number, readonly path: ReadonlyArray<EventTarget> }
	private settled?: number
	private samples = new Array<{ readonly offset: number, readonly time: number }>()
	private swiping = false

	protected readonly options: SwipeabilityControllerOptions

	constructor(
		protected override readonly host: THost,
		options: SwipeabilityControllerOptions | ((host: THost) => SwipeabilityControllerOptions)
	) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		const controller = this
		this.drag = new PointerDragController<THost>(host, {
			get target() { return controller.options.surface },
			get disabled() { return controller.options.disabled },
			handlePress: event => controller.handlePress(event),
			isDrag: (deltaX, deltaY) => controller.isDrag(deltaX, deltaY),
			handleDragStart: () => controller.handleDragStart(),
			handleDrag: drag => controller.handleDrag(drag),
			handleDragEnd: drag => controller.handleDragEnd(drag),
			handleDragCancel: () => controller.handleDragCancel(),
		})
	}

	get state(): SwipeabilityState {
		return this.swiping ? 'swiping' : 'idle'
	}

	private get detents() {
		return [...this.options.detents].sort((a, b) => a - b)
	}

	override hostUpdated() {
		const surface = this.options.surface
		if (surface !== this.stamped) {
			this.stamped = surface
			this.stamp()
		}
	}

	override hostDisconnected() {
		this.abandon()
		this.stamped = undefined
	}

	/** Cancels an in-flight gesture and cleans up window listeners. */
	abandon() {
		this.drag.abandon()
		this.reset()
	}

	private reset() {
		this.origin = undefined
		this.samples = []
		this.swiping = false
		this.stamp()
	}

	private stamp() {
		if (this.stamped) {
			this.stamped.dataset.swipeability = this.state
		}
	}

	private get sign() {
		const forward = this.options.direction === 'end'
		if (this.options.axis === 'block') {
			return forward ? 1 : -1
		}
		const rtl = !!this.options.surface && getComputedStyle(this.options.surface).direction === 'rtl'
		return forward === !rtl ? 1 : -1
	}

	private handlePress(event: PointerEvent) {
		// Read off the very event which starts the gesture, so a device with both a finger and a mouse
		// answers each of them on its own terms.
		if (this.options.pointerTypes && !this.options.pointerTypes.includes(event.pointerType as SwipeabilityPointerType)) {
			return false
		}
		this.origin = {
			detent: this.options.detent ?? this.settled ?? this.detents[0] ?? 0,
			path: event.composedPath(),
		}
		this.samples = []
		return true
	}

	private contentScrollsWith(along: number) {
		const blockAxis = this.options.axis === 'block'
		for (const node of this.origin?.path ?? []) {
			if (node === this.options.surface) {
				return false
			}
			if (!(node instanceof Element)) {
				continue
			}
			const extent = blockAxis ? node.scrollHeight - node.clientHeight : node.scrollWidth - node.clientWidth
			if (extent <= 0) {
				continue
			}
			const position = blockAxis ? node.scrollTop : node.scrollLeft
			if (along > 0 ? position > 0 : position < extent) {
				return true
			}
		}
		return false
	}

	/** The browser's if it runs across the axis, or if something beneath it can still scroll that way. */
	private isDrag(deltaX: number, deltaY: number) {
		const { along, across } = this.deltas(deltaX, deltaY)
		return Math.abs(across) <= Math.abs(along) && !this.contentScrollsWith(along)
	}

	private deltas(deltaX: number, deltaY: number) {
		return this.options.axis === 'block' ? { along: deltaY, across: deltaX } : { along: deltaX, across: deltaY }
	}

	private offsetOf(along: number) {
		const offset = (this.origin?.detent ?? 0) + along * this.sign
		const detents = this.detents
		return Math.min(Math.max(offset, detents[0] ?? 0), detents.at(-1) ?? 0)
	}

	private handleDragStart() {
		this.swiping = true
		this.stamp()
		this.options.handleSwipeStart?.()
	}

	private handleDrag({ deltaX, deltaY, event }: PointerDrag) {
		const offset = this.offsetOf(this.deltas(deltaX, deltaY).along)
		this.sample(offset, event.timeStamp)
		this.options.handleSwipe?.(offset)
	}

	private handleDragEnd({ event }: PointerDrag) {
		const start = this.origin?.detent ?? 0
		const offset = this.samples.at(-1)?.offset ?? start
		this.sample(offset, event.timeStamp)
		const detent = this.targetDetent(offset, this.velocity, start)
		this.reset()
		this.settled = detent
		this.options.handleSwipeEnd?.(detent, offset)
	}

	private handleDragCancel() {
		const start = this.origin?.detent ?? 0
		const offset = this.samples.at(-1)?.offset ?? start
		this.reset()
		this.options.handleSwipeEnd?.(start, offset)
	}

	private targetDetent(offset: number, velocity: number, start: number) {
		const detents = this.detents
		const forward = offset > start
		const next = forward ? detents.find(detent => detent > start) : [...detents].reverse().find(detent => detent < start)
		if (next === undefined) {
			return start
		}
		const velocityThreshold = this.options.velocityThreshold ?? SwipeabilityController.velocityThreshold
		const towards = forward ? velocity : -velocity
		if (towards <= -velocityThreshold) {
			return start
		}
		const covered = Math.abs(offset - start) / Math.abs(next - start)
		return towards >= velocityThreshold || covered >= (this.options.threshold ?? SwipeabilityController.threshold) ? next : start
	}

	private sample(offset: number, time: number) {
		this.samples.push({ offset, time })
		while (this.samples.length > 2 && time - (this.samples[0]?.time ?? time) > SwipeabilityController.velocityWindow) {
			this.samples.shift()
		}
	}

	private get velocity() {
		const oldest = this.samples[0]
		const latest = this.samples.at(-1)
		if (!oldest || !latest) {
			return 0
		}
		const elapsed = latest.time - oldest.time
		return elapsed >= SwipeabilityController.velocityMinimumInterval ? (latest.offset - oldest.offset) / elapsed * 1000 : 0
	}
}