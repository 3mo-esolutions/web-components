import { FetcherController } from '@3mo/fetcher-controller'
import { DataGridSelectionBehaviorOnDataChange } from '@3mo/data-grid'
import { type FetchableDataGrid, type FetchableDataGridResult } from './FetchableDataGrid.js'

type FetchOptions = { readonly silent?: boolean }

type Arguments<T> = [parameters: FetchableDataGrid<T>['parameters']]

export class FetchableDataGridFetcherController<TData> extends FetcherController<FetchableDataGridResult<TData> | undefined, Arguments<TData>> {
	constructor(override readonly host: FetchableDataGrid<TData, any, any>) {
		super(host, {
			throttle: 500,
			fetch: ([parameters]) => !parameters ? Promise.resolve(undefined) : this.host.fetch(parameters),
			// While infinite-scrolling, "fetchNextPage" fetches the pages after the first one,
			// so they must not be part of the arguments which trigger a run of this task.
			args: () => [this.getParameters(this.host.hasInfiniteScroll ? 1 : this.host.page)]
		})
	}

	disabled = false

	private _hasNextPage?: boolean
	get hasNextPage() { return this._hasNextPage ?? false }

	private _dataLength?: number
	get dataLength() { return this._dataLength }

	private _silent = false
	get silent() { return this._silent }
	set silent(value: boolean) {
		this._silent = value
		this.host.requestUpdate()
	}

	/** The last page which has been fetched into the stream. */
	private lastFetchedPage = 1

	/** Discriminates the pages of the current stream from those of an already superseded one. */
	private generation = 0

	fetch(options?: FetchOptions) {
		this.silent = options?.silent ?? (this.host.silentFetch
			&& this.host.data.length > 0
			&& !this.host.hasServerSidePagination
			&& !this.host.hasServerSideSort
		)

		return this.run()
	}

	override async run(args?: Arguments<TData>) {
		if (this.disabled) {
			return
		}

		await super.run(args)

		const result = this.value || []
		const data = result instanceof Array ? result : result.data

		this.generation++
		this.lastFetchedPage = 1
		this.updatePaginationState(result, this.host.hasInfiniteScroll ? 1 : this.host.page)

		this.host.setData(
			data,
			this.silent ? DataGridSelectionBehaviorOnDataChange.Maintain : this.host.selectionBehaviorOnDataChange,
		)

		this.host.dataFetch.dispatch(result)

		if (this.host.hasInfiniteScroll) {
			// The stream starts over, therefore whatever the previous one has loaded is scrolled past.
			if (this.silent === false) {
				this.host.infiniteScrollController.scrollToStart()
			}
			this.host.infiniteScrollController.reset()
		}
	}

	/**
	 * Fetches the page following the last one and appends it to the stream.
	 * @returns whether another page follows.
	 */
	async fetchNextPage() {
		if (this.disabled || !this.host.hasInfiniteScroll || !this.hasNextPage) {
			return false
		}

		const generation = this.generation
		const page = this.lastFetchedPage + 1
		const result = await this.host.fetch(this.getParameters(page)) ?? []

		// The stream has been replaced while this page was in flight, so it does not belong to it anymore.
		if (generation !== this.generation) {
			return this.hasNextPage
		}

		const data = result instanceof Array ? result : result.data

		this.lastFetchedPage = page
		this.updatePaginationState(result, page)
		this.host.setData([...this.host.data, ...data], DataGridSelectionBehaviorOnDataChange.Maintain)
		this.host.dataFetch.dispatch(result)

		return this.hasNextPage
	}

	private getParameters(page: number) {
		return {
			...this.host.parameters ?? {},
			...this.host.paginationParameters?.({ page, pageSize: this.host.pageSize }) ?? {},
			...this.host.sortParameters?.() ?? {},
		} as FetchableDataGrid<TData>['parameters']
	}

	private updatePaginationState(result: FetchableDataGridResult<TData>, page: number) {
		if (!(result instanceof Array)) {
			this._dataLength = result.dataLength
			this._hasNextPage = (result.hasNextPage ?? (page < Math.ceil(result.dataLength / this.host.pageSize)))
				// An empty page ends the stream regardless of what the server claims, lest the same page is requested indefinitely.
				&& (!this.host.hasInfiniteScroll || result.data.length > 0)
		} else if (this.host.hasInfiniteScroll) {
			// A bare array carries no pagination information, so a page which is not full is assumed to be the last one.
			this._dataLength = undefined
			this._hasNextPage = result.length >= this.host.pageSize
		}
	}

	private timerId?: number
	updateTimer() {
		window.clearInterval(this.timerId)
		if (this.host.autoRefetch) {
			this.timerId = window.setInterval(() => {
				if (!this.pending) {
					this.fetch({ silent: true })
				}
			}, this.host.autoRefetch * 1000)
		}
	}
}