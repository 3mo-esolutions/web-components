import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, property, query, state } from '@a11d/lit'
import p from './package.json'
import { ContentVisibilityController } from './ContentVisibilityController.js'

export default {
	title: 'Utilities / Content Visibility',
	package: p,
} as Meta

const itemBlockSize = 56

/** Neither padding nor border sits on the item's own box, so its height and its estimate are the same number. */
const blockSizeOf = (index: number, varying: boolean) => !varying ? itemBlockSize : 48 + (index * 7919 % 9) * 64

class StoryContentVisibility extends Component {
	@property({ type: Number }) count = 3000
	@property({ type: Boolean }) heavy = false
	@property({ type: Boolean }) varying = false
	@property() estimate?: string

	@query('#scroller') private readonly scroller!: HTMLElement

	@state() private disabled = false
	@state() private revision = 0
	@state() private renderedCount = 0
	@state() private skippedCount = 0
	@state() private scrollHeight = 0
	@state() private buildDuration?: number
	@state() private updateDuration?: number

	private readonly contentVisibility = new ContentVisibilityController(this, host => ({
		get disabled() { return host.disabled },
		get estimatedItemBlockSize() { return host.estimatedItemBlockSize },
	}))

	private get estimatedItemBlockSize() {
		return this.estimate ?? `${itemBlockSize}px`
	}

	/** What the list would be tall if every estimate were right. */
	private get realBlockSize() {
		return new Array(this.renderedCount).fill(undefined)
			.reduce((sum: number, _, index) => sum + blockSizeOf(index, this.varying), 0)
	}

	private pollHandle?: number

	override connectedCallback() {
		super.connectedCallback()
		this.renderedCount = this.count
		// Polled rather than rendered per change: reacting to every skip would hand back what the skipping saved.
		this.pollHandle = window.setInterval(() => {
			this.skippedCount = this.contentVisibility.skippedItems.size
			this.scrollHeight = this.scroller?.scrollHeight ?? 0
		}, 250)
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		window.clearInterval(this.pollHandle)
	}

	private async measureUpdate() {
		this.updateDuration = undefined
		const start = performance.now()
		this.revision++
		await this.updateComplete
		this.scroller.offsetHeight
		this.updateDuration = performance.now() - start
	}

	private async measureBuild() {
		this.buildDuration = undefined
		this.renderedCount = 0
		await this.updateComplete
		const start = performance.now()
		this.renderedCount = this.count
		await this.updateComplete
		this.scroller.offsetHeight
		this.buildDuration = performance.now() - start
	}

	static override get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
				color: var(--mo-color-foreground);
			}

			#toolbar, #estimates {
				display: flex;
				align-items: center;
				gap: 1rem;
				flex-wrap: wrap;
			}

			label {
				display: flex;
				align-items: center;
				gap: 0.4rem;
				user-select: none;
				cursor: pointer;
			}

			button {
				font: inherit;
				color: inherit;
				padding: 0.35rem 0.75rem;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-1);
				cursor: pointer;
			}

			button[data-current] {
				border-color: var(--mo-color-accent);
				color: var(--mo-color-accent);
			}

			#readout {
				display: flex;
				gap: 1.5rem;
				flex-wrap: wrap;
				font-variant-numeric: tabular-nums;
				color: var(--mo-color-gray);
				font-size: small;
			}

			#readout b {
				color: var(--mo-color-foreground);
				font-weight: 500;
			}

			#readout b[data-off] { color: var(--mo-color-red); }

			#scroller {
				block-size: 480px;
				overflow-y: auto;
				overscroll-behavior: contain;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
			}

			.item {
				box-sizing: border-box;
			}

			.body {
				box-sizing: border-box;
				block-size: var(--_block-size);
				padding: 0.5rem 0.75rem;
				border-block-end: 1px solid var(--mo-color-transparent-gray-2);
				overflow: hidden;
			}

			.meta {
				display: flex;
				gap: 0.35rem;
				flex-wrap: wrap;
				margin-block-start: 0.25rem;
				color: var(--mo-color-gray);
				font-size: small;
			}

			.chip {
				padding: 0 0.4rem;
				border-radius: 100px;
				background: var(--mo-color-transparent-gray-2);
			}
		`
	}

	private bodyTemplate(index: number, blockSize = itemBlockSize) {
		return html`
			<div class='body' style='--_block-size: ${blockSize}px'>
				<div>Item ${index + 1} · ${blockSize}px · revision ${this.revision}</div>
				${!this.heavy ? html.nothing : html`
					<div class='meta'>
						${new Array(12).fill(undefined).map((_, i) => html`<span class='chip'>tag ${i}</span>`)}
					</div>
				`}
			</div>
		`
	}

	private estimateTemplate(label: string, value: string) {
		return html`
			<button ?data-current=${this.estimatedItemBlockSize === value} @click=${() => this.estimate = value}>
				${label} · ${value}
			</button>
		`
	}

	protected override get template() {
		const supported = ContentVisibilityController.isSupported
		const items = new Array(this.renderedCount).fill(undefined)
		const real = this.realBlockSize
		const drift = !real || !this.scrollHeight ? 0 : Math.round((this.scrollHeight - real) / real * 100)
		return html`
			<div id='toolbar'>
				<label>
					<input type='checkbox' ?checked=${!this.disabled} ?disabled=${!supported}
						@change=${(e: Event) => this.disabled = !(e.target as HTMLInputElement).checked}
					>
					Content visibility enabled
				</label>
				<button @click=${() => this.measureUpdate()}>Re-render every item</button>
				<button @click=${() => this.measureBuild()}>Build them all again</button>
			</div>

			${!this.varying ? html.nothing : html`
				<div id='estimates'>
					<span>Estimate:</span>
					${this.estimateTemplate('far too small', '48px')}
					${this.estimateTemplate('the average', '304px')}
					${this.estimateTemplate('far too large', '560px')}
				</div>
			`}

			<div id='readout'>
				<span>Not rendered right now: <b>${this.skippedCount}</b> of ${this.renderedCount} items</span>
				${!this.varying ? html.nothing : html`
					<span>Scroll height: <b ?data-off=${Math.abs(drift) > 5}>${this.scrollHeight.toLocaleString()}</b> of ${real.toLocaleString()} px</span>
				`}
				<span>Building all of them: <b>${this.buildDuration?.toFixed(0) ?? '–'} ms</b></span>
				<span>Re-rendering all of them: <b>${this.updateDuration?.toFixed(0) ?? '–'} ms</b></span>
				${supported ? html.nothing : html`<span><b>Unsupported by this engine</b> — everything renders as usual.</span>`}
			</div>

			<div id='scroller'>
				${items.map((_, index) => html`
					<div class='item' ${this.contentVisibility.item()}>
						${this.bodyTemplate(index, blockSizeOf(index, this.varying))}
					</div>
				`)}
			</div>
		`
	}
}

customElements.define('story-content-visibility', StoryContentVisibility)

const cardInlineSize = 220
const cardBlockSize = 150

/** The card's own box carries nothing, so its size and the estimates handed over are the same numbers. */
class StoryContentVisibilityAxes extends Component {
	@property({ type: Number }) count = 3000
	@property({ type: Boolean }) gallery = false

	@query('#scroller') private readonly scroller!: HTMLElement

	@state() private disabled = false
	@state() private revision = 0
	@state() private renderedCount = 0
	@state() private skippedCount = 0
	@state() private buildDuration?: number
	@state() private updateDuration?: number

	private readonly contentVisibility = new ContentVisibilityController(this, host => ({
		get disabled() { return host.disabled },
		estimatedItemInlineSize: `${cardInlineSize}px`,
		// A strip stretches its cards to its own height, which no estimate may override.
		get estimatedItemBlockSize() { return !host.gallery ? undefined : `${cardBlockSize}px` },
	}))

	private pollHandle?: number

	override connectedCallback() {
		super.connectedCallback()
		this.renderedCount = this.count
		this.pollHandle = window.setInterval(() => this.skippedCount = this.contentVisibility.skippedItems.size, 250)
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		window.clearInterval(this.pollHandle)
	}

	private async measureUpdate() {
		this.updateDuration = undefined
		const start = performance.now()
		this.revision++
		await this.updateComplete
		this.scroller.offsetHeight
		this.updateDuration = performance.now() - start
	}

	private async measureBuild() {
		this.buildDuration = undefined
		this.renderedCount = 0
		await this.updateComplete
		const start = performance.now()
		this.renderedCount = this.count
		await this.updateComplete
		this.scroller.offsetHeight
		this.buildDuration = performance.now() - start
	}

	static override get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
				color: var(--mo-color-foreground);
			}

			#toolbar {
				display: flex;
				align-items: center;
				gap: 1rem;
				flex-wrap: wrap;
			}

			label {
				display: flex;
				align-items: center;
				gap: 0.4rem;
				user-select: none;
				cursor: pointer;
			}

			button {
				font: inherit;
				color: inherit;
				padding: 0.35rem 0.75rem;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-1);
				cursor: pointer;
			}

			#readout {
				display: flex;
				gap: 1.5rem;
				flex-wrap: wrap;
				font-variant-numeric: tabular-nums;
				color: var(--mo-color-gray);
				font-size: small;
			}

			#readout b {
				color: var(--mo-color-foreground);
				font-weight: 500;
			}

			#scroller {
				display: flex;
				gap: 0.5rem;
				padding: 0.5rem;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
				overscroll-behavior: contain;

				&[data-gallery] {
					flex-wrap: wrap;
					align-content: flex-start;
					block-size: 480px;
					overflow-y: auto;
				}

				&:not([data-gallery]) {
					block-size: 220px;
					overflow-x: auto;
				}
			}

			.card {
				flex: 0 0 auto;
			}

			.body {
				box-sizing: border-box;
				inline-size: ${cardInlineSize}px;
				block-size: ${cardBlockSize}px;
				padding: 0.75rem;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-2);
			}

			/* A strip has one row, so its cards take its height rather than a size of their own. */
			#scroller:not([data-gallery]) .card, #scroller:not([data-gallery]) .body {
				block-size: 100%;
			}

			.meta {
				display: flex;
				gap: 0.35rem;
				flex-wrap: wrap;
				margin-block-start: 0.5rem;
				color: var(--mo-color-gray);
				font-size: small;
			}

			.chip {
				padding: 0 0.4rem;
				border-radius: 100px;
				background: var(--mo-color-transparent-gray-3);
			}
		`
	}

	protected override get template() {
		const supported = ContentVisibilityController.isSupported
		const items = new Array(this.renderedCount).fill(undefined)
		return html`
			<div id='toolbar'>
				<label>
					<input type='checkbox' ?checked=${!this.disabled} ?disabled=${!supported}
						@change=${(e: Event) => this.disabled = !(e.target as HTMLInputElement).checked}
					>
					Content visibility enabled
				</label>
				<button @click=${() => this.measureUpdate()}>Re-render every item</button>
				<button @click=${() => this.measureBuild()}>Build them all again</button>
			</div>

			<div id='readout'>
				<span>Not rendered right now: <b>${this.skippedCount}</b> of ${this.renderedCount} cards</span>
				<span>Building all of them: <b>${this.buildDuration?.toFixed(0) ?? '–'} ms</b></span>
				<span>Re-rendering all of them: <b>${this.updateDuration?.toFixed(0) ?? '–'} ms</b></span>
				${supported ? html.nothing : html`<span><b>Unsupported by this engine</b> — everything renders as usual.</span>`}
			</div>

			<div id='scroller' ?data-gallery=${this.gallery}>
				${items.map((_, index) => html`
					<div class='card' ${this.contentVisibility.item()}>
						<div class='body'>
							<div>Card ${index + 1} · revision ${this.revision}</div>
							<div class='meta'>
								${new Array(8).fill(undefined).map((_, i) => html`<span class='chip'>tag ${i}</span>`)}
							</div>
						</div>
					</div>
				`)}
			</div>
		`
	}
}

customElements.define('story-content-visibility-axes', StoryContentVisibilityAxes)

export const LongList: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: 'Three thousand items, all of them in the DOM. Only those near the viewport are styled, laid out and painted; the rest hold their place at the estimated size. The switch turns that off so the two can be compared — a real component would leave it on.'
			}
		}
	},
	render: () => html`<story-content-visibility></story-content-visibility>`
}

export const HeavyItems: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: 'The same list with a dozen more elements per item. What is saved grows with what an item costs to render, not with how many items there are. Building them is not saved: that is the owner\'s cost either way.'
			}
		}
	},
	render: () => html`<story-content-visibility heavy></story-content-visibility>`
}

export const VaryingSizes: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: 'Items between 48 and 560 pixels tall, so no single estimate can be right. The scroll height starts at the estimate times the item count and reaches the real total as you scroll, each item replacing its estimate with the size it turned out to have.'
			}
		}
	},
	render: () => html`<story-content-visibility varying></story-content-visibility>`
}

export const HorizontalStrip: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: 'Three thousand cards scrolled sideways. Nothing about the controller changes for a horizontal scroller — the engine judges nearness in both axes — only which estimate is given. These cards take their height from the strip, so only the inline one is.'
			}
		}
	},
	render: () => html`<story-content-visibility-axes></story-content-visibility-axes>`
}

export const Gallery: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: 'Wrapping cards, content-sized in both axes, so both estimates are given. How many fit a row is decided from the size a skipped card stands in at, which makes a wrong estimate reflow the rows as you reach them.'
			}
		}
	},
	render: () => html`<story-content-visibility-axes gallery></story-content-visibility-axes>`
}