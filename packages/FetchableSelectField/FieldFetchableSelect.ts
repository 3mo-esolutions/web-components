import { component, css, property, event, html, type HTMLTemplateResult } from '@a11d/lit'
import { hasChanged } from '@a11d/equals'
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
 * @attr optionTemplate - The template to render the options.
 *
 * @fires parametersChange
 * @fires dataFetch
 */
@component('mo-field-fetchable-select')
export class FieldFetchableSelect<T, TDataFetcherParameters extends FieldFetchableSelectParametersType = void> extends FieldSelect<T> {
	private static readonly fetchedOptionsRenderLimit = 250

	@event() readonly dataFetch!: EventDispatcher<Array<T>>

	@property({ type: Number }) optionsRenderLimit = FieldFetchableSelect.fetchedOptionsRenderLimit
	@property({ type: Object }) optionTemplate?: (data: T, index: number, array: Array<T>) => HTMLTemplateResult

	@property({ type: Object, hasChanged }) parameters?: TDataFetcherParameters
	@property({ type: Object, hasChanged }) searchParameters?: (keyword: string) => Partial<TDataFetcherParameters>

	@property({ type: Object, hasChanged }) fetch?: (parameters: TDataFetcherParameters | undefined) => Promise<Array<T>>

	readonly fetcherController = new FetcherController(this, {
		fetch: async ([parameters]) => {
			const data = await this.fetch?.(parameters) || []
			this.dataFetch.dispatch(data)
			return data
		},
		args: () => [this.parameters]
	})

	private readonly searchFetcherController = new FetcherController(this, {
		throttle: 500,
		autoRun: false,
		fetch: ([parameters]) => !this.hasSearchInput ? Promise.resolve([]) : this.fetch?.(parameters) || Promise.resolve([]),
		args: () => [{ ...this.parameters, ...this.searchParameters?.(this.searchKeyword) ?? {} } as TDataFetcherParameters] as const
	})

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
		this.toggleAttribute('fetching', this.fetcherController.pending || this.searchFetcherController.pending)
		return super.template
	}

	protected override search() {
		return !this.searchParameters ? super.search() : this.searchFetcherController.run()
	}

	requestFetch() {
		return this.fetcherController.run()
	}

	protected override get showNoOptionsHint() {
		return super.showNoOptionsHint && !this.searchFetcherController.pending && !this.fetcherController.pending
	}

	protected override get optionsTemplate() {
		return html`
			${super.optionsTemplate}
			${this.fetchedOptionsTemplate}
		`
	}

	protected get fetchedOptionsTemplate() {
		return html`
			${(this.hasSearchInput && !!this.searchParameters ? this.searchFetcherController.value : this.fetcherController.value)?.slice(0, this.optionsRenderLimit)?.map((value, index, data) => this.optionTemplate?.(value, index, data) ?? html`
				<mo-option .data=${value} value=${index}>${value}</mo-option>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-fetchable-select': FieldFetchableSelect<unknown>
	}
}