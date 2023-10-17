import { component, css, property, event, html, HTMLTemplateResult, PropertyValues, eventListener } from '@a11d/lit'
import { FetcherController } from '@3mo/fetcher-controller'
import { FieldSelect } from '@3mo/select-field'

export type FieldFetchableSelectParametersType = Record<string, unknown> | void

/**
 * @element mo-field-fetchable-select
 *
 * @attr optionsRenderLimit - The maximum number of options to render.
 * @attr parameters - The parameters to pass to the fetch function.
 * @attr searchParameters - The parameters to pass to the fetch function when searching.
 * @attr fetch - The function to fetch the data.
 * @attr threshold - How far from the end (in units of visible length of the list) the bottom edge of the list must be from the end of the content to trigger the `@endReached` callback.
 * @attr paginated - If `true`, will trigger `@pageChange` on user reaches the bottom the edge of the list
 * @attr optionTemplate - The template to render the options.
 *
 * @fires parametersChange {CustomEvent<TDataFetcherParameters | undefined>}
 * @fires dataFetch {CustomEvent<Array<T>>}
 * @fires pageChange {CustomEvent<void>}
 */
@component('mo-field-fetchable-select')
export class FieldFetchableSelect<T, TDataFetcherParameters extends FieldFetchableSelectParametersType = void> extends FieldSelect<T> {
	private static readonly fetchedOptionsRenderLimit = 250

	@event() readonly dataFetch!: EventDispatcher<Array<T>>
	@event() readonly pageChange!: EventDispatcher<void>

	@property({ type: Number }) threshold = 0.8
	@property({ type: Boolean }) paginated = false
	@property({ type: Number }) optionsRenderLimit = FieldFetchableSelect.fetchedOptionsRenderLimit
	@property({ type: Object }) optionTemplate?: (data: T, index: number, array: Array<T>) => HTMLTemplateResult

	@property({ type: Object, updated(this: FieldFetchableSelect<T>) { this.requestFetch() } }) parameters?: TDataFetcherParameters
	@property({ type: Object }) searchParameters?: (keyword: string) => Partial<TDataFetcherParameters>

	@property({ type: Object }) fetch?: (parameters: TDataFetcherParameters | undefined) => Promise<Array<T>>

	readonly fetcherController = new FetcherController(this, {
		throttle: 500,
		fetch: async () => {
			const searchParameters = this.searchParameters?.(this.searchKeyword) ?? {}
			const parameters = {
				...this.parameters,
				...searchParameters
			} as TDataFetcherParameters
			const data = await this.fetch?.(parameters) || []
			this.dataFetch.dispatch(data)
			return data
		},
	})

	@eventListener('endReached')
	protected onEndReached() {
		if (this.paginated) {
			this.pageChange.dispatch()
		}
	}

	static override get styles() {
		return css`
			${super.styles}

			:host([fetching]) mo-field:after {
				visibility: visible;
				animation: fetching 1s linear infinite;
			}

			@keyframes fetching {
				0% {
					inset-inline-start: -40%;
					width: 0%;
				}
				50% {
					inset-inline-start: 20%;
					width: 80%;
				}
				100% {
					inset-inline-start: 100%;
					width: 100%;
				}
			}
		`
	}

	protected override get template() {
		this.toggleAttribute('fetching', this.fetcherController.isFetching)
		return super.template
	}

	protected override firstUpdated(props: PropertyValues<this>) {
		super.firstUpdated(props)
		if (!this.parameters) {
			this.requestFetch()
		}
	}

	protected override async search() {
		if (!this.searchParameters) {
			return super.search()
		} else {
			await this.requestFetch()
		}
	}

	requestFetch() {
		return this.fetcherController.fetch()
	}

	protected override get optionsTemplate() {
		return html`
			${super.optionsTemplate}
			${this.fetchedOptionsTemplate}
		`
	}

	protected get fetchedOptionsTemplate() {
		return html`
			${this.fetcherController.data?.slice(0, this.optionsRenderLimit)?.map((data, index, array) => this.optionTemplate?.(data, index, array) ?? html`
				<mo-option .data=${data} value=${index} fetched>${data}</mo-option>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-fetchable-select': FieldFetchableSelect<unknown>
	}
}