import { Component, component, css, ElementRef, event, html, repeat, state } from '@a11d/lit'
import { NavigabilityController, type NavigabilityMethod } from '@3mo/navigability'
import { people, type Person } from '../../../stories/index.js'

/** Focus stays in the search input while the arrows move a cursor announced through `aria-activedescendant`. */
@component('story-searchable-list')
export class SearchableList extends Component {
	@event() readonly change!: EventDispatcher<{ readonly name?: string, readonly index?: number, readonly method: NavigabilityMethod }>

	@state() private search = ''

	private readonly input = new ElementRef<HTMLInputElement>()

	private get results() {
		const search = this.search.toLowerCase()
		return people.filter(person => person.name.toLowerCase().includes(search))
	}

	readonly navigability = new NavigabilityController<Person, SearchableList>(this, host => ({
		get items() { return host.results },
		key: person => person.id,
		focus: 'activedescendant',
		get keyboardTarget(): EventTarget { return host.input.value ?? host },
		handleChange: ({ item, index, method }) => host.change.dispatch({ name: item?.name, index, method }),
	}))

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.5rem; inline-size: 20rem; }
			input {
				font: inherit; padding: 0.5rem 0.75rem;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); color: var(--mo-color-foreground);
			}
			[role=listbox] { display: flex; flex-direction: column; gap: 2px; max-block-size: 16rem; overflow-y: auto; }
			[role=option] {
				display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-1); cursor: default; user-select: none;
			}
			[role=option][data-navigability=current] { box-shadow: inset 0 0 0 2px var(--mo-color-accent); }
			small { color: var(--mo-color-gray); }
		`
	}

	protected override get template() {
		return html`
			<input role='combobox' aria-label='People' aria-controls='list' aria-expanded='true' placeholder='Type to filter'
				.value=${this.search}
				@input=${(event: Event) => this.search = (event.target as HTMLInputElement).value}
				${this.input.ref()}
			>
			<div id='list' role='listbox' aria-label='People'>
				${repeat(this.results, person => person.id, (person, index) => html`
					<div role='option' ${this.navigability.item({ index, data: person })}>
						${person.name}
						<small>${person.occupation}</small>
					</div>
				`)}
			</div>
		`
	}
}