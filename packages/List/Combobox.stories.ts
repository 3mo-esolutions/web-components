import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, html, property, state, type PropertyValues } from '@a11d/lit'
import p from './package.json'
import { ComboboxController } from './ComboboxController.js'

export default {
	title: 'Utilities / Combobox',
	package: p,
} as Meta

const storyStyles = css`
	:host { display: flex; gap: 2.5rem; flex-wrap: wrap; align-items: flex-start; }
	.panel { display: flex; flex-direction: column; gap: 0.75rem; }
	h4, label { margin: 0; color: var(--mo-color-gray); font-size: small; text-transform: uppercase; letter-spacing: 0.05em; }
	.hint { margin: 0; color: var(--mo-color-gray); font-size: small; line-height: 1.7; max-inline-size: 26rem; }
	code { color: var(--mo-color-accent); }
	kbd { font: inherit; padding: 0 0.3em; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: 3px; white-space: nowrap; }
`

const nameOf = (element: Element) => element.getAttribute('aria-label') ?? element.textContent?.trim() ?? ''

/** Reads what the markup says to assistive technology off the stamped attributes, not off the controller. */
@component('story-combobox-readout')
class StoryComboboxReadout extends Component {
	@property({ type: Object }) of?: Component

	private readonly observer = new MutationObserver(() => this.requestUpdate())

	protected override updated(changed: PropertyValues<this>) {
		if (changed.has('of') && this.of) {
			this.observer.disconnect()
			this.observer.observe(this.of.renderRoot, { subtree: true, childList: true, attributes: true })
		}
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		this.observer.disconnect()
	}

	/** Roughly what a screen reader says: the option once one is active, the input itself before that. */
	private phrase(combobox: HTMLElement, options: ReadonlyArray<HTMLElement>) {
		const active = combobox.ariaActiveDescendantElement as HTMLElement | null
		if (active) {
			return [
				nameOf(active),
				active.getAttribute('aria-selected') === 'true' ? 'selected' : undefined,
				`${options.indexOf(active) + 1} of ${options.length}`,
			].filter(Boolean).join(', ')
		}
		const label = combobox.getAttribute('aria-label')
			?? (combobox.id ? (combobox.getRootNode() as ParentNode).querySelector(`label[for=${combobox.id}]`)?.textContent : undefined)
		return [
			label,
			'combobox',
			combobox.getAttribute('aria-autocomplete') === 'list' ? 'autocomplete list' : undefined,
			combobox.getAttribute('aria-expanded') === 'true' ? 'expanded' : 'collapsed',
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
		`
	}

	protected override get template() {
		const combobox = this.of?.renderRoot.querySelector<HTMLElement>('[role=combobox]')
		if (!combobox) {
			return html.nothing
		}
		const options = [...this.of!.renderRoot.querySelectorAll<HTMLElement>('[role=option]')]
		const controls = combobox.ariaControlsElements?.[0]
		const active = combobox.ariaActiveDescendantElement
		const trigger = this.of!.renderRoot.querySelector<HTMLElement>('[aria-haspopup]')
		return html`
			<h4>What the markup says</h4>
			<p class='phrase'>${this.phrase(combobox, options)}</p>
			<dl>
				${!trigger ? html.nothing : html`
					<dt>trigger</dt>
					<dd>a <code>${trigger.localName}</code> with <code>aria-haspopup</code> ${trigger.getAttribute('aria-haspopup')} and <code>aria-expanded</code> ${trigger.getAttribute('aria-expanded')}, not the combobox</dd>
				`}
				<dt>aria-expanded</dt>
				<dd>${combobox.getAttribute('aria-expanded')}</dd>
				<dt>aria-autocomplete</dt>
				<dd>${combobox.getAttribute('aria-autocomplete') ?? '–'}</dd>
				<dt>aria-controls</dt>
				<dd>the <code>${controls?.getAttribute('role') ?? 'nothing'}</code> ${controls ? `"${nameOf(controls)}"` : ''}, by element reference</dd>
				<dt>aria-activedescendant</dt>
				<dd>${!active ? 'nothing' : html`<code>${nameOf(active)}</code>, by element reference`}</dd>
				<dt>options</dt>
				<dd>${options.length}, of which <code>${options.filter(option => option.getAttribute('aria-selected') === 'true').map(nameOf).join(', ') || 'none'}</code> selected</dd>
			</dl>
		`
	}
}

StoryComboboxReadout

const cities = [
	'Amsterdam', 'Athens', 'Barcelona', 'Berlin', 'Brussels', 'Budapest', 'Copenhagen', 'Dublin', 'Hamburg', 'Helsinki',
	'Lisbon', 'London', 'Madrid', 'Oslo', 'Paris', 'Prague', 'Rome', 'Stockholm', 'Vienna', 'Warsaw',
]

/**
 * A combobox from the controller alone. The host keeps the input's text, what was typed to filter, whether
 * the list shows and what is chosen; the controller turns an input and a listbox into the pattern around them.
 */
@component('story-combobox')
class StoryCombobox extends Component {
	@state() private query = ''
	@state() private filter = ''
	@state() private open = false
	@state() private selection: ReadonlyArray<string> = []

	readonly cities = new ComboboxController<string, StoryCombobox>(this, host => ({
		get expanded() { return host.expanded },
		handleExpandedChange: open => host.open = open,
		autocomplete: true,
		activateFirst: true,
		get selection() { return host.selection },
		handleChange: selection => host.selection = selection,
	}))

	/** Filtered by what was typed, not by the input's text, so a choice written into the input shows the whole list again. */
	private get filtered() {
		const filter = this.filter.trim().toLowerCase()
		return cities.filter(city => city.toLowerCase().includes(filter))
	}

	private get expanded() {
		return this.open && this.filtered.length > 0
	}

	static override get styles() {
		return css`
			${storyStyles}
			.field { position: relative; }
			input {
				font: inherit; padding: 0.5rem 0.75rem; inline-size: 16rem; box-sizing: border-box;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); color: var(--mo-color-foreground);
			}
			.listbox {
				position: absolute; inset-block-start: calc(100% + 4px); inset-inline-start: 0; z-index: 1;
				display: flex; flex-direction: column; gap: 2px; padding: 4px;
				inline-size: 16rem; max-block-size: 15rem; overflow-y: auto; box-sizing: border-box;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); color: var(--mo-color-foreground);
				box-shadow: 0 4px 12px rgb(0 0 0 / 0.12);
			}
			.listbox[hidden] { display: none; }
			[role=option] { display: flex; justify-content: space-between; padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; }
			[role=option]:hover { background: var(--mo-color-transparent-gray-1); }
			[role=option][aria-selected=true]::after { content: '✓' / ''; color: var(--mo-color-accent); }
			[role=option][data-navigability=current] { background: color-mix(in srgb, var(--mo-color-accent), transparent 82%); }
		`
	}

	protected override get template() {
		return html`
			<div class='panel'>
				<label for='input'>City</label>
				<div class='field'>
					<input id='input' autocomplete='off' placeholder='Type to filter'
						.value=${this.query}
						@input=${(event: InputEvent) => { this.query = this.filter = (event.target as HTMLInputElement).value; this.open = true }}
						@click=${() => this.open = true}
						@blur=${() => this.open = false}
						${this.cities.input.ref()}
					>
					<div class='listbox' aria-label='Cities' ?hidden=${!this.expanded} ${this.cities.listbox.ref()}>
						${this.filtered.map((city, index) => html`
							<div @click=${() => { this.query = city; this.filter = '' }} ${this.cities.option({ index, data: city })}>${city}</div>
						`)}
					</div>
				</div>
				<p class='hint'>Chosen: <code>${this.selection[0] ?? 'nothing'}</code></p>
				<p class='hint'>
					<kbd>↓</kbd> or <kbd>↑</kbd> opens the list and <kbd>Esc</kbd> closes it; while it is open they move, and
					<kbd>Enter</kbd> or a click chooses. Opening lands on the chosen city, each new filter makes its first match
					active so <kbd>Enter</kbd> takes it, and a choice or <kbd>Tab</kbd> closes. Focus stays in the input throughout.
					All of that, the input's ARIA and the selection are the controller's. The host filters, opens on typing and
					on a click, closes on blur, and writes the choice into the input.
				</p>
			</div>
			<story-combobox-readout .of=${this}></story-combobox-readout>
		`
	}
}

StoryCombobox

export const FilterAsYouType: StoryObj = {
	render: () => html`<story-combobox></story-combobox>`,
}

/**
 * A button shows the value and opens a popup with its own search box over the options. The search box
 * is the combobox; the button only opens the popup, so its keys and its ARIA are the host's.
 */
@component('story-combobox-search-popup')
class StoryComboboxSearchPopup extends Component {
	@state() private query = ''
	@state() private open = false
	@state() private selection: ReadonlyArray<string> = []

	readonly cities = new ComboboxController<string, StoryComboboxSearchPopup>(this, host => ({
		get expanded() { return host.open },
		handleExpandedChange: open => open ? host.open = true : host.close(),
		autocomplete: true,
		activateFirst: true,
		get selection() { return host.selection },
		handleChange: selection => host.selection = selection,
	}))

	private get trigger() { return this.renderRoot.querySelector('button')! }

	private get filtered() {
		const query = this.query.trim().toLowerCase()
		return cities.filter(city => city.toLowerCase().includes(query))
	}

	/** Opening moves focus into the search box. */
	protected override updated(changed: Map<PropertyKey, unknown>) {
		if (this.open && changed.has('open')) {
			this.cities.input.value?.focus()
		}
	}

	private close({ returnFocus = true } = {}) {
		this.open = false
		this.query = ''
		if (returnFocus) {
			this.trigger.focus()
		}
	}

	private handleTriggerKeyDown(event: KeyboardEvent) {
		if (!this.open && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
			event.preventDefault()
			this.open = true
		}
	}

	private handlePopupFocusOut(event: FocusEvent) {
		if (this.open && !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
			this.close({ returnFocus: false })
		}
	}

	static override get styles() {
		return css`
			${storyStyles}
			.field { position: relative; }
			button {
				display: flex; justify-content: space-between; align-items: center; gap: 1rem;
				font: inherit; padding: 0.5rem 0.75rem; inline-size: 16rem; cursor: pointer; text-align: start;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); color: var(--mo-color-foreground);
			}
			button::after { content: '▾' / ''; color: var(--mo-color-gray); }
			.popup {
				position: absolute; inset-block-start: calc(100% + 4px); inset-inline-start: 0; z-index: 1;
				display: flex; flex-direction: column; gap: 4px; padding: 4px;
				inline-size: 16rem; box-sizing: border-box;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); color: var(--mo-color-foreground);
				box-shadow: 0 4px 12px rgb(0 0 0 / 0.12);
			}
			.popup[hidden] { display: none; }
			input {
				font: inherit; padding: 0.4rem 0.6rem; box-sizing: border-box;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-background); color: var(--mo-color-foreground);
			}
			.listbox { display: flex; flex-direction: column; gap: 2px; max-block-size: 13rem; overflow-y: auto; }
			.empty { margin: 0; padding: 0.45rem 0.75rem; color: var(--mo-color-gray); }
			[role=option] { display: flex; justify-content: space-between; padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; }
			[role=option]:hover { background: var(--mo-color-transparent-gray-1); }
			[role=option][aria-selected=true]::after { content: '✓' / ''; color: var(--mo-color-accent); }
			[role=option][data-navigability=current] { background: color-mix(in srgb, var(--mo-color-accent), transparent 82%); }
		`
	}

	protected override get template() {
		return html`
			<div class='panel'>
				<h4 id='label'>City</h4>
				<div class='field'>
					<button aria-haspopup='dialog' aria-expanded=${this.open} aria-labelledby='label value'
						@mousedown=${(event: MouseEvent) => this.open && event.preventDefault()}
						@click=${() => this.open ? this.close() : this.open = true}
						@keydown=${this.handleTriggerKeyDown}
					><span id='value'>${this.selection[0] ?? 'Choose a city'}</span></button>
					<div class='popup' role='dialog' aria-labelledby='label' ?hidden=${!this.open} @focusout=${this.handlePopupFocusOut}>
						<input type='search' aria-label='Search cities' autocomplete='off' placeholder='Search'
							.value=${this.query}
							@input=${(event: InputEvent) => this.query = (event.target as HTMLInputElement).value}
							${this.cities.input.ref()}
						>
						<div class='listbox' aria-label='Cities' ${this.cities.listbox.ref()}>
							${this.filtered.map((city, index) => html`
								<div ${this.cities.option({ index, data: city })}>${city}</div>
							`)}
						</div>
						${this.filtered.length ? html.nothing : html`<p class='empty'>No city matches</p>`}
					</div>
				</div>
				<p class='hint'>
					The button opens the popup on a click, <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd> or <kbd>↑</kbd>, and
					focus moves into the search box. From there the controller runs it as in the other story: the arrows move,
					<kbd>Enter</kbd> or a click chooses and closes, and so do <kbd>Esc</kbd> and <kbd>Tab</kbd>. The host gives the
					button its ARIA, moves focus in and back out, and closes once focus leaves the popup.
				</p>
			</div>
			<story-combobox-readout .of=${this}></story-combobox-readout>
		`
	}
}

StoryComboboxSearchPopup

export const SearchInPopup: StoryObj = {
	render: () => html`<story-combobox-search-popup></story-combobox-search-popup>`,
}