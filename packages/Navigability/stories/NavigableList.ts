import { Component, component, css, event, html, property } from '@a11d/lit'
import { NavigabilityController, type NavigabilityMethod } from '@3mo/navigability'
import { people, type Person } from '../../../stories/index.js'

/** A list whose items take focus in turn: the controller keeps the cursor, the tab order and the `data-navigability` stamp the styles read. */
@component('story-navigable-list')
export class NavigableList extends Component {
	@event() readonly change!: EventDispatcher<{ readonly name?: string, readonly index?: number, readonly method: NavigabilityMethod }>

	@property({ type: Boolean }) wrap = false
	@property({ type: Boolean }) typeahead = false
	/** The indices of the people who cannot be reached. */
	@property({ type: Array }) disabled = new Array<number>()

	readonly navigability = new NavigabilityController<Person, NavigableList>(this, host => ({
		items: people,
		key: person => person.id,
		get wrap() { return host.wrap },
		get typeahead() { return host.typeahead },
		handleChange: ({ item, index, method }) => host.change.dispatch({ name: item?.name, index, method }),
	}))

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 2px; inline-size: 20rem; max-block-size: 16rem; overflow-y: auto; }
			[role=option] {
				display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-1); cursor: default; user-select: none; outline: none;
			}
			[role=option][data-navigability=current] { box-shadow: inset 0 0 0 2px var(--mo-color-accent); }
			[role=option][data-navigability-method=keyboard] { background: color-mix(in srgb, var(--mo-color-accent), transparent 85%); }
			[role=option][aria-disabled=true] { opacity: 0.4; }
			small { color: var(--mo-color-gray); }
		`
	}

	protected override connected() {
		this.setAttribute('role', 'listbox')
	}

	protected override get template() {
		return html`
			${people.map((person, index) => html`
				<div role='option' aria-disabled=${this.disabled.includes(index)} ${this.navigability.item({ index, data: person, disabled: this.disabled.includes(index) })}>
					${person.name}
					<small>${person.occupation}</small>
				</div>
			`)}
		`
	}
}