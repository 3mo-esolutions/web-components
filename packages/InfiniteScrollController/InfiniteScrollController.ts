import { Controller, type ReactiveControllerHost } from '@a11d/lit'

export interface InfiniteScrollControllerOptions {
	/**
	 * The scrolling container. It is re-read on every host update, so it shall be provided
	 * as a getter whenever the container renders late or gets replaced.
	 */
	readonly container: Element | null | undefined
	/** Suspends the controller as long as this is `true`. */
	readonly disabled?: boolean
	/**
	 * Fetches the next chunk, appends it to the already loaded ones, and settles only once the
	 * chunk has been handed over to the host. Resolving to a boolean reports whether another
	 * chunk follows; resolving to no value declares the end unknown, as in an endless stream.
	 */
	fetchNext(): Promise<boolean | void> | boolean | void
}

/**
 * A controller which fetches chunk after chunk as the user scrolls towards the end of a container,
 * thereby replacing explicit page navigation by a continuous stream of data. It only orchestrates
 * *when* to fetch; what a chunk is and where it is stored is entirely up to the host.
 *
 * Options are usually provided as a factory, whose host parameter enables getter-backed,
 * lazily-read options right in a field initializer:
 *
 * ```ts
 * readonly infiniteScrollController = new InfiniteScrollController(this, host => ({
 *     get container() { return host.scroller },
 *     fetchNext: async () => {
 *         const chunk = await host.fetchChunk(host.items.length)
 *         host.items = [...host.items, ...chunk.data]
 *         return chunk.hasNextChunk
 *     },
 * }))
 * ```
 *
 * Redundant requests are prevented by design: chunks are fetched one at a time, and only while the
 * laid-out container is scrolled near its end. A chunk is measured only once the host has rendered
 * it, and one which failed or did not grow the container stalls the stream instead of being
 * requested over and over - revived by scrolling, or after a failure by @see reset only.
 *
 * @ssr false
 */
export class InfiniteScrollController<THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller {
	protected readonly options: InfiniteScrollControllerOptions

	constructor(
		protected override readonly host: THost,
		options: InfiniteScrollControllerOptions | ((host: THost) => InfiniteScrollControllerOptions)
	) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
	}

	private _pending = false
	/** Whether a chunk is currently being loaded. */
	get pending() { return this._pending }

	private _error?: unknown
	/** The error of the last failed chunk, if it has not been superseded by a successful one. */
	get error() { return this._error }

	/**
	 * Discards the transient state - a failure, a reported end, or the verdict on a fruitless
	 * chunk - and evaluates fetching anew. To be called to retry after an error, and by the host
	 * whenever the loaded chunks are replaced by a new stream.
	 */
	reset() {
		this._error = undefined
		this.ended = false
		this.arm()
		this.host.requestUpdate()
		this.requestCheck()
	}

	/** Scrolls the container back to the start of the stream. */
	scrollToStart() {
		this.observedContainer?.scrollTo({ top: 0 })
	}

	/** Schedules a check of whether the next chunk shall be fetched - at most once per frame. */
	private requestCheck() {
		if (this.connected === false || this.checkHandle !== undefined) {
			return
		}
		this.checkHandle = requestAnimationFrame(() => {
			this.checkHandle = undefined
			if (this.shallLoad) {
				this.load()
			}
		})
	}

	private connected = false
	private armed = true
	/** Whether a chunk has reported the end of the stream by resolving to `false`. */
	private ended = false
	private interventions = 0
	/**
	 * Unlike @see pending this blocks checks until the chunk has also been measured, so that a check
	 * scheduled by its very render cannot fetch a chunk the measurement may prove unnecessary.
	 */
	private busy = false
	private observedContainer?: Element
	private resizeObserver?: ResizeObserver
	private checkHandle?: number

	override hostConnected() {
		this.connected = true
		this.observe()
		this.requestCheck()
	}

	override hostUpdated() {
		this.observe()
		this.requestCheck()
	}

	override hostDisconnected() {
		this.connected = false
		this.unobserve()
		if (this.checkHandle !== undefined) {
			cancelAnimationFrame(this.checkHandle)
			this.checkHandle = undefined
		}
	}

	private observe() {
		const container = this.options.container ?? undefined

		if (container === this.observedContainer) {
			return
		}

		this.unobserve()
		this.observedContainer = container

		if (container) {
			container.addEventListener('scroll', this.handleContainerChange, { passive: true })
			this.resizeObserver = new ResizeObserver(this.handleContainerChange)
			this.resizeObserver.observe(container)
		}
	}

	private unobserve() {
		this.observedContainer?.removeEventListener('scroll', this.handleContainerChange)
		this.resizeObserver?.disconnect()
		this.resizeObserver = undefined
		this.observedContainer = undefined
	}

	private readonly handleContainerChange = () => {
		// An errored stream is revived by an explicit reset only, lest scrolling or resizing hammers a failing source.
		if (this._error === undefined) {
			this.armed = true
		}
		this.requestCheck()
	}

	/**
	 * Arms the controller and invalidates the verdict of a chunk which is still settling,
	 * so that a reset is not overruled by the very chunk it is meant to supersede.
	 */
	private arm() {
		this.armed = true
		this.interventions++
	}

	private get shallLoad() {
		const container = this.observedContainer
		return this.connected
			&& this.armed
			&& this.busy === false
			&& this.ended === false
			&& container !== undefined
			// A container without a layout is either not rendered yet or hidden, e.g. inside a closed popover.
			&& container.clientHeight > 0
			&& this.options.disabled !== true
			// Half a viewport of remaining content is close enough to the end to load the next chunk.
			&& this.distanceToEnd(container) <= container.clientHeight / 2
	}

	private distanceToEnd(container: Element) {
		return container.scrollHeight - container.scrollTop - container.clientHeight
	}

	/**
	 * A growing measure of how much content the container holds, telling an appended chunk from a
	 * fruitless one. The scroll height alone does not suffice, as it is clamped to the client height
	 * and therefore stands still while the first chunks are still filling up the container.
	 */
	private contentHeight(container: Element) {
		if (container.scrollHeight > container.clientHeight) {
			return container.scrollHeight
		}
		const top = container.getBoundingClientRect().top - container.scrollTop
		return Math.max(0, ...[...container.children].map(child => child.getBoundingClientRect().bottom - top))
	}

	private async load() {
		const container = this.observedContainer

		if (!container) {
			return
		}

		const contentHeight = this.contentHeight(container)
		const interventions = this.interventions

		this.busy = true
		this._pending = true
		this._error = undefined
		this.host.requestUpdate()

		let hasNextChunk: boolean | void = undefined
		try {
			hasNextChunk = await this.options.fetchNext()
		} catch (error) {
			this._error = error
		} finally {
			this._pending = false
			this.host.requestUpdate()
		}

		// The chunk has been handed over to the host, but is only measurable once the host has rendered it.
		await this.host.updateComplete
		await new Promise(resolve => requestAnimationFrame(resolve))

		// A reset in the meantime has already decided that loading shall go on.
		if (this.interventions === interventions) {
			this.ended = hasNextChunk === false
			this.armed = this._error === undefined
				&& (this.observedContainer !== container || this.contentHeight(this.observedContainer) > contentHeight)
		}

		this.busy = false
		this.requestCheck()
	}
}