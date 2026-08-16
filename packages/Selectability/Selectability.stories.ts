import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, html, property, state } from '@a11d/lit'
import p from './package.json'
import { Selectability, SelectabilityAllState, SelectabilityController, SelectabilityStrategy } from './SelectabilityController.js'

export default {
	title: 'Utilities / Selectability',
	package: p,
} as Meta

type Person = { readonly id: number, readonly name: string, readonly role: string }

const people: ReadonlyArray<Person> = [
	['Ada Lovelace', 'Analyst'], ['Alan Turing', 'Cryptanalyst'], ['Grace Hopper', 'Rear Admiral'],
	['Edsger Dijkstra', 'Author'], ['Barbara Liskov', 'Professor'], ['Donald Knuth', 'Typesetter'],
	['Margaret Hamilton', 'Director'], ['Ken Thompson', 'Pilot'], ['Leslie Lamport', 'Clock-watcher'],
	['Frances Allen', 'Optimiser'], ['Tony Hoare', 'Apologist'], ['Niklaus Wirth', 'Pronunciation Guide'],
].map(([name, role], index) => ({ id: index + 1, name: name!, role: role! }))

const listStyles = css`
	:host { display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start; }

	.panel { display: flex; flex-direction: column; gap: 0.5rem; min-width: 20rem; }

	.list { display: flex; flex-direction: column; gap: 2px; }

	.item {
		display: flex; align-items: center; gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--mo-border-radius);
		background: var(--mo-color-transparent-gray-3);
		color: var(--mo-color-foreground);
		cursor: pointer;
		user-select: none;

		.role { margin-inline-start: auto; color: var(--mo-color-gray); font-size: small; }

		/* The stamped attribute is the whole styling contract. */
		&[data-selectability=selected] {
			background: var(--mo-color-accent);
			color: var(--mo-color-on-accent);
			.role { color: inherit; opacity: 0.7; }
		}

		&[disabled] { opacity: 0.4; cursor: not-allowed; }

		&:focus-visible { outline: 2px solid var(--mo-color-accent); outline-offset: 1px; }
	}

	.box {
		display: inline-flex; align-items: center; justify-content: center;
		width: 1rem; height: 1rem; flex: 0 0 auto;
		border: 2px solid currentColor; border-radius: 3px;
		font-size: 0.7rem; line-height: 1;
	}

	.readout { display: flex; flex-direction: column; gap: 0.75rem; min-width: 17rem; }
	h4 { margin: 0 0 0.35rem; color: var(--mo-color-gray); font-size: small; text-transform: uppercase; letter-spacing: 0.05em; }
	code { color: var(--mo-color-accent); }
	.hint { color: var(--mo-color-gray); font-size: small; line-height: 1.5; }

	.toolbar { display: flex; align-items: center; gap: 0.75rem; padding-inline: 0.75rem; }
	.toolbar button {
		display: flex; align-items: center; gap: 0.5rem;
		background: none; border: none; padding: 0.35rem 0; cursor: pointer;
		color: var(--mo-color-foreground); font: inherit;
	}
`

/**
 * The list is a plain `role=listbox` of `role=option`s. It has no selection logic of its own — no
 * click handlers, no `selected` bookkeeping, no shift arithmetic. The controller wires itself to the
 * host, resolves each click through the registry, and stamps `data-selectability` and `aria-selected`
 * back onto the elements; everything below is that same controller under different options.
 */
@component('story-selectability')
class StorySelectability extends Component {
	@property() selectability = Selectability.Multiple
	@property() strategy = SelectabilityStrategy.Replace
	@property({ type: Array }) unselectable = new Array<number>()
	@property({ type: Number }) count = 8
	@property({ type: Boolean }) withSelectAll = false

	@state() private selection: ReadonlyArray<Person> = []

	private readonly controller: SelectabilityController<Person>

	constructor() {
		super()
		const component = this
		this.controller = new SelectabilityController<Person>(this, {
			get selectability() { return component.selectability },
			get strategy() { return component.strategy },
			get items() { return people.slice(0, component.count) },
			get selection() { return component.selection },
			key: person => person.id,
			isSelectable: person => !component.unselectable.includes(person.id),
			handleChange: ({ selection }) => this.selection = selection,
		})
	}

	protected override connected() {
		this.setAttribute('role', 'listbox')
	}

	static override get styles() { return listStyles }

	private get selectAllTemplate() {
		const state = this.controller.allState
		return !this.withSelectAll || this.selectability !== Selectability.Multiple ? html.nothing : html`
			<div class='toolbar'>
				<button @click=${() => this.controller.toggleAll()}>
					<span class='box'>${state === SelectabilityAllState.All ? '✓' : state === SelectabilityAllState.Some ? '–' : ''}</span>
					<span>Select all</span>
				</button>
				<span class='hint'>allState: <code>${state}</code></span>
			</div>
		`
	}

	protected override get template() {
		return html`
			<div class='panel'>
				${this.selectAllTemplate}
				<div class='list'>
					${people.slice(0, this.count).map((person, index) => {
						const selectable = !this.unselectable.includes(person.id)
						return html`
							<div class='item' role='option' tabindex='0' ?disabled=${!selectable}
								${this.controller.item({ index, data: person, disabled: !selectable })}
							>
								${this.strategy !== SelectabilityStrategy.Toggle ? html.nothing : html`
									<span class='box'>${this.controller.isSelected(person) ? '✓' : ''}</span>
								`}
								<span>${person.name}</span>
								<span class='role'>${person.role}</span>
							</div>
						`
					})}
				</div>
			</div>

			<div class='readout'>
				<div>
					<h4>selection</h4>
					<div><code>${this.selection.length === 0 ? 'nothing' : this.selection.map(person => person.name).join(', ')}</code></div>
				</div>
				<div>
					<h4>anchor</h4>
					<div><code>${this.controller.anchor?.item.name ?? 'none'}</code> ${!this.controller.anchor ? '' : html`<span class='hint'>(left ${this.controller.anchor.selected ? 'selected' : 'deselected'})</span>`}</div>
				</div>
				<p class='hint'>
					${this.selectability !== Selectability.Multiple ? 'Click to select — only ever one.' : html`
						Click to select. <b>Ctrl/⌘+click</b> adds one. <b>Shift+click</b> extends from the anchor.
						<b>Ctrl/⌘+A</b> takes everything. Shift after a <i>de</i>selection removes the run instead.
					`}
				</p>
			</div>
		`
	}
}

StorySelectability

/** The desktop convention: a plain click replaces, ctrl adds, shift extends. */
export const List: StoryObj = {
	render: () => html`<story-selectability></story-selectability>`
}

/** Where the items ARE checkboxes, every click adds or removes — and shift still extends, which is
 * the gesture select fields and checkbox lists have historically gone without. */
export const ToggleStrategy: StoryObj = {
	render: () => html`<story-selectability strategy='toggle'></story-selectability>`
}

/** One at a time. The range and preserve gestures degrade to a plain select rather than misbehaving. */
export const SingleSelection: StoryObj = {
	render: () => html`<story-selectability selectability='single'></story-selectability>`
}

/** `allState` counts the SELECTABLE items, so a list holding items nobody may select still reaches
 * `all` — the tri-state control cannot get stuck half-filled. */
export const SelectAll: StoryObj = {
	render: () => html`<story-selectability withSelectAll .unselectable=${[3, 6]}></story-selectability>`
}

/** Unselectable items refuse the click, are dropped from select-all, and are stepped OVER by a range
 * rather than dragged into it. */
export const UnselectableItems: StoryObj = {
	render: () => html`<story-selectability .unselectable=${[2, 3, 4]}></story-selectability>`
}

/**
 * Selection is not tied to what is rendered. This list pages four at a time, so a shift-click on the
 * last page extends over items that have no element at all — the same thing a grid does when a range
 * spans a page it has not fetched into the DOM, and a virtualized list when it spans the window.
 */
@component('story-selectability-paged')
class StorySelectabilityPaged extends Component {
	private static readonly pageSize = 4

	@state() private page = 0
	@state() private selection: ReadonlyArray<Person> = []

	private readonly controller: SelectabilityController<Person>

	constructor() {
		super()
		const component = this
		this.controller = new SelectabilityController<Person>(this, {
			selectability: Selectability.Multiple,
			// The FULL universe — every page of it, whether or not it is on screen.
			get items() { return people },
			get selection() { return component.selection },
			key: person => person.id,
			handleChange: ({ selection }) => this.selection = selection,
		})
	}

	protected override connected() {
		this.setAttribute('role', 'listbox')
	}

	private get pageItems() {
		const size = StorySelectabilityPaged.pageSize
		return people.slice(this.page * size, (this.page + 1) * size)
	}

	static override get styles() {
		return css`
			${listStyles}
			.pager { display: flex; align-items: center; gap: 0.5rem; padding-inline: 0.75rem; }
			.pager button {
				padding: 0.25rem 0.6rem; cursor: pointer; font: inherit;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: none; color: var(--mo-color-foreground);
			}
			.pager button[disabled] { opacity: 0.4; cursor: not-allowed; }
		`
	}

	protected override get template() {
		const pages = Math.ceil(people.length / StorySelectabilityPaged.pageSize)
		return html`
			<div class='panel'>
				<div class='pager'>
					<button ?disabled=${this.page === 0} @click=${() => this.page--}>‹</button>
					<span class='hint'>Page ${this.page + 1} of ${pages}</span>
					<button ?disabled=${this.page === pages - 1} @click=${() => this.page++}>›</button>
				</div>
				<div class='list'>
					${this.pageItems.map((person, index) => html`
						<div class='item' role='option' tabindex='0'
							${this.controller.item({ index: this.page * StorySelectabilityPaged.pageSize + index, data: person })}
						>
							<span>${person.name}</span>
							<span class='role'>${person.role}</span>
						</div>
					`)}
				</div>
			</div>

			<div class='readout'>
				<div>
					<h4>selection — ${this.selection.length} of ${people.length}</h4>
					<div><code>${this.selection.length === 0 ? 'nothing' : this.selection.map(person => person.name).join(', ')}</code></div>
				</div>
				<p class='hint'>
					Click someone on the first page, page forward, then <b>shift+click</b>: everything between
					comes along, including the whole page you never opened.
				</p>
			</div>
		`
	}
}

StorySelectabilityPaged

export const BeyondWhatIsRendered: StoryObj = {
	render: () => html`<story-selectability-paged></story-selectability-paged>`
}