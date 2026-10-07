import { Component, component, css, html, state } from '@a11d/lit'
import { FetcherController } from '@3mo/fetcher-controller'
import '@3mo/text-fields'
import '@3mo/linear-progress'
import { people } from '../../../stories/index.js'

/** A search that fetches as the keyword changes, at most every half second, from a server that takes 800 milliseconds to answer. */
@component('story-people-search')
export class PeopleSearch extends Component {
	@state() private keyword = ''

	readonly fetcherController = new FetcherController(this, {
		throttle: 500,
		args: () => [this.keyword] as const,
		fetch: async ([keyword]) => {
			await new Promise(resolve => setTimeout(resolve, 800))
			return people.map(person => person.name).filter(name => name.toLowerCase().includes(keyword.toLowerCase()))
		},
	})

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.5rem; inline-size: 20rem; }
			mo-linear-progress { visibility: hidden; }
			mo-linear-progress[data-pending] { visibility: visible; }
			ul { margin: 0; padding-inline-start: 1.25rem; }
		`
	}

	protected override get template() {
		return html`
			<mo-field-search label='Search people' @input=${(event: CustomEvent<string | undefined>) => this.keyword = event.detail ?? ''}></mo-field-search>
			<mo-linear-progress ?data-pending=${this.fetcherController.pending}></mo-linear-progress>
			<ul>
				${this.fetcherController.value?.map(name => html`<li>${name}</li>`)}
			</ul>
		`
	}
}
