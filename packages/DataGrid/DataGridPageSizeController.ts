import { Controller, ElementRef, type ReactiveElement } from '@a11d/lit'

export interface DataGridPageSizeControllerOptions {
	readonly rowHeight: number
	readonly header?: Element
	readonly disabled?: boolean
}

/**
 * How many rows fit the height the container gives the grid's scroller, measured whenever the scroller
 * or its content resizes. It keeps the last fit while the container gives no height, and is undefined until it gave one.
 */
export class DataGridPageSizeController<THost extends ReactiveElement = ReactiveElement> extends Controller {
	protected readonly options: DataGridPageSizeControllerOptions

	constructor(
		protected override readonly host: THost,
		options: DataGridPageSizeControllerOptions | ((host: THost) => DataGridPageSizeControllerOptions),
	) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
	}

	private _automatic?: number
	get automatic() { return this._automatic }

	readonly scroller = new ElementRef<HTMLElement>()

	private observer?: ResizeObserver
	private observed?: HTMLElement

	override hostConnected() {
		this.observe()
	}

	override hostUpdated() {
		this.observe()
	}

	override hostDisconnected() {
		this.observe()
	}

	private observe() {
		const scroller = this.options.disabled || !this.host.isConnected ? undefined : this.scroller.value
		if (scroller === this.observed) {
			return
		}
		this.observer?.disconnect()
		this.observer = undefined
		this.observed = scroller
		if (scroller) {
			this.observer = new ResizeObserver(() => this.measure(scroller))
			this.observer.observe(scroller)
			if (scroller.firstElementChild) {
				this.observer.observe(scroller.firstElementChild)
			}
		}
	}

	private measure(scroller: HTMLElement) {
		const content = scroller.firstElementChild as HTMLElement | null
		if (!content || Math.abs(scroller.clientHeight - content.offsetHeight) <= 1) {
			return
		}
		const rowsHeight = scroller.clientHeight - (this.options.header?.clientHeight ?? 0)
		const fit = Math.max(1, Math.floor(rowsHeight / (this.options.rowHeight + 1)))
		if (fit !== this._automatic) {
			this._automatic = fit
			// Not within the observer's own callback, as the update resizes what it observes.
			setTimeout(() => this.host.requestUpdate())
		}
	}
}
