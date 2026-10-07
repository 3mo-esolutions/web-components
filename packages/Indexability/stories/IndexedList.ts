import { Component, component, css, html, property, repeat, state } from '@a11d/lit'
import { IndexabilityController } from '@3mo/indexability'
import { fivePeople } from '../../../stories/index.js'

type Item = { readonly index: number, readonly label: string }

const items: ReadonlyArray<Item> = fivePeople.map((person, index) => ({ index, label: person.firstName }))

/** The registry draws nothing, so beside the items this shows what it answers: the items in declared order and which one a click landed on. */
@component('story-indexed-list')
export class IndexedList extends Component {
	@property({ type: Boolean }) scrambled = false
	@property({ type: Boolean }) nested = false

	@state() private order = new Array<string>()
	@state() private hit?: string

	readonly indexability = new IndexabilityController<Item>(this)

	/** Items register as they render, so the registry is complete only once the render is. */
	protected override updated() {
		const order = this.indexability.items.map(item => `${item.options.index} · ${item.options.data?.label}`)
		if (order.join() !== this.order.join()) {
			this.order = order
		}
	}

	private readonly handleClick = (event: MouseEvent) => {
		const item = this.indexability.itemAt(event.composedPath())
		this.hit = !item ? 'nothing' : `${item.options.index} · ${item.options.data?.label}`
	}

	static override get styles() {
		return css`
			:host { display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start; }
			.items { display: flex; flex-direction: column; gap: 0.5rem; inline-size: 14rem; }
			.item {
				display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.6rem 0.75rem;
				border-radius: var(--mo-border-radius); background: var(--mo-color-transparent-gray-1); cursor: pointer; user-select: none;
			}
			.inner { padding: 0.15rem 0.5rem; border-radius: var(--mo-border-radius); background: var(--mo-color-accent); color: var(--mo-color-on-accent); font-size: small; }
			small { color: var(--mo-color-gray); font-variant-numeric: tabular-nums; }
			h4 { margin: 0 0 0.35rem; color: var(--mo-color-gray); font-size: small; font-weight: normal; }
			ul { margin: 0 0 0.75rem; padding-inline-start: 1.25rem; font-variant-numeric: tabular-nums; }
		`
	}

	protected override get template() {
		return html`
			<div class='items' @click=${this.handleClick}>
				${repeat(this.scrambled ? [...items].reverse() : items, item => item.index, item => html`
					<div class='item' ${this.indexability.item({ index: item.index, data: item })}>
						${item.label}
						${!this.nested || item.index !== 2 ? html.nothing : html`
							<span class='inner' ${this.indexability.item({ index: 99, data: { index: 99, label: 'nested item' } })}>nested</span>
						`}
						<small>index ${item.index}</small>
					</div>
				`)}
			</div>
			<div>
				<h4>items</h4>
				<ul>${this.order.map(item => html`<li>${item}</li>`)}</ul>
				<h4>itemAt(event.composedPath())</h4>
				<code>${this.hit ?? '–'}</code>
			</div>
		`
	}
}
