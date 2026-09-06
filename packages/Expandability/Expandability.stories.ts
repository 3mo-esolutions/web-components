import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, html, property, repeat, state } from '@a11d/lit'
import p from './package.json'
import { ExpandabilityController } from './ExpandabilityController.js'

export default {
	title: 'Utilities / Expandability',
	package: p,
} as Meta

type Period = { readonly id: number, readonly name: string, readonly children?: ReadonlyArray<Period> }

// Built fresh on every call: a refetch hands back equal periods as new objects, never the same references.
const periods = (): ReadonlyArray<Period> => [
	{
		id: 1, name: 'Q1', children: [
			{ id: 11, name: 'January', children: [{ id: 111, name: 'Week 1' }, { id: 112, name: 'Week 2' }] },
			{ id: 12, name: 'February' },
		]
	},
	{ id: 2, name: 'Q2', children: [{ id: 21, name: 'April' }] },
	{ id: 3, name: 'Q3' },
]

const styles = css`
	:host { display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start; }

	.panel { display: flex; flex-direction: column; gap: 2px; min-width: 22rem; }

	.toolbar { display: flex; gap: 1rem; padding-block-end: 0.5rem; }
	button { background: none; border: none; padding: 0.35rem 0; cursor: pointer; color: var(--mo-color-accent); font: inherit; }

	.row {
		display: flex; align-items: center; gap: 0.5rem;
		/* Fixed, so that swapping the chevron for a spinner cannot resize a row, and so that nothing the
		   transition touches takes part in layout: an interpolated auto height inside a flex column does
		   not move monotonically, which is what made this list jump. */
		block-size: 2.5rem;
		padding-inline: 0.75rem;
		padding-inline-start: calc(0.75rem + var(--level) * 1.5rem);
		border-radius: var(--mo-border-radius);
		background: var(--mo-color-transparent-gray-3);
		color: var(--mo-color-foreground);
		cursor: default; user-select: none;
		transition: opacity 200ms;

		.chevron { transition: rotate 200ms; }
		.chevron[data-leaf] { visibility: hidden; }
		.count { margin-inline-start: auto; color: var(--mo-color-gray); font-size: small; }

		/* The stamped attribute is the whole styling contract. */
		&[data-expandability=expanded] .chevron { rotate: 90deg; }
		&[data-expandability=loading] .chevron { animation: spin 1s linear infinite; }
		&[data-nested] {
			@starting-style { opacity: 0; }
		}
	}

	@keyframes spin { to { rotate: 360deg; } }

	.readout { display: flex; flex-direction: column; gap: 0.75rem; min-width: 18rem; }
	h4 { margin: 0 0 0.35rem; color: var(--mo-color-gray); font-size: small; text-transform: uppercase; letter-spacing: 0.05em; }
	code { color: var(--mo-color-accent); }
	.hint { color: var(--mo-color-gray); font-size: small; line-height: 1.5; max-width: 18rem; }

	@media (prefers-reduced-motion: reduce) {
		.row, .chevron { transition: none; }
	}
`

/**
 * Which items of a COLLECTION are open. The rows below draw themselves and ask the controller only "is
 * this one open"; the controller keeps the set, keyed by the item's id, enforces single mode while holding
 * a branch's ancestors open, loads children before a first expansion, and stamps every rendered row.
 *
 * A single disclosure needs none of this — `mo-expander` and `mo-collapsible-card` are one element with
 * one boolean, and `mo-accordion-item` is a native `details` element which brings its own animation.
 */
@component('story-expandability')
class StoryExpandability extends Component {
	@property({ type: Boolean }) multiple = false
	@property({ type: Boolean }) lazy = false

	@state() private data = periods()
	@state() private expanded = new Array<Period>()
	@state() private refetches = 0

	private readonly controller = new ExpandabilityController<Period, StoryExpandability>(this, host => ({
		get items() { return host.nodes },
		key: period => period.id,
		isExpandable: period => !!period.children?.length,
		get multiple() { return host.multiple },
		get expanded() { return host.expanded },
		ancestorsOf: period => host.ancestorsOf(period),
		get load() { return !host.lazy ? undefined : () => new Promise(resolve => setTimeout(resolve, 700)) },
		handleChange: ({ expanded }) => host.expanded = [...expanded],
	}))

	/** Every period in pre-order — the full universe, so that expanding all of them means all of them. */
	private get nodes(): Array<Period> {
		const flatten = (periods: ReadonlyArray<Period>): Array<Period> =>
			periods.flatMap(period => [period, ...flatten(period.children ?? [])])
		return flatten(this.data)
	}

	/** The rows on screen: a period shows once every one of its ancestors is open. */
	private get visibleNodes() {
		return this.nodes.filter(period => this.ancestorsOf(period).every(ancestor => this.controller.isExpanded(ancestor)))
	}

	private ancestorsOf(period: Period): Array<Period> {
		const path = (periods: ReadonlyArray<Period>, trail: Array<Period>): Array<Period> | undefined => {
			for (const candidate of periods) {
				if (candidate.id === period.id) {
					return trail
				}
				const found = path(candidate.children ?? [], [...trail, candidate])
				if (found) {
					return found
				}
			}
			return undefined
		}
		return path(this.data, []) ?? []
	}

	private levelOf(period: Period) {
		return this.ancestorsOf(period).length
	}

	/** What a silent refetch does: equal data, new objects. */
	private refetch() {
		this.data = periods()
		this.controller.handleItemsChange()
		this.refetches++
	}

	static override get styles() { return styles }

	protected override get template() {
		return html`
			<div class='panel'>
				<div class='toolbar'>
					<button @click=${() => this.controller.toggleAll()}>${this.controller.allState === 'none' ? 'Expand all' : 'Collapse all'}</button>
					<button @click=${() => this.refetch()}>Refetch</button>
				</div>
				${repeat(this.visibleNodes, period => period.id, (period, index) => html`
					<div class='row'
						${this.controller.item({ index, data: period })}
						style='--level: ${this.levelOf(period)}'
						?data-nested=${this.levelOf(period) > 0}
						@click=${() => this.controller.toggle(period)}
					>
						<mo-icon class='chevron' ?data-leaf=${!this.controller.isExpandable(period)} icon=${this.controller.isLoading(period) ? 'sync' : 'chevron_right'}></mo-icon>
						<span>${period.name}</span>
						${!period.children?.length ? html.nothing : html`<span class='count'>${period.children.length}</span>`}
					</div>
				`)}
			</div>
			<div class='readout'>
				<div>
					<h4>Open</h4>
					<code>${this.expanded.map(period => period.name).join(', ') || 'none'}</code>
				</div>
				<div>
					<h4>Refetches</h4>
					<code>${this.refetches}</code>
				</div>
				<div class='hint'>
					Open a branch, then press Refetch: the data is replaced by equal periods as brand new objects, and the same
					rows stay open — the set is keyed by id, not by which object happens to be in memory. That is what a grid's
					open detail rows lost on every silent refetch before this controller existed.
				</div>
			</div>
		`
	}
}

StoryExpandability

export const Multiple: StoryObj = {
	name: 'A collection of branches',
	render: () => html`<story-expandability multiple></story-expandability>`,
}

export const Single: StoryObj = {
	name: 'One branch at a time',
	render: () => html`<story-expandability></story-expandability>`,
}

export const Lazy: StoryObj = {
	name: 'Children loaded on first expansion',
	render: () => html`<story-expandability multiple lazy></story-expandability>`,
}