import { Component, component, css, ElementRef, event, html, state } from '@a11d/lit'
import { ListboxController } from '@3mo/list'

/** An input that keeps focus over a listbox of the options slotted into it. */
@component('story-filterable-listbox')
export class FilterableListbox extends Component {
	@event() readonly change!: EventDispatcher<string | undefined>

	@state() private query = ''

	private readonly input = new ElementRef<HTMLInputElement>()

	readonly countries = new ListboxController<string, FilterableListbox>(this, host => ({
		get combobox() { return host.input.value },
		handleChange: ([country]) => host.change.dispatch(country),
	}))

	/** Nothing here renders the slotted options, so the matching ones are registered by hand. */
	protected override willUpdate() {
		const query = this.query.toLowerCase()
		const options = [...this.children] as Array<HTMLElement>
		for (const option of options) {
			option.hidden = !option.textContent!.toLowerCase().includes(query)
		}
		this.countries.indexability.setItems(options.filter(option => !option.hidden), (option, index) => ({ index, data: option.textContent!.trim() }))
	}

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.5rem; }
			label { color: var(--mo-color-gray); font-size: small; }
			input {
				font: inherit; padding: 0.5rem 0.75rem; inline-size: 16rem; box-sizing: border-box;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); color: var(--mo-color-foreground);
			}
			#listbox {
				display: flex; flex-direction: column; gap: 2px; padding: 4px;
				inline-size: 16rem; max-block-size: 20rem; overflow-y: auto; box-sizing: border-box;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
			}
			::slotted([role=option]) { padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; }
			::slotted([role=option]:hover) { background: var(--mo-color-transparent-gray-1); }
			::slotted([aria-selected=true]) { background: color-mix(in srgb, var(--mo-color-accent), transparent 78%); }
			input:focus ~ #listbox ::slotted([data-navigability=current]) { box-shadow: inset 0 0 0 2px var(--mo-color-accent); }
		`
	}

	protected override get template() {
		return html`
			<label for='input'>Country</label>
			<input id='input' role='combobox' aria-autocomplete='list' aria-expanded='true' aria-controls='listbox'
				autocomplete='off' placeholder='Type to filter'
				.value=${this.query}
				@input=${(event: InputEvent) => this.query = (event.target as HTMLInputElement).value}
				${this.input.ref()}
			>
			<div id='listbox' aria-label='Countries' ${this.countries.listbox.ref()}>
				<slot></slot>
			</div>
		`
	}
}