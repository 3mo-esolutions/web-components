import { Component, component, css, event, html, state } from '@a11d/lit'
import { Selectability } from '@3mo/selectability'
import { ListboxController } from '@3mo/list'
import '@3mo/button'

type Topping = { readonly name: string, readonly soldOut?: boolean }

const toppings: ReadonlyArray<Topping> = [
	{ name: 'Mozzarella' }, { name: 'Tomato' }, { name: 'Basil' }, { name: 'Mushrooms' }, { name: 'Olives' }, { name: 'Onions' },
	{ name: 'Peppers' }, { name: 'Pepperoni' }, { name: 'Ham' }, { name: 'Pineapple' }, { name: 'Anchovies', soldOut: true }, { name: 'Jalapeños' },
]

/** A multi-select listbox, with buttons doing what the selection keys do for anyone who cannot use them. */
@component('story-toppings-listbox')
export class ToppingsListbox extends Component {
	@event() readonly change!: EventDispatcher<ReadonlyArray<Topping>>

	@state() private selection: ReadonlyArray<Topping> = []

	readonly toppings = new ListboxController<Topping, ToppingsListbox>(this, host => ({
		selectability: Selectability.Multiple,
		get selection() { return host.selection },
		handleChange: selection => host.select(selection),
	}))

	private select(selection: ReadonlyArray<Topping>) {
		this.selection = selection
		this.change.dispatch(selection)
	}

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.5rem; }
			#label { color: var(--mo-color-gray); font-size: small; }
			ul {
				display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 4px; list-style: none;
				inline-size: 16rem; max-block-size: 20rem; overflow-y: auto;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
			}
			li { display: flex; justify-content: space-between; padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; outline: none; }
			li:hover { background: var(--mo-color-transparent-gray-1); }
			li[aria-selected=true]::after { content: '✓' / ''; color: var(--mo-color-accent); }
			li[aria-disabled=true] { opacity: 0.45; }
			li:focus-visible { box-shadow: inset 0 0 0 2px var(--mo-color-accent); }
			.actions { display: flex; gap: 0.5rem; }
		`
	}

	protected override get template() {
		return html`
			<span id='label'>Toppings</span>
			<ul aria-labelledby='label' ${this.toppings.listbox.ref()}>
				${toppings.map((topping, index) => html`
					<li ${this.toppings.option({ index, data: topping, disabled: topping.soldOut })}>${topping.name}${topping.soldOut ? ' (sold out)' : ''}</li>
				`)}
			</ul>
			<div class='actions'>
				<mo-button @click=${() => this.select(toppings.filter(topping => !topping.soldOut))}>Select all</mo-button>
				<mo-button @click=${() => this.select([])}>Clear</mo-button>
			</div>
		`
	}
}