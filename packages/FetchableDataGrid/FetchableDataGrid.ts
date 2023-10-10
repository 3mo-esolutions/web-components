/* eslint-disable @typescript-eslint/member-ordering */
import { component, css, event, html, property, style } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import { Localizer } from '@3mo/localization'
import { FetcherController } from '@3mo/fetcher-controller'
import { DataGrid, DataGridSelectionBehaviorOnDataChange } from '@3mo/data-grid'

export type FetchableDataGridParametersType = Record<string, unknown>

type NonPaginatedResult<TData> = Array<TData>

type PaginatedResult<TData> = Readonly<{ data: NonPaginatedResult<TData> } & ({
	hasNextPage: boolean
	dataLength?: undefined
} | {
	hasNextPage?: undefined
	dataLength: number
})>

type Result<TData> = PaginatedResult<TData> | NonPaginatedResult<TData>

Localizer.register('de', {
	'Make a filter selection': 'Filterauswahl vornehmen',
	'Refetch': 'Neu laden',
})

/**
 * @element mo-fetchable-data-grid
 *
 * @slot error-no-selection - A slot for displaying an error message when user action is required in order for DataGrid to initiate the fetch.
 *
 * @fires parametersChange {CustomEvent<TDataFetcherParameters>}
 * @fires dataFetch {CustomEvent<Result<TData>>}
 */
@component('mo-fetchable-data-grid')
export class FetchableDataGrid<TData, TDataFetcherParameters extends FetchableDataGridParametersType = Record<string, never>, TDetailsElement extends Element | undefined = undefined> extends DataGrid<TData, TDetailsElement> {
	@event() readonly parametersChange!: EventDispatcher<TDataFetcherParameters | undefined>
	@event() readonly dataFetch!: EventDispatcher<Result<TData>>

	@property({ type: Object }) fetch: (parameters: TDataFetcherParameters) => Promise<Result<TData>> = () => Promise.resolve([])
	@property({ type: Boolean }) silentFetch = false

	@property({
		type: Object,
		updated(this: FetchableDataGrid<TData, TDataFetcherParameters>, value?: TDataFetcherParameters) {
			// Ignore if the data is being set directly
			if (!value && this.data.length > 0) {
				return
			}

			// "CustomEvent"s convert undefined values to null on event handling
			for (const key in value) {
				if (value[key] === null) {
					delete value[key]
				}
			}

			this.resetPageAndRequestFetch()
		}
	}) parameters?: TDataFetcherParameters
	@property({ type: Object }) paginationParameters?: () => Partial<TDataFetcherParameters>
	@property({ type: Object }) sortParameters?: () => Partial<TDataFetcherParameters>
	// protected filterParameters?: () => TDataFetcherParameters

	protected fetchDirty?(parameters: TDataFetcherParameters): Array<TData> | undefined

	readonly fetcherController = new FetcherController<Result<TData> | undefined>(this, {
		throttle: 500,
		fetch: async () => {
			if (!this.parameters) {
				return undefined
			}

			const paginationParameters = this.paginationParameters?.() ?? {}
			const sortParameters = this.sortParameters?.() ?? {}
			const data = await this.fetch({
				...this.parameters,
				...paginationParameters,
				...sortParameters,
			}) ?? []
			this.dataFetch.dispatch(data)

			return data
		},
	})

	static override get styles() {
		return css`
			${super.styles}

			:host([fetching]) mo-icon-button[icon=refresh] {
				animation: rotate 1500ms ease-in-out infinite;
			}

			@keyframes rotate {
				from {
					transform: rotate(0deg);
				}
				to {
					transform: rotate(360deg);
				}
			}
		`
	}

	get hasServerSidePagination() {
		return this.paginationParameters !== undefined
	}

	get hasServerSideSort() {
		return this.sortParameters !== undefined
	}

	setParameters(parameters: TDataFetcherParameters) {
		this.parameters = parameters
		this.parametersChange.dispatch(this.parameters)
	}

	override handlePageChange(...args: Parameters<DataGrid<TData, TDetailsElement>['handlePageChange']>) {
		super.handlePageChange(...args)
		if (this.hasServerSidePagination) {
			this.requestFetch()
		}
	}

	override handlePaginationChange(...args: Parameters<DataGrid<TData, TDetailsElement>['handlePaginationChange']>) {
		super.handlePaginationChange(...args)
		if (this.hasServerSidePagination) {
			this.resetPageAndRequestFetch()
		}
	}

	override handleSortChange(...args: Parameters<DataGrid<TData, TDetailsElement>['handleSortChange']>) {
		super.handleSortChange(...args)
		if (this.hasServerSideSort) {
			this.resetPageAndRequestFetch()
		}
	}

	private resetPageAndRequestFetch() {
		this.setPage(1)
		this.requestFetch()
	}

	override get renderData() {
		if (this.hasFooter === false) {
			return this.sortedData
		}
		return this.hasServerSidePagination
			? this.sortedData.slice(0, this.pageSize)
			: super.renderData
	}

	override get hasPagination() {
		return super.hasPagination || this.hasServerSidePagination
	}

	override get supportsDynamicPageSize() {
		return super.supportsDynamicPageSize && !this.hasServerSidePagination
	}

	private _hasNextPage?: boolean
	override get hasNextPage() {
		return this._hasNextPage ?? super.hasNextPage
	}

	private _dataLength = 0
	override get dataLength() {
		return this.hasServerSidePagination ? this._dataLength : super.dataLength
	}

	protected get shallFetchSilently() {
		return this.silentFetch
			&& this.data.length > 0
			&& !this.hasServerSidePagination
			&& !this.hasServerSideSort
	}

	async requestFetch() {
		if (this.parameters && this.fetchDirty) {
			const dirtyData = this.fetchDirty(this.parameters)
			if (dirtyData) {
				this.data = dirtyData
			}
		}

		const result = await this.fetcherController.fetch() || []

		if (!(result instanceof Array)) {
			this._dataLength = result.dataLength ?? 0
			this._hasNextPage = result.hasNextPage ?? (this.page < Math.ceil(result.dataLength / this.pageSize))
		}

		this.setData(
			result instanceof Array ? result : result.data,
			this.shallFetchSilently ? DataGridSelectionBehaviorOnDataChange.Maintain : this.selectionBehaviorOnDataChange,
		)
	}

	protected override get toolbarActionsTemplate() {
		return html`
			<mo-icon-button icon='refresh'
				${tooltip(t('Refetch'))}
				${style({ color: this.fetcherController.isFetching ? 'var(--mo-color-accent)' : 'var(--mo-color-gray)' })}
				@click=${() => this.requestFetch()}
			></mo-icon-button>
			${super.toolbarActionsTemplate}
		`
	}

	protected override get contentTemplate() {
		this.toggleAttribute('fetching', this.fetcherController.isFetching)
		switch (true) {
			case this.fetcherController.isFetching && this.shallFetchSilently === false:
				return this.fetchingTemplate
			case this.data.length === 0 && this.parameters === undefined:
				return this.noSelectionTemplate
			default:
				return super.contentTemplate
		}
	}

	private get fetchingTemplate() {
		return html`
			<mo-circular-progress ${style({ width: '48px', height: '48px', margin: 'auto' })}></mo-circular-progress>
		`
	}

	protected get noSelectionTemplate() {
		return html`
			<slot name='error-no-selection'>
				<mo-empty-state icon='touch_app'>${t('Make a filter selection')}</mo-empty-state>
			</slot>
		`
	}

	protected override get selectionToolbarTemplate() {
		return this.fetcherController.isFetching ? html.nothing : super.selectionToolbarTemplate
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-fetchable-data-grid': FetchableDataGrid<unknown, Record<string, never>>
	}
}