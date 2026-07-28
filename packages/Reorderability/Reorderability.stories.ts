import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, property, repeat, state } from '@a11d/lit'
import p from './package.json'
import { ReorderabilityController, type ReorderabilityStrategy } from './ReorderabilityController.js'

export default {
	title: 'Utilities / Reorderability',
	package: p,
} as Meta

/** One fixture for every story: labelled boxes whose layout and item options vary per story —
 * the controller itself never changes, which is rather the point: it derives the layout (vertical,
 * horizontal, RTL, wrapping grid) from the items' own geometry at drag start. */
class StoryReorderability extends Component {
	@property() layout: 'list' | 'row' | 'grid' = 'list'
	@property() strategy: ReorderabilityStrategy = 'live'
	@property() handle = ''
	@property({ type: Array }) disabled = new Array<number>()
	@property({ type: Number }) count = 8

	@state() private items = new Array<number>()

	protected override willUpdate() {
		if (this.items.length !== this.count) {
			this.items = Array.from({ length: this.count }, (_, index) => index + 1)
		}
	}

	// In the constructor, as reactive controllers should be — a controller constructed mid-render
	// can miss its hostConnected callback. The strategy is read lazily so it may vary per story.
	private readonly controller: ReorderabilityController

	constructor() {
		super()
		const component = this
		this.controller = new ReorderabilityController(this, {
			get strategy() { return component.strategy },
			handleReorder: (source, destination) => {
				const items = [...this.items]
				items.splice(destination, 0, ...items.splice(source, 1))
				this.items = items
			},
		})
	}

	static override get styles() {
		return css`
			.items {
				gap: 0.5rem;

				&.list {
					display: flex;
					flex-direction: column;
					max-width: 20rem;
				}

				&.row {
					display: flex;
					max-width: 40rem;
					overflow-x: auto; /* a horizontal scroller — dragging near its edges auto-scrolls */
				}

				&.grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
				}
			}

			.item {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 0.5rem;
				min-height: 3rem;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-3);
				color: var(--mo-color-foreground);
				cursor: grab;
				user-select: none;

				.items.row & {
					min-width: 5rem;
				}

				&[data-disabled] {
					opacity: 0.5;
					cursor: not-allowed;
				}

				.grip {
					cursor: grab;
					color: var(--mo-color-gray);
				}

				/* The state attribute is the whole styling contract — the same one both strategies stamp. */
				&[data-reorderability=dragging] {
					background: var(--mo-color-accent);
					color: var(--mo-color-on-accent);
					z-index: 1;
					cursor: grabbing;
				}

				/* Reached only with the indicator strategy; logical properties keep RTL correct. */
				&[data-reorderability=drop-before] {
					border-inline-start: 3px solid var(--mo-color-accent);
				}

				&[data-reorderability=drop-after] {
					border-inline-end: 3px solid var(--mo-color-accent);
				}
			}

			/* Displaced items glide — only while a drag is in flight, so the release settles instantly. */
			:host([data-reordering]) .item:not([data-reorderability=dragging]) {
				transition: transform 0.15s ease;
			}
		`
	}

	protected override get template() {
		return html`
			<div class='items ${this.layout}'>
				${repeat(this.items, item => item, (item, index) => html`
					<div class='item' ?data-disabled=${this.disabled.includes(index)} ${this.controller.item({
						index,
						disabled: this.disabled.includes(index),
						handle: this.handle || undefined,
						dragImage: this.strategy !== 'indicator' ? undefined : html`
							<div style='padding: 0.25rem 0.75rem; background: var(--mo-color-accent); color: var(--mo-color-on-accent); border-radius: var(--mo-border-radius)'>
								Item ${item}
							</div>
						`,
					})}>
						${!this.handle ? html.nothing : html`<mo-icon class='grip' icon='drag_indicator'></mo-icon>`}
						${this.disabled.includes(index) ? html`Item ${item} 📌` : html`Item ${item}`}
					</div>
				`)}
			</div>
		`
	}
}

customElements.define('story-reorderability', StoryReorderability)

export const List: StoryObj = {
	render: () => html`<story-reorderability></story-reorderability>`
}

export const WrappingGrid: StoryObj = {
	render: () => html`<story-reorderability layout='grid' count='14'></story-reorderability>`
}

export const HorizontalRow: StoryObj = {
	render: () => html`<story-reorderability layout='row' count='12'></story-reorderability>`
}

export const RightToLeft: StoryObj = {
	render: () => html`
		<div dir='rtl'>
			<story-reorderability layout='row'></story-reorderability>
		</div>
	`
}

export const IndicatorStrategy: StoryObj = {
	render: () => html`<story-reorderability layout='row' strategy='indicator'></story-reorderability>`
}

export const DragHandle: StoryObj = {
	render: () => html`<story-reorderability handle='.grip'></story-reorderability>`
}

export const DisabledItems: StoryObj = {
	render: () => html`<story-reorderability .disabled=${[0, 3]}></story-reorderability>`
}

/** A board with ONE CONTROLLER PER COLUMN. Each controller knows only its own cards, so a card
 * reorders within its column and a drag never carries it into another — that is what several
 * controllers on one host buy you. (Moving cards BETWEEN columns is a different feature: it needs a
 * drop position outside the dragged item's own list, which one-controller-per-list cannot express.) */
class StoryReorderabilityBoard extends Component {
	@state() private columns = [
		{ heading: 'List 1', cards: ['Write the spec', 'Sketch the flow', 'Ask about pricing'] },
		{ heading: 'List 2', cards: ['Extract the package', 'Fix the iOS lines'] },
		{ heading: 'List 3', cards: ['Measure the cadence', 'Kill the axis option', 'Ship the stories'] },
	]

	private readonly controllers: Array<ReorderabilityController>

	constructor() {
		super()
		// All constructed here, never lazily — see the controller's note on hostConnected.
		this.controllers = this.columns.map((_, column) => new ReorderabilityController(this, {
			handleReorder: (source, destination) => {
				const columns = this.columns.map(({ heading, cards }) => ({ heading, cards: [...cards] }))
				const cards = columns[column]!.cards
				cards.splice(destination, 0, ...cards.splice(source, 1))
				this.columns = columns
			},
		}))
	}

	static override get styles() {
		return css`
			#board {
				display: grid;
				grid-template-columns: repeat(3, minmax(9rem, 14rem));
				gap: 1rem;
			}

			.column {
				display: flex;
				flex-direction: column;
				gap: 0.5rem;

				h4 {
					margin: 0;
					color: var(--mo-color-gray);
					font-size: small;
					text-transform: uppercase;
					letter-spacing: 0.05em;
				}
			}

			.card {
				padding: 0.75rem;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-3);
				color: var(--mo-color-foreground);
				font-size: small;
				cursor: grab;
				user-select: none;

				&[data-reorderability=dragging] {
					background: var(--mo-color-accent);
					color: var(--mo-color-on-accent);
					z-index: 1;
					cursor: grabbing;
				}
			}

			:host([data-reordering]) .card:not([data-reorderability=dragging]) {
				transition: transform 0.15s ease;
			}
		`
	}

	protected override get template() {
		return html`
			<div id='board'>
				${this.columns.map(({ heading, cards }, column) => html`
					<div class='column'>
						<h4>${heading}</h4>
						${repeat(cards, card => card, (card, index) => html`
							<div class='card' ${this.controllers[column]!.item({ index })}>${card}</div>
						`)}
					</div>
				`)}
			</div>
		`
	}
}

customElements.define('story-reorderability-board', StoryReorderabilityBoard)

export const BoardOfIndependentLists: StoryObj = {
	render: () => html`<story-reorderability-board></story-reorderability-board>`
}