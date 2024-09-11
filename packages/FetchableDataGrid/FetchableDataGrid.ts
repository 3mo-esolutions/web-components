import { Binder, component, css, event, html, ifDefined, property } from '@a11d/lit'
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

Localizer.dictionaries.add('de', {
	'Make a filter selection': 'Filterauswahl vornehmen',
	'Refetch': 'Neu laden',
	'Reset all filters': 'Alle Filter zurücksetzen',
})

const deepCloneKeepingClasses = <T = {}>(origin: T) => {
	const clonedObject = structuredClone(origin)
	for (const keyName in origin) {
		if (origin[keyName] instanceof DateTimeRange) {
			const { start, end } = origin[keyName]
			clonedObject[keyName] = new DateTimeRange(start, end) as T[Extract<keyof T, string>]
		}
	}
	return clonedObject
}

/**
 * @element mo-fetchable-data-grid
 *
 * @attr fetch - A function that fetches the data from the server.
 * @attr silentFetch - If set, the DataGrid's content will not be cleared when the fetch is initiated.
 * @attr parameters - The parameters that are passed to the fetch function.
 * @attr paginationParameters - The parameters that are passed to the fetch function when the page changes. This enables server-side pagination.
 * @attr sortParameters - The parameters that are passed to the fetch function when the sort changes. This enables server-side sorting.
 *
 * @slot error-no-selection - A slot for displaying an error message when user action is required in order for DataGrid to initiate the fetch.
 *
 * @fires parametersChange
 * @fires dataFetch
 */
@component('mo-fetchable-data-grid')
// @ts-ignore `sidePanelTemplate` is private in `DataGrid`
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
	@property({ type: Object }) paginationParameters?: (parameters: { readonly page: number, readonly pageSize: number }) => Partial<TDataFetcherParameters>
	@property({ type: Object }) sortParameters?: () => Partial<TDataFetcherParameters>
	// protected filterParameters?: () => TDataFetcherParameters

	initialParameters!: TDataFetcherParameters

	protected readonly parametersBinder = new Binder<TDataFetcherParameters>(this, 'parameters')

	protected fetchDirty?(parameters: TDataFetcherParameters): Array<TData> | undefined

	readonly fetcherController = new FetcherController<Result<TData> | undefined>(this, {
		throttle: 500,
		fetch: async () => {
			if (!this.parameters) {
				return undefined
			}
			if (!this.initialParameters) {
				this.initialParameters = deepCloneKeepingClasses(this.parameters)
			}
			const paginationParameters = this.paginationParameters?.({ page: this.page, pageSize: this.pageSize }) ?? {}
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

			mo-circular-progress {
				position: absolute;
				width: 48px;
				height: 48px;
				inset-inline-start: 50%;
				inset-block-start: 50%;
				transform: translate(-50%, calc(-50% + var(--mo-data-grid-header-height) / 2));
			}

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

	override setPage(...args: Parameters<DataGrid<TData, TDetailsElement>['setPage']>) {
		const changed = this.page !== args[0]
		super.setPage(...args)
		if (this.hasServerSidePagination && changed) {
			this.requestFetch()
		}
	}

	override setPagination(...args: Parameters<DataGrid<TData, TDetailsElement>['setPagination']>) {
		const changed = this.pagination !== args[0]
		super.setPagination(...args)
		if (this.hasServerSidePagination && changed) {
			this.resetPageAndRequestFetch()
		}
	}

	override sort(...args: Parameters<DataGrid<TData, TDetailsElement>['sort']>) {
		super.sort(...args)
		if (this.hasServerSideSort) {
			this.resetPageAndRequestFetch()
		}
	}

	private resetPageAndRequestFetch() {
		this.setPage(1)
		this.requestFetch()
	}

	protected override get dataSkip() {
		return !this.hasServerSidePagination ? super.dataSkip : 0
	}

	protected override get dataTake() {
		return !this.hasServerSidePagination ? super.dataTake : Number.MAX_SAFE_INTEGER
	}

	override async * getCsvData() {
		const data = new Array<TData>()
		const pageSize = 500
		const parameters = { ...this.parameters } as TDataFetcherParameters
		const sortParameters = this.sortParameters?.() ?? {} as TDataFetcherParameters

		let dataLength = this.dataLength
		let hasNextPage = true
		let page = 1
		while (true) {
			const paginationParameters = this.paginationParameters?.({ page, pageSize }) ?? {}
			const result = await this.fetch({
				...parameters,
				...paginationParameters,
				...sortParameters,
			}) ?? []
			if (result instanceof Array) {
				data.push(...result)
				hasNextPage = false
				dataLength = data.length
			} else {
				dataLength = result.dataLength ?? 0
				hasNextPage = result.hasNextPage ?? (page < Math.ceil(result.dataLength / pageSize))
				data.push(...result.data)
			}
			page++
			yield Math.min(Math.floor(data.length / dataLength * 100) / 100, 1)
			if (!hasNextPage) {
				break
			}
		}

		return [...this.getFlattenedData(data)]
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

	private _preventFetch = false
	async runPreventingFetch(action: () => void | PromiseLike<void>) {
		this._preventFetch = true
		const result = action()
		if (result instanceof Promise) {
			await result
		}
		this._preventFetch = false
	}

	async requestFetch() {
		if (this._preventFetch) {
			return
		}

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
				?data-selected=${this.fetcherController.isFetching}
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
			<mo-circular-progress></mo-circular-progress>
		`
	}

	protected get noSelectionTemplate() {
		return html`
			<slot name='error-no-selection'>
				<mo-empty-state icon='touch_app'>${t('Make a filter selection')}</mo-empty-state>
			</slot>
		`
	}

	override get sidePanelTemplate() {
		return html`
			<mo-data-grid-side-panel
				.dataGrid=${this as any}
				tab=${ifDefined(this.sidePanelTab)}
			>
				<slot slot='settings' name='settings'>${this.settingsDefaultTemplate}</slot>
				<slot slot='filter' name='filter'>
					${this.filtersDefaultTemplate}

					${[html.nothing, undefined].includes(this.filtersDefaultTemplate) || !this.hasFilters ? html.nothing : html`
						<mo-button type='raised'
							?disabled=${!this.hasParametersChanged}
							@click=${() => this.restoreDefaultParameters()}
						>
							${t('Reset all filters')}
						</mo-button>
					`}
				</slot>
			</mo-data-grid-side-panel>
		`
	}

	private get hasParametersChanged() {
		return JSON.stringify(this.parameters) !== JSON.stringify(this.initialParameters)
	}

	private restoreDefaultParameters = () => {
		this.parameters = deepCloneKeepingClasses(this.initialParameters)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-fetchable-data-grid': FetchableDataGrid<unknown, Record<string, never>>
	}
}