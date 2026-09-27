import { Component, component, css, event, html, state } from '@a11d/lit'
import { ComboboxController } from '@3mo/list'
import { countries } from '../../../stories/index.js'

/** A button opening a popup whose search box is the combobox; the button's keys, ARIA and focus handling are the host's. */
@component('story-search-popup-combobox')
export class SearchPopupCombobox extends Component {
	@event() readonly change!: EventDispatcher<string | undefined>

	@state() private query = ''
	@state() private open = false
	@state() private selection: ReadonlyArray<string> = []

	readonly countries = new ComboboxController<string, SearchPopupCombobox>(this, host => ({
		get expanded() { return host.open },
		handleExpandedChange: open => open ? host.open = true : host.close(),
		autocomplete: true,
		activateFirst: true,
		get selection() { return host.selection },
		handleChange: selection => {
			host.selection = selection
			host.change.dispatch(selection[0])
		},
	}))

	private get trigger() { return this.renderRoot.querySelector('button')! }

	private get filtered() {
		const query = this.query.trim().toLowerCase()
		return countries.map(country => country.label).filter(country => country.toLowerCase().includes(query))
	}

	protected override updated(changed: Map<PropertyKey, unknown>) {
		if (this.open && changed.has('open')) {
			this.countries.input.value?.focus()
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
			:host { display: flex; flex-direction: column; gap: 0.5rem; position: relative; }
			#label { color: var(--mo-color-gray); font-size: small; }
			button {
				display: flex; justify-content: space-between; align-items: center; gap: 1rem;
				font: inherit; padding: 0.5rem 0.75rem; inline-size: 16rem; cursor: pointer; text-align: start;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); color: var(--mo-color-foreground);
			}
			button::after { content: '▾' / ''; color: var(--mo-color-gray); }
			[role=dialog] {
				position: absolute; inset-block-start: calc(100% + 4px); inset-inline-start: 0; z-index: 1;
				display: flex; flex-direction: column; gap: 4px; padding: 4px; inline-size: 16rem; box-sizing: border-box;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); box-shadow: 0 4px 12px rgb(0 0 0 / 0.12);
			}
			[role=dialog][hidden] { display: none; }
			input {
				font: inherit; padding: 0.4rem 0.6rem; box-sizing: border-box;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-background); color: var(--mo-color-foreground);
			}
			[role=listbox] { display: flex; flex-direction: column; gap: 2px; max-block-size: 13rem; overflow-y: auto; }
			p { margin: 0; padding: 0.45rem 0.75rem; color: var(--mo-color-gray); }
			[role=option] { display: flex; justify-content: space-between; padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; }
			[role=option]:hover { background: var(--mo-color-transparent-gray-1); }
			[role=option][aria-selected=true]::after { content: '✓' / ''; color: var(--mo-color-accent); }
			[role=option][data-navigability=current] { background: color-mix(in srgb, var(--mo-color-accent), transparent 82%); }
		`
	}

	protected override get template() {
		return html`
			<span id='label'>Country</span>
			<button aria-haspopup='dialog' aria-expanded=${this.open} aria-labelledby='label value'
				@mousedown=${(event: MouseEvent) => this.open && event.preventDefault()}
				@click=${() => this.open ? this.close() : this.open = true}
				@keydown=${this.handleTriggerKeyDown}
			><span id='value'>${this.selection[0] ?? 'Choose a country'}</span></button>
			<div role='dialog' aria-labelledby='label' ?hidden=${!this.open} @focusout=${this.handlePopupFocusOut}>
				<input type='search' aria-label='Search countries' autocomplete='off' placeholder='Search'
					.value=${this.query}
					@input=${(event: InputEvent) => this.query = (event.target as HTMLInputElement).value}
					${this.countries.input.ref()}
				>
				<div aria-label='Countries' ${this.countries.listbox.ref()}>
					${this.filtered.map((country, index) => html`<div ${this.countries.option({ index, data: country })}>${country}</div>`)}
				</div>
				${this.filtered.length ? html.nothing : html`<p>No country matches</p>`}
			</div>
		`
	}
}