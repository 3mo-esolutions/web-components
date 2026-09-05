import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, html, property, repeat, state } from '@a11d/lit'
import p from './package.json'
import { NavigabilityController, type NavigabilityFocus } from './NavigabilityController.js'

export default {
	title: 'Utilities / Navigability',
	package: p,
} as Meta

type Person = { readonly id: number, readonly name: string, readonly role: string }

const people: ReadonlyArray<Person> = [
	['Ada Lovelace', 'Analyst'], ['Alan Turing', 'Cryptanalyst'], ['Grace Hopper', 'Rear Admiral'],
	['Edsger Dijkstra', 'Author'], ['Barbara Liskov', 'Professor'], ['Donald Knuth', 'Typesetter'],
	['Margaret Hamilton', 'Director'], ['Ken Thompson', 'Pilot'], ['Leslie Lamport', 'Clock-watcher'],
	['Frances Allen', 'Optimiser'], ['Tony Hoare', 'Apologist'], ['Niklaus Wirth', 'Pronunciation Guide'],
].map(([name, role], index) => ({ id: index + 1, name: name!, role: role! }))

const styles = css`
	:host { display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start; }

	.panel { display: flex; flex-direction: column; gap: 0.5rem; min-width: 20rem; }

	input {
		font: inherit; padding: 0.5rem 0.75rem;
		border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
		background: var(--mo-color-surface); color: var(--mo-color-foreground);
	}

	.list {
		display: flex; flex-direction: column; gap: 2px;
		max-height: 16rem; overflow-y: auto;
		outline: none;
	}

	.item {
		display: flex; align-items: center; gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--mo-border-radius);
		background: var(--mo-color-transparent-gray-3);
		color: var(--mo-color-foreground);
		cursor: default;
		user-select: none;
		outline: none;

		.role { margin-inline-start: auto; color: var(--mo-color-gray); font-size: small; }

		/* The stamped attribute is the whole styling contract. */
		&[data-navigability=current] { box-shadow: inset 0 0 0 2px var(--mo-color-accent); }
		&[data-navigability-method=keyboard] { background: color-mix(in srgb, var(--mo-color-accent), transparent 85%); }

		&[disabled], &[data-filtered] { opacity: 0.4; }
		&[data-filtered] { display: none; }
	}

	.readout { display: flex; flex-direction: column; gap: 0.75rem; min-width: 17rem; }
	h4 { margin: 0 0 0.35rem; color: var(--mo-color-gray); font-size: small; text-transform: uppercase; letter-spacing: 0.05em; }
	code { color: var(--mo-color-accent); }
	.hint { color: var(--mo-color-gray); font-size: small; line-height: 1.5; }
`

/**
 * The list draws nothing of its own about the cursor: the controller stamps `data-navigability` and
 * either the tab order (`roving`) or `aria-activedescendant` (`activedescendant`), and the list styles
 * the stamp. Everything below is the same controller under different options.
 */
@component('story-navigability')
class StoryNavigability extends Component {
	@property() focus: NavigabilityFocus = 'roving'
	@property({ type: Boolean }) wrap = false
	@property({ type: Boolean }) typeahead = true
	@property({ type: Array }) disabled = new Array<number>()

	@state() private search = ''
	@state() private log = new Array<string>()

	private readonly controller = new NavigabilityController<Person, StoryNavigability>(this, host => ({
		get items() { return people },
		key: person => person.id,
		isNavigable: person => !host.disabled.includes(person.id) && host.matches(person),
		get focus() { return host.focus },
		get keyboardTarget() { return host.focus === 'activedescendant' ? host.renderRoot.querySelector('input') ?? host : host },
		get wrap() { return host.wrap },
		get typeahead() { return host.typeahead && host.focus === 'roving' },
		handleChange: ({ item, index, method }) => host.log = [`${method}: ${item?.name ?? 'none'} (${index ?? '–'})`, ...host.log].slice(0, 8),
	}))

	private matches(person: Person) {
		return !this.search || person.name.toLowerCase().includes(this.search.toLowerCase())
	}

	static override get styles() { return styles }

	protected override get template() {
		return html`
			<div class='panel'>
				${this.focus !== 'activedescendant' ? html.nothing : html`
					<input placeholder='Type to filter, arrows to move' role='combobox' aria-controls='list' aria-expanded='true'
						.value=${this.search}
						@input=${(e: Event) => this.search = (e.target as HTMLInputElement).value}
					>
				`}
				<div id='list' class='list' role='listbox' tabindex=${this.focus === 'activedescendant' ? -1 : 0}>
					${repeat(people, person => person.id, (person, index) => html`
						<div class='item' role='option'
							${this.controller.item({ index, data: person, disabled: this.disabled.includes(person.id) })}
							?disabled=${this.disabled.includes(person.id)}
							?data-filtered=${!this.matches(person)}
						>
							<span>${person.name}</span>
							<span class='role'>${person.role}</span>
						</div>
					`)}
				</div>
			</div>
			<div class='readout'>
				<div>
					<h4>Current</h4>
					<code>${this.controller.current?.name ?? 'none'}</code> at index <code>${this.controller.index ?? '–'}</code>
				</div>
				<div>
					<h4>Changes</h4>
					${this.log.map(entry => html`<div class='hint'>${entry}</div>`)}
				</div>
				<div class='hint'>
					Arrows move, Home/End jump, PageUp/PageDown page geometrically, typing finds. Disabled and filtered items are
					stepped over; when the items change under the cursor it re-resolves its item by key and otherwise snaps to the
					nearest navigable one.
				</div>
			</div>
		`
	}
}

StoryNavigability

export const Roving: StoryObj = {
	args: { wrap: false, typeahead: true },
	render: ({ wrap, typeahead }) => html`<story-navigability focus='roving' ?wrap=${wrap} ?typeahead=${typeahead} .disabled=${[3, 7]}></story-navigability>`,
}

export const ActiveDescendant: StoryObj = {
	name: 'Active descendant (searchable)',
	render: () => html`<story-navigability focus='activedescendant'></story-navigability>`,
}

export const Wrapping: StoryObj = {
	render: () => html`<story-navigability focus='roving' wrap></story-navigability>`,
}