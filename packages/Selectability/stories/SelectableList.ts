import { Component, component, css, event, html, property, state } from '@a11d/lit'
import { Selectability, SelectabilityAllState, SelectabilityController, SelectabilityStrategy } from '@3mo/selectability'
import '@3mo/checkbox'
import { people as characters, type Person } from '../../../stories/index.js'

const people = characters.slice(0, 12)

/** A listbox that holds no selection logic of its own: the controller handles clicks, keys and ARIA. */
@component('story-selectable-list')
export class SelectableList extends Component {
	@event() readonly change!: EventDispatcher<ReadonlyArray<Person>>

	@property() selectability = Selectability.Multiple
	@property() strategy = SelectabilityStrategy.Replace
	@property({ type: Array }) unselectable = new Array<number>()
	@property({ type: Boolean }) selectAll = false

	@state() private selection = new Array<Person>()

	readonly selectabilityController: SelectabilityController<Person>

	constructor() {
		super()
		const list = this
		this.selectabilityController = new SelectabilityController<Person>(this, {
			get selectability() { return list.selectability },
			get strategy() { return list.strategy },
			get selection() { return list.selection },
			items: people,
			key: person => person.id,
			isSelectable: person => !list.unselectable.includes(person.id),
			handleChange: ({ selection }) => {
				list.selection = [...selection]
				list.change.dispatch(list.selection)
			},
		})
	}

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 2px; inline-size: 20rem; }
			[role=option] { display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; border-radius: var(--mo-border-radius); cursor: pointer; user-select: none; }
			[role=option]:hover { background: var(--mo-color-transparent-gray-1); }
			[role=option][data-selectability=selected] { background: var(--mo-color-accent); color: var(--mo-color-on-accent); }
			[role=option][aria-disabled=true] { opacity: 0.4; cursor: not-allowed; }
			[role=option]:focus-visible { outline: 2px solid var(--mo-color-accent); outline-offset: 1px; }
			small { opacity: 0.7; }
		`
	}

	protected override connected() {
		this.setAttribute('role', 'listbox')
	}

	protected override get template() {
		const allState = this.selectabilityController.allState
		return html`
			${!this.selectAll ? html.nothing : html`
				<mo-checkbox label='Select all'
					.selected=${allState === SelectabilityAllState.All ? true : allState === SelectabilityAllState.Some ? 'indeterminate' : false}
					@change=${() => this.selectabilityController.toggleAll()}
				></mo-checkbox>
			`}
			${people.map((person, index) => html`
				<div role='option' tabindex='0' aria-disabled=${this.unselectable.includes(person.id)}
					${this.selectabilityController.item({ index, data: person, disabled: this.unselectable.includes(person.id) })}
				>
					${person.name}
					<small>${person.occupation}</small>
				</div>
			`)}
		`
	}
}
