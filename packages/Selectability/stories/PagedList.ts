import { Component, component, css, html, state } from '@a11d/lit'
import { Selectability, SelectabilityController } from '@3mo/selectability'
import '@3mo/icon-button'
import { people as characters, type Person } from '../../../stories/index.js'

const people = characters.slice(0, 12)

/** A listbox that renders one page at a time, while the controller selects across all of them. */
@component('story-paged-list')
export class PagedList extends Component {
	private static readonly pageSize = 4

	@state() private page = 0
	@state() private selection = new Array<Person>()

	readonly selectabilityController: SelectabilityController<Person>

	constructor() {
		super()
		const list = this
		this.selectabilityController = new SelectabilityController<Person>(this, {
			selectability: Selectability.Multiple,
			items: people,
			get selection() { return list.selection },
			key: person => person.id,
			handleChange: ({ selection }) => list.selection = [...selection],
		})
	}

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 2px; inline-size: 20rem; }
			[role=option] { padding: 0.5rem 0.75rem; border-radius: var(--mo-border-radius); cursor: pointer; user-select: none; }
			[role=option]:hover { background: var(--mo-color-transparent-gray-1); }
			[role=option][data-selectability=selected] { background: var(--mo-color-accent); color: var(--mo-color-on-accent); }
			footer { display: flex; align-items: center; gap: 0.5rem; padding-block-start: 0.5rem; }
			footer span { flex: 1; color: var(--mo-color-gray); font-size: small; }
		`
	}

	protected override connected() {
		this.setAttribute('role', 'listbox')
	}

	protected override get template() {
		const start = this.page * PagedList.pageSize
		const pages = Math.ceil(people.length / PagedList.pageSize)
		return html`
			${people.slice(start, start + PagedList.pageSize).map((person, index) => html`
				<div role='option' tabindex='0' ${this.selectabilityController.item({ index: start + index, data: person })}>${person.name}</div>
			`)}
			<footer>
				<span>${this.selection.length} of ${people.length} selected</span>
				<mo-icon-button icon='chevron_left' ?disabled=${this.page === 0} @click=${() => this.page--}></mo-icon-button>
				<mo-icon-button icon='chevron_right' ?disabled=${this.page === pages - 1} @click=${() => this.page++}></mo-icon-button>
			</footer>
		`
	}
}
