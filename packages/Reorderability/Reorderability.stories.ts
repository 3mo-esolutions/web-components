import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, property, repeat, state } from '@a11d/lit'
import p from './package.json'
import { ReorderabilityController, type ReorderabilityStrategy } from './ReorderabilityController.js'
// Real controls for the story which is about them — @see ItemsWithTheirOwnControls
import '../Checkbox/index.js'
import '../IconButton/index.js'

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

	private readonly controller = new ReorderabilityController(this, component => ({
		get strategy() { return component.strategy },
		handleReorder: (source, destination) => {
			const items = [...component.items]
			items.splice(destination, 0, ...items.splice(source, 1))
			component.items = items
		},
	}))

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

/**
 * Items which carry their OWN controls, kept out of the drag by `excluded: '.actions'` — the whole
 * row drags, its buttons never do, and they keep the clicks they have of their own. Naming the
 * container excludes everything within it, controls added later included.
 *
 * Excluding is not a handle turned inside out. A `handle` names what the drag MAY start from, so it
 * needs an element covering the row's body and nothing else — and there is none: the body is the row
 * ITSELF, the item element, which a handle may never be, while every control is a descendant of it.
 * Wrapping the label to point a handle at would confine the drag to the text's own box and leave the
 * padding around it dead. Naming what must not drag is exact where naming what must cannot be.
 *
 * Of the two controls here only the icon button strictly needs it: the checkbox carries a native
 * `input`, which every item excludes anyway, while a button — Material's included — does not appear
 * in that list, as a button is exactly what a drag handle is often made of. Naming the container
 * rather than the controls spares the row that distinction, and covers whatever is added to it next.
 *
 * Among real controls a body which cannot be named is the rule rather than the exception: a Material
 * chip or button covers its own content with a touch-target overlay, so even a press on a label
 * resolves to the button beneath it — which the chip's own icon buttons descend from as well, leaving
 * the two indistinguishable by ancestry.
 */
class StoryReorderabilityControls extends Component {
	@state() private tasks = [
		{ label: 'Write the spec', pinned: true, done: false },
		{ label: 'Sketch the flow', pinned: false, done: true },
		{ label: 'Extract the package', pinned: false, done: false },
		{ label: 'Measure the cadence', pinned: false, done: false },
		{ label: 'Ship the stories', pinned: false, done: false },
	]

	private readonly controller: ReorderabilityController

	constructor() {
		super()
		this.controller = new ReorderabilityController(this, {
			handleReorder: (source, destination) => {
				const tasks = [...this.tasks]
				tasks.splice(destination, 0, ...tasks.splice(source, 1))
				this.tasks = tasks
			},
		})
	}

	private toggle(task: typeof this.tasks[number], key: 'pinned' | 'done') {
		this.tasks = this.tasks.map(t => t !== task ? t : { ...t, [key]: !t[key] })
	}

	static override get styles() {
		return css`
			.rows {
				display: flex;
				flex-direction: column;
				gap: 0.5rem;
				max-width: 24rem;
			}

			/* The row IS the item — its label is bare text, so its whole surface, padding included,
			   resolves to the row itself and starts a drag. */
			.row {
				display: flex;
				align-items: center;
				padding: 0.75rem 0.5rem 0.75rem 1rem;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-3);
				color: var(--mo-color-foreground);
				cursor: grab;
				user-select: none;

				&[data-reorderability=dragging] {
					background: var(--mo-color-accent);
					color: var(--mo-color-on-accent);
					z-index: 1;
					cursor: grabbing;

					/* On accent, an accented pin would be invisible */
					mo-icon-button, mo-icon-button[data-pinned] {
						color: var(--mo-color-on-accent);
					}
				}

				&[data-done] {
					text-decoration: line-through;
				}
			}

			/* Excluded, so everything in here keeps the gesture it has of its own */
			.actions {
				display: flex;
				align-items: center;
				gap: 0.25rem;
				margin-inline-start: auto;
				text-decoration: none;

				mo-icon-button {
					font-size: 20px;
					color: var(--mo-color-gray);

					&[data-pinned] {
						color: var(--mo-color-accent);
					}
				}
			}

			:host([data-reordering]) .row:not([data-reorderability=dragging]) {
				transition: transform 0.15s ease;
			}
		`
	}

	protected override get template() {
		return html`
			<div class='rows'>
				${repeat(this.tasks, task => task.label, (task, index) => html`
					<div class='row' ?data-done=${task.done} ${this.controller.item({ index, excluded: '.actions' })}>
						${task.label}
						<div class='actions'>
							<mo-icon-button dense icon='push_pin' title='Pin'
								?data-pinned=${task.pinned}
								@click=${() => this.toggle(task, 'pinned')}
							></mo-icon-button>
							<mo-checkbox title='Done' ?selected=${task.done} @change=${() => this.toggle(task, 'done')}></mo-checkbox>
						</div>
					</div>
				`)}
			</div>
		`
	}
}

customElements.define('story-reorderability-controls', StoryReorderabilityControls)

export const ItemsWithTheirOwnControls: StoryObj = {
	render: () => html`<story-reorderability-controls></story-reorderability-controls>`
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