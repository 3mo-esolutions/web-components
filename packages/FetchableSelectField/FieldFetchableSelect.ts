import { component, css, property, event, html, type HTMLTemplateResult } from '@a11d/lit'
import { hasChanged } from '@a11d/equals'
import { FetcherController } from '@3mo/fetcher-controller'
import { FieldSelect } from '@3mo/select-field'
import '@3mo/localization'

export type FieldFetchableSelectParametersType = Record<string, unknown> | void

/**
 * A select field whose options are fetched, and searched for on the server as the user types.
 *
 * @element mo-field-fetchable-select
 *
 * @attr optionsRenderLimit - The maximum number of fetched options to render.
 * @attr parameters - The parameters to pass to the fetch function; a change fetches again.
 * @attr searchParameters - A function turning the typed text into parameters for the fetch function when searching.
 * @attr fetch - The function to fetch the data.
 * @attr optionTemplate - The template to render an option for each fetched item.
 *
 * @i18n "Searching"
 * @i18n "Loading"
 * @i18n "Type to search"
 *
 * @fires dataFetch - The fetched data.
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
		args: () => [this.parameters],
	})

	/** Its results name the keyword they answer. */
	private readonly searchFetcherController = new FetcherController(this, {
		throttle: 500,
		autoRun: false,
		fetch: async ([parameters, keyword]) => ({ keyword, data: !this.hasSearchInput ? [] : await this.fetch?.(parameters) ?? [] }),
		args: () => [{ ...this.parameters, ...this.searchParameters?.(this.searchKeyword) ?? {} } as TDataFetcherParameters, this.searchKeyword] as const,
	})

	private get searchesOnServer() {
		return !!this.searchParameters && this.hasSearchInput
	}

	/** Only those of what is typed now, never those of what was typed before. */
	private get searchResults() {
		const results = this.searchFetcherController.value
		return results?.keyword === this.searchKeyword ? results.data : undefined
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
		this.toggleAttribute('fetching', this.fetcherController.pending || this.searchFetcherController.pending)
		return super.template
	}

	protected override search() {
		return !this.searchParameters ? super.search() : this.searchFetcherController.run()
	}

	requestFetch() {
		return this.fetcherController.run()
	}

	protected override get hint() {
		if (this.searchesOnServer && !this.searchResults) {
			return t('Searching')
		}
		if (this.fetcherController.pending && !this.options.length) {
			return t('Loading')
		}
		if (!this.freeInput && !this.hasSearchInput && !!this.searchParameters && !this.listItems.length) {
			return t('Type to search')
		}
		return super.hint
	}

	protected override get optionsTemplate() {
		return html`
			${super.optionsTemplate}
			${this.fetchedOptionsTemplate}
		`
	}

	protected get fetchedOptionsTemplate() {
		return html`
			${(this.searchesOnServer ? this.searchResults : this.fetcherController.value)?.slice(0, this.optionsRenderLimit)?.map((value, index, data) => this.optionTemplate?.(value, index, data) ?? html`
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
