import { Component, component, css, event, html, state } from '@a11d/lit'
import { ListboxController } from '@3mo/list'

const produce = [
	{ label: 'Fruit', items: ['Apple', 'Banana', 'Cherry', 'Mango'] },
	{ label: 'Vegetables', items: ['Carrot', 'Leek', 'Pea', 'Spinach'] },
]

/** A listbox whose options sit in labelled groups, indexed straight through them. */
@component('story-produce-listbox')
export class ProduceListbox extends Component {
	@event() readonly change!: EventDispatcher<string | undefined>

	@state() private selection: ReadonlyArray<string> = []

	readonly produce = new ListboxController<string, ProduceListbox>(this, host => ({
		get selection() { return host.selection },
		handleChange: selection => {
			host.selection = selection
			host.change.dispatch(selection[0])
		},
	}))

	static override get styles() {
		return css`
			#listbox {
				display: flex; flex-direction: column; gap: 2px; padding: 4px;
				inline-size: 16rem; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
			}
			[role=presentation] { padding: 0.6rem 0.75rem 0.25rem; color: var(--mo-color-gray); font-size: small; }
			[role=option] { padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; outline: none; }
			[role=option]:hover { background: var(--mo-color-transparent-gray-1); }
			[role=option][aria-selected=true] { background: color-mix(in srgb, var(--mo-color-accent), transparent 78%); }
			[role=option]:focus-visible { box-shadow: inset 0 0 0 2px var(--mo-color-accent); }
		`
	}

	protected override get template() {
		const all = produce.flatMap(group => group.items)
		return html`
			<div id='listbox' aria-label='Produce' ${this.produce.listbox.ref()}>
				${produce.map((group, groupIndex) => html`
					<div role='group' aria-labelledby='group-${groupIndex}'>
						<div role='presentation' id='group-${groupIndex}'>${group.label}</div>
						${group.items.map(item => html`<div ${this.produce.option({ index: all.indexOf(item), data: item })}>${item}</div>`)}
					</div>
				`)}
			</div>
		`
	}
}
