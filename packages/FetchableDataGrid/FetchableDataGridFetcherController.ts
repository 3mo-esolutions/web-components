import { FetcherController } from '@3mo/fetcher-controller'
import { DataGridSelectionBehaviorOnDataChange } from '@3mo/data-grid'
import { type FetchableDataGrid, type FetchableDataGridResult } from './FetchableDataGrid.js'

type FetchOptions = {
	readonly silent?: boolean
}

export class FetchableDataGridFetcherController<TData> extends FetcherController<FetchableDataGridResult<TData> | undefined> {
	constructor(override readonly host: FetchableDataGrid<TData, any, any>) {
		super(host, {
			throttle: 500,
			fetch: async () => {
				if (!this.host.parameters) {
					return undefined
				}

				const paginationParameters = this.host.paginationParameters?.({ page: this.host.page, pageSize: this.host.pageSize }) ?? {}
				const sortParameters = this.host.sortParameters?.() ?? {}
				const data = await this.host.fetch({
					...this.host.parameters,
					...paginationParameters,
					...sortParameters,
				}) ?? []
				this.host.dataFetch.dispatch(data)

				return data
			},
		})
	}

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

	override async fetch(options?: FetchOptions): Promise<FetchableDataGridResult<TData> | undefined> {
		if (this._preventFetch) {
			return
		}

		this.silent = options?.silent ?? (this.host.silentFetch
			&& this.host.data.length > 0
			&& !this.host.hasServerSidePagination
			&& !this.host.hasServerSideSort
		)

		this._hasNextPage = undefined
		this._dataLength = undefined

		const result = await super.fetch() || []

		if (!(result instanceof Array)) {
			this._dataLength = result.dataLength
			this._hasNextPage = result.hasNextPage ?? (this.host.page < Math.ceil(result.dataLength / this.host.pageSize))
		}

		this.host.setData(
			result instanceof Array ? result : result.data,
			this.silent ? DataGridSelectionBehaviorOnDataChange.Maintain : this.host.selectionBehaviorOnDataChange,
		)

		return result
	}

	private _preventFetch = false
	async runPreventingFetch(action: () => void | PromiseLike<void>) {
		this._preventFetch = true
		const result = action()
		if (result instanceof Promise) {
			await result
		}
		this._preventFetch = false
	}

	private _autoRefetch?: number
	get autoRefetch() { return this._autoRefetch }
	set autoRefetch(value: number | undefined) {
		this._autoRefetch = value
		this.host.requestUpdate()
		this.updateTimer()
	}

	private timerId?: number
	private updateTimer() {
		window.clearInterval(this.timerId)
		this.timerId = undefined
		if (this.autoRefetch) {
			this.timerId = window.setInterval(() => {
				if (!this.isFetching) {
					this.fetch({ silent: true })
				}
			}, this.autoRefetch * 1000)
		}
	}
}