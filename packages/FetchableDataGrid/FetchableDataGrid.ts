import { Binder, component, css, event, html, property, bind } from '@a11d/lit'
import { hasChanged } from '@a11d/equals'
import { Localizer } from '@3mo/localization'
import { DataGrid } from '@3mo/data-grid'
import { FetchableDataGridFetcherController } from './FetchableDataGridFetcherController.js'
import './FetchableDataGridRefetchIconButton.js'

export type FetchableDataGridParametersType = Record<string, unknown>

type NonPaginatedResult<TData> = Array<TData>

type PaginatedResult<TData> = Readonly<{ data: NonPaginatedResult<TData> } & ({
	hasNextPage: boolean
	dataLength?: undefined
} | {
	hasNextPage?: undefined
	dataLength: number
})>

export type FetchableDataGridResult<TData> = PaginatedResult<TData> | NonPaginatedResult<TData>

Localizer.dictionaries.add('de', {
	'Make a filter selection': 'Filterauswahl vornehmen',
})

/**
 * @element mo-fetchable-data-grid
 *
 * @attr fetch - A function that fetches the data from the server.
 * @attr silentFetch - If set, the DataGrid's content will not be cleared when the fetch is initiated.
 * @attr parameters - The parameters that are passed to the fetch function.
 * @attr paginationParameters - The parameters that are passed to the fetch function when the page changes. This enables server-side pagination.
 * @attr sortParameters - The parameters that are passed to the fetch function when the sort changes. This enables server-side sorting.
 * @attr autoRefetch - The interval in seconds at which the data should be refetched automatically. If set, the DataGrid will automatically refetch the data at the specified interval.
 *
 * @slot error-no-selection - A slot for displaying an error message when user action is required in order for DataGrid to initiate the fetch.
 *
 * @fires parametersChange
 * @fires dataFetch
 */
@component('mo-fetchable-data-grid')
export class FetchableDataGrid<TData, TDataFetcherParameters extends FetchableDataGridParametersType = Record<string, never>, TDetailsElement extends Element | undefined = undefined> extends DataGrid<TData, TDetailsElement> {
	@event() readonly parametersChange!: EventDispatcher<TDataFetcherParameters | undefined>
	@event() readonly dataFetch!: EventDispatcher<FetchableDataGridResult<TData>>

	@property({ type: Object, hasChanged }) fetch: (parameters: TDataFetcherParameters) => Promise<FetchableDataGridResult<TData>> = () => Promise.resolve([])
	@property({ type: Boolean }) silentFetch = false

	@property({ type: Object, hasChanged }) parameters?: TDataFetcherParameters
	@property({ type: Object, hasChanged }) paginationParameters?: (parameters: { readonly page: number, readonly pageSize: number }) => Partial<TDataFetcherParameters>
	@property({ type: Object, hasChanged }) sortParameters?: () => Partial<TDataFetcherParameters>

	@property({ type: Number, updated(this: FetchableDataGrid<TData, TDataFetcherParameters, TDetailsElement>) { this.fetcherController.updateTimer() } }) autoRefetch?: number

	readonly fetcherController = new FetchableDataGridFetcherController<TData>(this)

	override get hasNextPage() {
		return !this.hasServerSidePagination ? super.hasNextPage : this.fetcherController.hasNextPage
	}

	override get dataLength() {
		return !this.hasServerSidePagination ? super.dataLength : this.fetcherController.dataLength
	}

	requestFetch(...parameters: Parameters<typeof this.fetcherController.fetch>) {
		return this.fetcherController.fetch(...parameters)
	}

	protected readonly parametersBinder = new Binder<TDataFetcherParameters>(this, 'parameters')

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

		return this.getFlattenedData(data)
	}

	override get hasPagination() {
		return super.hasPagination || this.hasServerSidePagination
	}

	override get supportsDynamicPageSize() {
		return super.supportsDynamicPageSize && !this.hasServerSidePagination
	}

	protected override get toolbarActionsTemplate() {
		return html`
			<mo-fetchable-data-grid-refetch-icon-button
				?fetching=${this.fetcherController.pending}
				autoRefetch=${bind(this, 'autoRefetch')}
				@requestFetch=${() => this.requestFetch()}
			></mo-fetchable-data-grid-refetch-icon-button>
			${super.toolbarActionsTemplate}
		`
	}

	protected override get contentTemplate() {
		this.toggleAttribute('fetching', this.fetcherController.pending)
		switch (true) {
			case this.fetcherController.pending && this.fetcherController.silent === false:
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
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-fetchable-data-grid': FetchableDataGrid<unknown, Record<string, never>>
	}
}