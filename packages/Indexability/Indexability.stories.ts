import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, property, repeat, state } from '@a11d/lit'
import p from './package.json'
import { IndexabilityController } from './IndexabilityController.js'

export default {
	title: 'Utilities / Indexability',
	package: p,
} as Meta

type Item = { readonly index: number, readonly label: string }

/**
 * The registry has nothing to look at of its own — it draws no UI and owns no gesture — so the
 * stories show what it ANSWERS: the items in declared order (however they are rendered), and which
 * item an event landed on.
 */
class StoryIndexability extends Component {
	/** Renders the items in a deliberately scrambled DOM order while declaring ascending indices. */
	@property({ type: Boolean }) scrambled = false
	@property({ type: Boolean }) nested = false

	private readonly items: Array<Item> = ['Ada', 'Alan', 'Grace', 'Edsger', 'Barbara'].map((label, index) => ({ index, label }))

	private readonly controller = new IndexabilityController<Item>(this)

	@state() private order = new Array<string>()
	@state() private hit?: string

	protected override updated() {
		// Items register AS they render, so the registry is only complete once the render is.
		const order = this.controller.items.map(item => `${item.options.index} · ${item.options.data?.label}`)
		if (order.join() !== this.order.join()) {
			this.order = order
		}
	}

	private readonly handleClick = (e: MouseEvent) => {
		const item = this.controller.itemAt(e.composedPath())
		this.hit = !item ? 'nothing — the click landed outside every item' : `${item.options.index} · ${item.options.data?.label}`
	}

	static override get styles() {
		return css`
			:host { display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start; }

			.items { display: flex; flex-direction: column; gap: 0.5rem; width: 14rem; }

			.item {
				display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
				padding: 0.6rem 0.75rem;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-3);
				color: var(--mo-color-foreground);
				cursor: pointer;
				user-select: none;
			}

			.declared { color: var(--mo-color-gray); font-size: small; font-variant-numeric: tabular-nums; }

			.inner {
				padding: 0.15rem 0.5rem;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-accent);
				color: var(--mo-color-on-accent);
				font-size: small;
			}

			.readout { display: flex; flex-direction: column; gap: 0.75rem; min-width: 16rem; }

			h4 { margin: 0 0 0.35rem; color: var(--mo-color-gray); font-size: small; text-transform: uppercase; letter-spacing: 0.05em; }

			ol { margin: 0; padding-inline-start: 1.25rem; color: var(--mo-color-foreground); }
			li { font-variant-numeric: tabular-nums; }

			code { color: var(--mo-color-accent); }
		`
	}

	protected override get template() {
		// Rendered back-to-front when scrambled — the declared index is unchanged either way.
		const rendered = this.scrambled ? [...this.items].reverse() : this.items
		return html`
			<div class='items' @click=${this.handleClick}>
				${repeat(rendered, item => item.index, item => html`
					<div class='item' ${this.controller.item({ index: item.index, data: item })}>
						<span>${item.label}</span>
						${!this.nested || item.index !== 2 ? html.nothing : html`
							<span class='inner' ${this.controller.item({ index: 99, data: { index: 99, label: 'a nested item' } })}>nested</span>
						`}
						<span class='declared'>index ${item.index}</span>
					</div>
				`)}
			</div>

			<div class='readout'>
				<div>
					<h4>controller.items — declared order</h4>
					<ol>${this.order.map(item => html`<li>${item}</li>`)}</ol>
				</div>
				<div>
					<h4>controller.itemAt(event.composedPath())</h4>
					<div>${this.hit === undefined ? html`<code>click an item</code>` : html`<code>${this.hit}</code>`}</div>
				</div>
			</div>
		`
	}
}
customElements.define('story-indexability', StoryIndexability)

/** The registry answers in DECLARED order — the order the owner reads its data in. */
export const DeclaredOrder: StoryObj = {
	render: () => html`<story-indexability></story-indexability>`
}

/** The same items rendered back-to-front. Document position changed; the answer did not. */
export const ScrambledDomOrder: StoryObj = {
	render: () => html`<story-indexability scrambled></story-indexability>`
}

/** An item nested inside another resolves to ITSELF — the path is scanned nearest-first, which is
 * what lets a compound item carry its own sub-items. */
export const NestedItems: StoryObj = {
	render: () => html`<story-indexability nested></story-indexability>`
}

/** One card, in its own shadow root. Its element is unreachable by the host's selectors and
 * incomparable by document position — but it registers itself, so it takes its declared place. */
class StoryIndexabilityCard extends Component {
	@property({ type: Object }) controller!: IndexabilityController<string>
	@property({ type: Number }) idx = 0
	@property() label = ''

	static override get styles() {
		return css`
			:host { display: block; }
			.card {
				padding: 0.6rem 0.75rem;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-3);
				color: var(--mo-color-foreground);
				cursor: pointer;
				user-select: none;
			}
		`
	}

	protected override get template() {
		return html`<div class='card' ${this.controller.item({ index: this.idx, data: this.label })}>${this.label}</div>`
	}
}
customElements.define('story-indexability-card', StoryIndexabilityCard)

/**
 * Two registries on ONE host, whose items are each a shadow root deep. Each registry knows only its
 * own items, so a click resolves in exactly one of them — that is how sibling controllers (a board's
 * columns, a grid's rows and its column headers) stay out of each other's events.
 */
class StoryIndexabilityRegistries extends Component {
	private readonly left = new IndexabilityController<string>(this)
	private readonly right = new IndexabilityController<string>(this)

	@state() private hit = 'click a card'

	private readonly handleClick = (e: MouseEvent) => {
		const path = e.composedPath()
		const left = this.left.itemAt(path)
		const right = this.right.itemAt(path)
		this.hit = left ? `left registry → ${left.options.data}`
			: right ? `right registry → ${right.options.data}`
				: 'neither registry'
	}

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 1rem; }
			.columns { display: flex; gap: 2rem; }
			.column { display: flex; flex-direction: column; gap: 0.5rem; width: 11rem; }
			h4 { margin: 0; color: var(--mo-color-gray); font-size: small; text-transform: uppercase; letter-spacing: 0.05em; }
			code { color: var(--mo-color-accent); }
		`
	}

	protected override get template() {
		return html`
			<div class='columns' @click=${this.handleClick}>
				<div class='column'>
					<h4>Left</h4>
					${['Draft', 'Review', 'Ship'].map((label, idx) => html`
						<story-indexability-card .controller=${this.left} .idx=${idx} label=${label}></story-indexability-card>
					`)}
				</div>
				<div class='column'>
					<h4>Right</h4>
					${['Spec', 'Build'].map((label, idx) => html`
						<story-indexability-card .controller=${this.right} .idx=${idx} label=${label}></story-indexability-card>
					`)}
				</div>
			</div>
			<div><code>${this.hit}</code></div>
		`
	}
}
customElements.define('story-indexability-registries', StoryIndexabilityRegistries)

export const SeveralRegistriesAcrossShadowRoots: StoryObj = {
	render: () => html`<story-indexability-registries></story-indexability-registries>`
}