import { Controller, event, ReactiveControllerHost } from '@a11d/lit'
import { Throttler } from '@3mo/throttler'
import { Enqueuer } from './index.js'

type Options<T> = {
	readonly fetch: () => T | PromiseLike<T>
	throttle?: number
}

export class FetcherController<T> extends Controller {
	@event() readonly fetched!: EventDispatcher<T>

	protected readonly fetchEnqueuer = new Enqueuer()
	protected readonly throttler = new Throttler(this.options?.throttle ?? 0)

	constructor(protected override readonly host: ReactiveControllerHost, protected readonly options: Options<T>) {
		super(host)
	}

	protected _isFetching = false
	get isFetching() { return this._isFetching }
	protected set isFetching(value) {
		this._isFetching = value
		this.host.requestUpdate()
	}

	protected _data?: T
	get data() { return this._data }
	protected set data(value) {
		this._data = value
		this.host.requestUpdate()
	}

	async fetch() {
		this.isFetching = true
		await this.throttler.throttle()
		const fetchPromiseOrResult = this.options.fetch()
		this.data = fetchPromiseOrResult instanceof Promise
			? await this.fetchEnqueuer.enqueue<T>(fetchPromiseOrResult)
			: await fetchPromiseOrResult
		this.isFetching = false
		this.fetched.dispatch(this.data)
		return this.data
	}
}