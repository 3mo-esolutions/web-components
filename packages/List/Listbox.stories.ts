import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, ElementRef, html, property, state } from '@a11d/lit'
import { Selectability } from '@3mo/selectability'
import p from './package.json'
import { ListboxController, type ListboxOrientation } from './ListboxController.js'

export default {
	title: 'Utilities / Listbox',
	package: p,
} as Meta

const storyStyles = css`
	:host { display: flex; gap: 2.5rem; flex-wrap: wrap; align-items: flex-start; }
	.panel { display: flex; flex-direction: column; gap: 0.75rem; }
	h4, label { margin: 0; color: var(--mo-color-gray); font-size: small; text-transform: uppercase; letter-spacing: 0.05em; }
	.hint { margin: 0; color: var(--mo-color-gray); font-size: small; line-height: 1.7; max-inline-size: 26rem; }
	code { color: var(--mo-color-accent); }
	kbd { font: inherit; padding: 0 0.3em; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: 3px; white-space: nowrap; }

	.listbox {
		display: flex; flex-direction: column; gap: 2px;
		margin: 0; padding: 4px; list-style: none;
		inline-size: 16rem; max-block-size: 20rem; overflow-y: auto;
		border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
		color: var(--mo-color-foreground);
	}
	.listbox[aria-orientation=horizontal] { flex-direction: row; flex-wrap: wrap; inline-size: 28rem; }

	[role=option] { display: flex; justify-content: space-between; padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; outline: none; }
	[role=option]:hover { background: var(--mo-color-transparent-gray-1); }
	[role=option][aria-selected=true] { background: color-mix(in srgb, var(--mo-color-accent), transparent 78%); }
	[role=option][aria-selected=true]::after { content: '✓' / ''; color: var(--mo-color-accent); }
	.listbox:not(:focus-within) [role=option][aria-selected=true] { background: color-mix(in srgb, var(--mo-color-accent), transparent 90%); }
	.listbox:focus-within [role=option][data-navigability=current] { box-shadow: inset 0 0 0 2px var(--mo-color-accent); }
	[role=option][aria-disabled=true] { opacity: 0.45; }

	button {
		font: inherit; padding: 0.35rem 0.75rem; cursor: pointer;
		border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
		background: var(--mo-color-surface); color: var(--mo-color-foreground);
	}
	.actions { display: flex; gap: 0.5rem; }
`

/** Every option inside a listbox, the ones slotted into it included. */
const optionsOf = (listbox: Element | null | undefined): Array<HTMLElement> => [...listbox?.querySelectorAll<HTMLElement>('[role=option], slot') ?? []]
	.flatMap(element => element instanceof HTMLSlotElement ? element.assignedElements({ flatten: true }) as Array<HTMLElement> : [element])
	.filter(element => element.getAttribute('role') === 'option' && !element.hidden)

const nameOf = (element: HTMLElement) => element.getAttribute('aria-label') ?? element.textContent?.trim() ?? ''

/** Reads what the markup says to assistive technology off the stamped attributes, not off the controller. */
@component('story-listbox-readout')
class StoryListboxReadout extends Component {
	@property({ type: Object }) of?: Component

	private readonly observer = new MutationObserver(() => this.requestUpdate())

	protected override updated(changed: Map<PropertyKey, unknown>) {
		if (changed.has('of') && this.of) {
			this.observer.disconnect()
			for (const root of [this.of, this.of.renderRoot]) {
				this.observer.observe(root, { subtree: true, childList: true, attributes: true })
			}
		}
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		this.observer.disconnect()
	}

	private get listbox() { return this.of?.renderRoot.querySelector<HTMLElement>('[role=listbox]') }

	private get combobox() { return this.of?.renderRoot.querySelector<HTMLElement>('[role=combobox]') }

	/** Roughly what a screen reader says on reaching the option; its position counts within its group. */
	private phrase(option: HTMLElement, options: ReadonlyArray<HTMLElement>) {
		const group = option.closest('[role=group]')
		const siblings = options.filter(candidate => candidate.closest('[role=group]') === group)
		const groupLabel = group?.getAttribute('aria-labelledby')
		const label = !groupLabel ? undefined : (group!.getRootNode() as ParentNode).querySelector(`#${groupLabel}`)?.textContent
		const multiple = this.listbox?.getAttribute('aria-multiselectable') === 'true'
		return [
			label ? `${label} group` : undefined,
			nameOf(option),
			option.getAttribute('aria-selected') === 'true' ? 'selected' : multiple ? 'not selected' : undefined,
			option.getAttribute('aria-disabled') === 'true' ? 'unavailable' : undefined,
			`${siblings.indexOf(option) + 1} of ${siblings.length}`,
		].filter(Boolean).join(', ')
	}

	static override get styles() {
		return css`
			${storyStyles}
			:host { display: flex; flex-direction: column; gap: 0.75rem; min-inline-size: 20rem; font-size: small; }
			.phrase { margin: 0; padding: 0.6rem 0.75rem; border-radius: var(--mo-border-radius); background: var(--mo-color-transparent-gray-1); color: var(--mo-color-foreground); font-size: medium; }
			dl { display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 0.75rem; margin: 0; }
			dt { color: var(--mo-color-gray); }
			dd { margin: 0; }
			table { border-collapse: collapse; font-variant-numeric: tabular-nums; }
			th { text-align: start; font-weight: normal; color: var(--mo-color-gray); }
			th, td { padding: 0.2rem 0.75rem 0.2rem 0; }
			tr[data-active] td:first-child { color: var(--mo-color-accent); }
		`
	}

	protected override get template() {
		const listbox = this.listbox
		const combobox = this.combobox
		const options = optionsOf(listbox)
		const active = options.find(option => option.dataset.navigability === 'current')
		return html`
			<h4>What the markup says</h4>
			<p class='phrase'>${active ? this.phrase(active, options) : 'No active option yet'}</p>
			<dl>
				<dt>listbox</dt>
				<dd><code>aria-multiselectable</code> ${listbox?.getAttribute('aria-multiselectable') ?? '–'}, <code>aria-orientation</code> ${listbox?.getAttribute('aria-orientation') ?? '–'}</dd>
				${!combobox ? html.nothing : html`
					<dt>combobox</dt>
					<dd>
						<code>aria-activedescendant</code> points at <code>${combobox.ariaActiveDescendantElement?.textContent?.trim() ?? 'nothing'}</code>
						by element reference. The attribute itself reads <code>"${combobox.getAttribute('aria-activedescendant') ?? ''}"</code>:
						an id could not reach from the input's shadow root to the options.
					</dd>
				`}
			</dl>
			<table>
				<thead>
					<tr>
						<th>option</th>
						<th>aria-selected</th>
						<th>aria-disabled</th>
						<th>tabindex</th>
					</tr>
				</thead>
				<tbody>
					${options.map(option => html`
						<tr ?data-active=${option === active}>
							<td>${nameOf(option)}</td>
							<td>${option.getAttribute('aria-selected') ?? '–'}</td>
							<td>${option.getAttribute('aria-disabled') ?? '–'}</td>
							<td>${option.getAttribute('tabindex') ?? '–'}</td>
						</tr>
					`)}
				</tbody>
			</table>
		`
	}
}

StoryListboxReadout

const fruits = ['Apple', 'Apricot', 'Banana', 'Blackberry', 'Blueberry', 'Cherry', 'Date', 'Fig', 'Grape', 'Kiwi', 'Lemon', 'Mango']

/** One fruit out of twelve. Selection moves with the arrow keys only when asked to. */
@component('story-listbox-single')
class StoryListboxSingle extends Component {
	@property({ type: Boolean }) selectionFollowsFocus = false
	@property() orientation: ListboxOrientation = 'vertical'

	@state() private selection: ReadonlyArray<string> = []

	readonly fruits = new ListboxController<string, StoryListboxSingle>(this, host => ({
		get selection() { return host.selection },
		handleChange: selection => host.selection = selection,
		get selectionFollowsFocus() { return host.selectionFollowsFocus },
		get orientation() { return host.orientation },
	}))

	static override get styles() { return storyStyles }

	protected override get template() {
		const [previous, next] = this.orientation === 'horizontal' ? ['←', '→'] : ['↑', '↓']
		return html`
			<div class='panel'>
				<h4 id='label'>Fruit</h4>
				<ul class='listbox' aria-labelledby='label' ${this.fruits.listbox.ref()}>
					${fruits.map((fruit, index) => html`<li ${this.fruits.option({ index, data: fruit })}>${fruit}</li>`)}
				</ul>
				<p class='hint'>Chosen: <code>${this.selection[0] ?? 'nothing'}</code></p>
				<p class='hint'>
					Tab in, then <kbd>${previous}</kbd> <kbd>${next}</kbd>, <kbd>Home</kbd> and <kbd>End</kbd> move, and typing a name
					finds it. <kbd>Space</kbd> or <kbd>Enter</kbd> selects${this.selectionFollowsFocus ? ', though here the arrows already do' : ''}.
				</p>
			</div>
			<story-listbox-readout .of=${this}></story-listbox-readout>
		`
	}
}

StoryListboxSingle

export const PickOne: StoryObj<{ selectionFollowsFocus: boolean, orientation: ListboxOrientation }> = {
	args: { selectionFollowsFocus: false, orientation: 'vertical' },
	argTypes: { orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
	render: ({ selectionFollowsFocus, orientation }) => html`
		<story-listbox-single .selectionFollowsFocus=${selectionFollowsFocus} .orientation=${orientation}></story-listbox-single>
	`,
}

type Topping = { readonly name: string, readonly soldOut?: boolean }

const toppings: ReadonlyArray<Topping> = [
	{ name: 'Mozzarella' }, { name: 'Tomato' }, { name: 'Basil' }, { name: 'Mushrooms' }, { name: 'Olives' }, { name: 'Onions' },
	{ name: 'Peppers' }, { name: 'Pepperoni' }, { name: 'Ham' }, { name: 'Pineapple' }, { name: 'Anchovies', soldOut: true }, { name: 'Jalapeños' },
]

/** Toppings, as many as wanted, without holding a modifier key. One is sold out. */
@component('story-listbox-multiple')
class StoryListboxMultiple extends Component {
	@state() private selection: ReadonlyArray<Topping> = []

	readonly toppings = new ListboxController<Topping, StoryListboxMultiple>(this, host => ({
		selectability: Selectability.Multiple,
		get selection() { return host.selection },
		handleChange: selection => host.selection = selection,
	}))

	static override get styles() { return storyStyles }

	protected override get template() {
		return html`
			<div class='panel'>
				<h4 id='label'>Toppings</h4>
				<ul class='listbox' aria-labelledby='label' ${this.toppings.listbox.ref()}>
					${toppings.map((topping, index) => html`
						<li ${this.toppings.option({ index, data: topping, disabled: topping.soldOut })}>${topping.name}${topping.soldOut ? ' (sold out)' : ''}</li>
					`)}
				</ul>
				<div class='actions'>
					<button @click=${() => this.selection = toppings.filter(topping => !topping.soldOut)}>Select all</button>
					<button @click=${() => this.selection = []}>Clear</button>
				</div>
				<p class='hint'>Chosen: <code>${this.selection.length}</code> of ${toppings.length}</p>
				<p class='hint'>
					<kbd>Space</kbd> or a click toggles one. <kbd>Shift</kbd> with <kbd>↑</kbd> <kbd>↓</kbd> extends the selection,
					<kbd>Shift</kbd> <kbd>Space</kbd> selects from the last one chosen, <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Home</kbd>
					or <kbd>End</kbd> selects to either end, and <kbd>Ctrl</kbd> <kbd>A</kbd> selects everything, or nothing once
					everything is. The buttons do the same for anyone who cannot use those keys.
				</p>
			</div>
			<story-listbox-readout .of=${this}></story-listbox-readout>
		`
	}
}

StoryListboxMultiple

export const PickSeveral: StoryObj = {
	render: () => html`<story-listbox-multiple></story-listbox-multiple>`,
}

/**
 * A field shaped like a select: its input lives in the field's own shadow root, the options are the
 * consumer's light DOM. Focus never leaves the input; the active option is announced on it by element
 * reference, which is the only kind of reference that reaches across that boundary.
 */
@component('story-listbox-combobox')
class StoryListboxCombobox extends Component {
	@state() private query = ''
	@state() private chosen?: string

	private readonly input = new ElementRef<HTMLInputElement>()

	readonly cities = new ListboxController<string, StoryListboxCombobox>(this, host => ({
		get combobox() { return host.input.value },
		handleChange: ([city]) => host.chosen = city,
	}))

	/** The options are the consumer's, so nothing rendered them: the matching ones are registered by hand. */
	protected override willUpdate() {
		const query = this.query.toLowerCase()
		let index = 0
		for (const option of this.children as HTMLCollectionOf<HTMLElement>) {
			option.hidden = !option.textContent!.toLowerCase().includes(query)
			if (option.hidden) {
				this.cities.indexability.unregister(option)
			} else {
				this.cities.indexability.register(option, { index: index++, data: option.textContent!.trim() })
			}
		}
	}

	static override get styles() {
		return css`
			${storyStyles}
			input {
				font: inherit; padding: 0.5rem 0.75rem; inline-size: 16rem; box-sizing: border-box;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); color: var(--mo-color-foreground);
			}
			.listbox ::slotted([role=option]) { padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; }
			.listbox ::slotted([role=option]:hover) { background: var(--mo-color-transparent-gray-1); }
			.listbox ::slotted([aria-selected=true]) { background: color-mix(in srgb, var(--mo-color-accent), transparent 78%); }
			input:focus ~ .listbox ::slotted([data-navigability=current]) { box-shadow: inset 0 0 0 2px var(--mo-color-accent); }
		`
	}

	protected override get template() {
		return html`
			<div class='panel'>
				<label for='input'>City</label>
				<input id='input' role='combobox' aria-autocomplete='list' aria-expanded='true' aria-controls='listbox'
					autocomplete='off' placeholder='Type to filter'
					.value=${this.query}
					@input=${(event: InputEvent) => this.query = (event.target as HTMLInputElement).value}
					${this.input.ref()}
				>
				<div id='listbox' class='listbox' aria-label='Cities' ${this.cities.listbox.ref()}>
					<slot></slot>
				</div>
				<p class='hint'>Chosen: <code>${this.chosen ?? 'nothing'}</code></p>
				<p class='hint'>
					Type to filter, <kbd>↑</kbd> <kbd>↓</kbd> to move, <kbd>Enter</kbd> or a click to choose. <kbd>Home</kbd>,
					<kbd>End</kbd>, <kbd>←</kbd>, <kbd>→</kbd> and <kbd>Space</kbd> stay the input's. Opening, closing and
					completing belong to the combobox controller that builds on this one; here the list stays open.
				</p>
			</div>
			<story-listbox-readout .of=${this}></story-listbox-readout>
		`
	}
}

StoryListboxCombobox

const cities = [
	'Amsterdam', 'Athens', 'Barcelona', 'Berlin', 'Brussels', 'Budapest', 'Copenhagen', 'Dublin', 'Hamburg', 'Helsinki',
	'Lisbon', 'London', 'Madrid', 'Oslo', 'Paris', 'Prague', 'Rome', 'Stockholm', 'Vienna', 'Warsaw',
]

export const FilterAsYouType: StoryObj = {
	render: () => html`
		<story-listbox-combobox>
			${cities.map(city => html`<div>${city}</div>`)}
		</story-listbox-combobox>
	`,
}

const produce = [
	{ label: 'Fruit', items: ['Apple', 'Banana', 'Cherry', 'Mango'] },
	{ label: 'Vegetables', items: ['Carrot', 'Leek', 'Pea', 'Spinach'] },
]

/** Options in labelled groups. The order runs on across the groups; a screen reader counts within each. */
@component('story-listbox-grouped')
class StoryListboxGrouped extends Component {
	@state() private selection: ReadonlyArray<string> = []

	readonly produce = new ListboxController<string, StoryListboxGrouped>(this, host => ({
		get selection() { return host.selection },
		handleChange: selection => host.selection = selection,
	}))

	static override get styles() {
		return css`
			${storyStyles}
			.group-label { padding: 0.6rem 0.75rem 0.25rem; color: var(--mo-color-gray); font-size: small; }
		`
	}

	protected override get template() {
		const all = produce.flatMap(group => group.items)
		return html`
			<div class='panel'>
				<div class='listbox' aria-label='Produce' ${this.produce.listbox.ref()}>
					${produce.map((group, groupIndex) => html`
						<div role='group' aria-labelledby='group-${groupIndex}'>
							<div role='presentation' id='group-${groupIndex}' class='group-label'>${group.label}</div>
							${group.items.map(item => html`<div ${this.produce.option({ index: all.indexOf(item), data: item })}>${item}</div>`)}
						</div>
					`)}
				</div>
				<p class='hint'>Chosen: <code>${this.selection[0] ?? 'nothing'}</code></p>
				<p class='hint'>The arrows run straight on from one group into the next.</p>
			</div>
			<story-listbox-readout .of=${this}></story-listbox-readout>
		`
	}
}

StoryListboxGrouped

export const Grouped: StoryObj = {
	render: () => html`<story-listbox-grouped></story-listbox-grouped>`,
}