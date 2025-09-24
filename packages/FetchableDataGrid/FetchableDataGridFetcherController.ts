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
			args: () => [{
				...this.host.parameters ?? {},
				...this.host.paginationParameters?.({ page: this.host.page, pageSize: this.host.pageSize }) ?? {},
				...this.host.sortParameters?.() ?? {},
			}]
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
		if (!(result instanceof Array)) {
			this._dataLength = result.dataLength
			this._hasNextPage = result.hasNextPage ?? (this.host.page < Math.ceil(result.dataLength / this.host.pageSize))
		}

		this.host.setData(
			result instanceof Array ? result : result.data,
			this.silent ? DataGridSelectionBehaviorOnDataChange.Maintain : this.host.selectionBehaviorOnDataChange,
		)

		this.host.dataFetch.dispatch(result)
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