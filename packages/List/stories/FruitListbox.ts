import { Component, component, css, event, html, property, state } from '@a11d/lit'
import { ListboxController, type ListboxOrientation } from '@3mo/list'

const fruits = ['Apple', 'Apricot', 'Banana', 'Blackberry', 'Blueberry', 'Cherry', 'Date', 'Fig', 'Grape', 'Kiwi', 'Lemon', 'Mango']

/** A single-select listbox whose keys, focus and ARIA are all the controller's. */
@component('story-fruit-listbox')
export class FruitListbox extends Component {
	@event() readonly change!: EventDispatcher<string | undefined>

	@property({ type: Boolean }) selectionFollowsFocus = false
	@property() orientation: ListboxOrientation = 'vertical'

	@state() private selection: ReadonlyArray<string> = []

	readonly fruits = new ListboxController<string, FruitListbox>(this, host => ({
		get selection() { return host.selection },
		handleChange: selection => {
			host.selection = selection
			host.change.dispatch(selection[0])
		},
		get selectionFollowsFocus() { return host.selectionFollowsFocus },
		get orientation() { return host.orientation },
	}))

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.5rem; }
			#label { color: var(--mo-color-gray); font-size: small; }
			ul {
				display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 4px; list-style: none;
				inline-size: 16rem; max-block-size: 20rem; overflow-y: auto;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
			}
			ul[aria-orientation=horizontal] { flex-direction: row; flex-wrap: wrap; inline-size: 28rem; }
			li { padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; outline: none; }
			li:hover { background: var(--mo-color-transparent-gray-1); }
			li[aria-selected=true] { background: color-mix(in srgb, var(--mo-color-accent), transparent 78%); }
			li:focus-visible { box-shadow: inset 0 0 0 2px var(--mo-color-accent); }
		`
	}

	protected override get template() {
		return html`
			<span id='label'>Fruit</span>
			<ul aria-labelledby='label' ${this.fruits.listbox.ref()}>
				${fruits.map((fruit, index) => html`<li ${this.fruits.option({ index, data: fruit })}>${fruit}</li>`)}
			</ul>
		`
	}
}