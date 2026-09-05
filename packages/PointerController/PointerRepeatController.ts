import type { ReactiveElement } from '@a11d/lit'
import { PointerPressController, type PointerPressControllerOptions } from './PointerPressController.js'

export interface PointerRepeatControllerOptions extends PointerPressControllerOptions {
	/** How long the press is held before it repeats, in milliseconds. Defaults to 500. */
	delay?: number
	/** How long between repetitions, in milliseconds. Defaults to 50. */
	interval?: number
	/** Whether the press itself triggers, before any repetition. Defaults to true. */
	triggerOnPress?: boolean
	/** Called on the press and on every repetition, with the number of triggers which came before it. */
	handleTrigger?(repetition: number): void
}

/**
 * Repeats while a pointer is held down, as a held key repeats on its own.
 *
 * The trigger fires on the press rather than on the release, so a consumer wires the pointer through
 * this controller instead of through a click handler. It is a {@link PointerPressController}, so a
 * repetition ends with the press however that press ends.
 *
 * Options are usually provided as a factory, whose host parameter enables getter-backed,
 * lazily-read options right in a field initializer:
 *
 * ```ts
 * readonly repeatController = new PointerRepeatController(this, host => ({
 *     get disabled() { return host.disabled },
 *     handleTrigger: () => host.stepUp(),
 * }))
 * ```
 */
export class PointerRepeatController<THost extends ReactiveElement = ReactiveElement> extends PointerPressController {
	static readonly defaultDelay = 500
	static readonly defaultInterval = 50

	protected override readonly options?: PointerRepeatControllerOptions

	constructor(
		protected override readonly host: THost,
		options?: PointerRepeatControllerOptions | ((host: THost) => PointerRepeatControllerOptions)
	) {
		super(host, typeof options === 'function' ? options(host) : options)
	}

	private repetition = 0
	private delayTimeout?: ReturnType<typeof setTimeout>
	private repeatInterval?: ReturnType<typeof setInterval>

	/** Whether the press has outlasted the delay. */
	get repeating() { return this.repeatInterval !== undefined }

	protected get delay() { return this.options?.delay ?? PointerRepeatController.defaultDelay }
	protected get interval() { return this.options?.interval ?? PointerRepeatController.defaultInterval }
	protected get triggerOnPress() { return this.options?.triggerOnPress ?? true }

	/** Ends the repetition without ending the press, for a consumer which has run out of room. */
	stop() {
		const wasRepeating = this.repeating
		clearTimeout(this.delayTimeout)
		clearInterval(this.repeatInterval)
		this.delayTimeout = undefined
		this.repeatInterval = undefined
		if (wasRepeating) {
			this.host.requestUpdate()
		}
	}

	protected trigger() {
		this.options?.handleTrigger?.(this.repetition++)
	}

	protected override setPressTrue() {
		super.setPressTrue()
		this.stop()
		this.repetition = 0
		if (this.triggerOnPress) {
			this.trigger()
		}
		// Started an interval early, so the first repetition lands on the delay rather than past it.
		this.delayTimeout = setTimeout(() => {
			this.delayTimeout = undefined
			this.repeatInterval = setInterval(() => this.trigger(), this.interval)
			this.host.requestUpdate()
		}, Math.max(0, this.delay - this.interval))
	}

	protected override setPressFalse() {
		super.setPressFalse()
		this.stop()
	}
}