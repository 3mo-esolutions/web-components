import { Component, component, css, FetcherController, html, state } from '@3mo/del'
import { countryOf, flag, people, respond } from '../../stories/index.js'
import './PersonCard.js'

const countries = [...new Set(people.map(person => person.country))]
	.map(countryOf)
	.sort((a, b) => a.label.localeCompare(b.label))

const searchPeople = (keyword: string, country: string) => respond(people.filter(person =>
	[person.name, person.occupation].some(text => text.toLowerCase().includes(keyword.toLowerCase()))
	&& (!country || person.country === country)
), 400)

/** The people of a company as cards, searched by name or job and filtered by country. */
@component('recipe-team-directory')
export class TeamDirectory extends Component {
	@state() private keyword = ''
	@state() private country = ''

	readonly fetcherController = new FetcherController(this, {
		throttle: 300,
		args: () => [this.keyword, this.country] as const,
		fetch: ([keyword, country]) => searchPeople(keyword, country),
	})

	static override get styles() {
		return css`
			mo-field-search { flex: 1 1 240px; }
			mo-field-select { flex: 0 1 240px; }
			mo-linear-progress { visibility: hidden; }
			mo-linear-progress[data-pending] { visibility: visible; }
			mo-empty-state { height: 320px; }
		`
	}

	protected override get template() {
		const team = this.fetcherController.value
		return html`
			<mo-section heading='Team'>
				<span slot='action'>${!team ? '' : team.length === 1 ? '1 person' : `${team.length} people`}</span>
				<mo-flex gap='16px'>
					<mo-flex direction='horizontal' wrap='wrap' gap='8px'>
						<mo-field-search label='Name or job' @input=${(event: CustomEvent<string | undefined>) => this.keyword = event.detail ?? ''}></mo-field-search>
						<mo-field-select label='Country' default='All countries' reflectDefault @change=${(event: CustomEvent<string | undefined>) => this.country = event.detail ?? ''}>
							${countries.map(country => html`
								<mo-option value=${country.code}>
									<img width='20' alt='' src=${flag(country.code, 20)}>
									${country.label}
								</mo-option>
							`)}
						</mo-field-select>
					</mo-flex>
					<mo-linear-progress ?data-pending=${this.fetcherController.pending}></mo-linear-progress>
					${team?.length === 0 ? html`<mo-empty-state icon='person_search'>Nobody matches the search</mo-empty-state>` : html`
						<mo-grid columns='repeat(auto-fill, minmax(260px, 1fr))' gap='16px'>
							${team?.map(person => html`<recipe-person-card .person=${person}></recipe-person-card>`)}
						</mo-grid>
					`}
				</mo-flex>
			</mo-section>
		`
	}
}