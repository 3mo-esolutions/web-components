import { Component, component, css, event, html, state } from '@a11d/lit'
import { ComboboxController } from '@3mo/list'
import { countries } from '../../../stories/index.js'

/** A combobox from the controller alone: the host filters, opens on typing, closes on blur and writes the choice into the input. */
@component('story-country-combobox')
export class CountryCombobox extends Component {
	@event() readonly change!: EventDispatcher<string | undefined>

	@state() private query = ''
	@state() private filter = ''
	@state() private open = false
	@state() private selection: ReadonlyArray<string> = []

	readonly countries = new ComboboxController<string, CountryCombobox>(this, host => ({
		get expanded() { return host.expanded },
		handleExpandedChange: open => host.open = open,
		autocomplete: true,
		activateFirst: true,
		get selection() { return host.selection },
		handleChange: selection => {
			host.selection = selection
			host.change.dispatch(selection[0])
		},
	}))

	/** By what was typed rather than the input's text, so a choice written into the input shows the whole list again. */
	private get filtered() {
		const filter = this.filter.trim().toLowerCase()
		return countries.map(country => country.label).filter(country => country.toLowerCase().includes(filter))
	}

	private get expanded() {
		return this.open && this.filtered.length > 0
	}

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.5rem; position: relative; }
			label { color: var(--mo-color-gray); font-size: small; }
			input {
				font: inherit; padding: 0.5rem 0.75rem; inline-size: 16rem; box-sizing: border-box;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); color: var(--mo-color-foreground);
			}
			[role=listbox] {
				position: absolute; inset-block-start: calc(100% + 4px); inset-inline-start: 0; z-index: 1;
				display: flex; flex-direction: column; gap: 2px; padding: 4px;
				inline-size: 16rem; max-block-size: 15rem; overflow-y: auto; box-sizing: border-box;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); box-shadow: 0 4px 12px rgb(0 0 0 / 0.12);
			}
			[role=listbox][hidden] { display: none; }
			[role=option] { display: flex; justify-content: space-between; padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; }
			[role=option]:hover { background: var(--mo-color-transparent-gray-1); }
			[role=option][aria-selected=true]::after { content: '✓' / ''; color: var(--mo-color-accent); }
			[role=option][data-navigability=current] { background: color-mix(in srgb, var(--mo-color-accent), transparent 82%); }
		`
	}

	protected override get template() {
		return html`
			<label for='input'>Country</label>
			<input id='input' autocomplete='off' placeholder='Type to filter'
				.value=${this.query}
				@input=${(event: InputEvent) => { this.query = this.filter = (event.target as HTMLInputElement).value; this.open = true }}
				@click=${() => this.open = true}
				@blur=${() => this.open = false}
				${this.countries.input.ref()}
			>
			<div aria-label='Countries' ?hidden=${!this.expanded} ${this.countries.listbox.ref()}>
				${this.filtered.map((country, index) => html`
					<div @click=${() => { this.query = country; this.filter = '' }} ${this.countries.option({ index, data: country })}>${country}</div>
				`)}
			</div>
		`
	}
}
