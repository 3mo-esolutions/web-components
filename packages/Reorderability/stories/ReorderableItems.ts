import { Component, component, css, html, property, repeat, state } from '@a11d/lit'
import { ReorderabilityController, type ReorderabilityStrategy } from '@3mo/reorderability'
import '@3mo/icon'

/** Boxes that only lay themselves out: the controller reads a list, a row or a wrapping grid off their geometry as the drag starts. */
@component('story-reorderable-items')
export class ReorderableItems extends Component {
	@property() layout: 'list' | 'row' | 'grid' = 'list'
	@property() strategy: ReorderabilityStrategy = 'live'
	@property() handle?: string
	@property({ type: Array }) disabled = new Array<number>()
	@property({ type: Number }) count = 8

	@state() private items = new Array<number>()

	readonly reorderability = new ReorderabilityController(this, host => ({
		get strategy() { return host.strategy },
		handleReorder: (source, destination) => {
			const items = [...host.items]
			items.splice(destination, 0, ...items.splice(source, 1))
			host.items = items
		},
	}))

	protected override willUpdate() {
		if (this.items.length !== this.count) {
			this.items = Array.from({ length: this.count }, (_, index) => index + 1)
		}
	}

	static override get styles() {
		return css`
			.list { display: flex; flex-direction: column; gap: 0.5rem; max-inline-size: 20rem; }
			.row { display: flex; gap: 0.5rem; max-inline-size: 40rem; overflow-x: auto; }
			.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr)); gap: 0.5rem; }
			.item {
				display: flex; align-items: center; justify-content: center; gap: 0.5rem; min-block-size: 3rem; min-inline-size: 5rem;
				border-radius: var(--mo-border-radius); background: var(--mo-color-transparent-gray-3); cursor: grab; user-select: none;
			}
			.item[aria-disabled=true] { opacity: 0.5; cursor: not-allowed; }
			.item mo-icon { color: var(--mo-color-gray); }
			.item[data-reorderability=dragging] { background: var(--mo-color-accent); color: var(--mo-color-on-accent); z-index: 1; cursor: grabbing; }
			.item[data-reorderability=drop-before] { border-inline-start: 3px solid var(--mo-color-accent); }
			.item[data-reorderability=drop-after] { border-inline-end: 3px solid var(--mo-color-accent); }
			/* Only while a drag is in flight, so the release settles instantly. */
			:host([data-reordering]) .item:not([data-reorderability=dragging]) { transition: transform 0.15s ease; }
		`
	}

	protected override get template() {
		return html`
			<div class=${this.layout}>
				${repeat(this.items, item => item, (item, index) => html`
					<div class='item' aria-disabled=${this.disabled.includes(index)} ${this.reorderability.item({
						index,
						disabled: this.disabled.includes(index),
						handle: this.handle,
						dragImage: this.strategy !== 'indicator' ? undefined : html`
							<div style='padding: 0.25rem 0.75rem; background: var(--mo-color-accent); color: var(--mo-color-on-accent); border-radius: var(--mo-border-radius)'>Item ${item}</div>
						`,
					})}>
						${!this.handle ? html.nothing : html`<mo-icon class='grip' icon='drag_indicator'></mo-icon>`}
						Item ${item}
						${!this.disabled.includes(index) ? html.nothing : html`<mo-icon icon='push_pin'></mo-icon>`}
					</div>
				`)}
			</div>
		`
	}
}