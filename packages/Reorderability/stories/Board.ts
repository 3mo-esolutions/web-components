import { Component, component, css, html, repeat, state } from '@a11d/lit'
import { ReorderabilityController } from '@3mo/reorderability'

/** A board with one controller per column, each of which knows only its own cards. */
@component('story-board')
export class Board extends Component {
	@state() private columns = [
		{ heading: 'List 1', cards: ['Write the spec', 'Sketch the flow', 'Ask about pricing'] },
		{ heading: 'List 2', cards: ['Extract the package', 'Fix the iOS lines'] },
		{ heading: 'List 3', cards: ['Measure the cadence', 'Kill the axis option', 'Ship the stories'] },
	]

	/** Constructed with the host, never lazily, so none misses its `hostConnected`. */
	readonly reorderabilities = this.columns.map((_, column) => new ReorderabilityController(this, {
		handleReorder: (source, destination) => {
			const columns = this.columns.map(({ heading, cards }) => ({ heading, cards: [...cards] }))
			const cards = columns[column]!.cards
			cards.splice(destination, 0, ...cards.splice(source, 1))
			this.columns = columns
		},
	}))

	static override get styles() {
		return css`
			:host { display: grid; grid-template-columns: repeat(3, minmax(9rem, 14rem)); gap: 1rem; }
			.column { display: flex; flex-direction: column; gap: 0.5rem; }
			h4 { margin: 0; color: var(--mo-color-gray); font-size: small; font-weight: normal; }
			.card {
				padding: 0.75rem; border-radius: var(--mo-border-radius); background: var(--mo-color-transparent-gray-3);
				font-size: small; cursor: grab; user-select: none;
			}
			.card[data-reorderability=dragging] { background: var(--mo-color-accent); color: var(--mo-color-on-accent); z-index: 1; cursor: grabbing; }
			:host([data-reordering]) .card:not([data-reorderability=dragging]) { transition: transform 0.15s ease; }
		`
	}

	protected override get template() {
		return html`
			${this.columns.map(({ heading, cards }, column) => html`
				<div class='column'>
					<h4>${heading}</h4>
					${repeat(cards, card => card, (card, index) => html`
						<div class='card' ${this.reorderabilities[column]!.item({ index })}>${card}</div>
					`)}
				</div>
			`)}
		`
	}
}