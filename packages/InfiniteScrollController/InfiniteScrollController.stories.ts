import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, query, state } from '@a11d/lit'
import p from './package.json'
import { InfiniteScrollController } from './InfiniteScrollController.js'

export default {
	title: 'Utilities / Infinite Scroll Controller',
	package: p,
} as Meta

class StoryInfiniteScroll extends Component {
	private static readonly total = 200
	private static readonly chunkSize = 20

	failEvery = 0

	@query('#container') private readonly container!: HTMLElement
	@state() private items = new Array<string>()

	private chunk = 0

	protected readonly infiniteScrollController = new InfiniteScrollController(this, host => ({
		get container() { return host.container },
		fetchNext: () => host.fetchNext(),
	}))

	private async fetchNext() {
		await new Promise(resolve => setTimeout(resolve, 1000))
		this.chunk++
		if (this.failEvery && this.chunk % this.failEvery === 0) {
			throw new Error('Loading the next chunk failed.')
		}
		this.items = [
			...this.items,
			...new Array(StoryInfiniteScroll.chunkSize).fill(0).map((_, index) => `Item ${this.items.length + index + 1}`),
		]
		return this.items.length < StoryInfiniteScroll.total
	}

	static override get styles() {
		return css`
			#container {
				height: 400px;
				max-width: 480px;
				overflow: auto;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
			}

			.item {
				padding: 12px 16px;

				&:nth-child(even) {
					background: var(--mo-color-transparent-gray-1);
				}
			}

			#status {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8px;
				padding: 12px;
				color: var(--mo-color-gray);

				mo-circular-progress {
					width: 24px;
					height: 24px;
				}
			}

			#count {
				max-width: 480px;
				text-align: center;
				padding: 8px;
				color: var(--mo-color-gray);
				font-size: small;
			}
		`
	}

	protected override get template() {
		const { pending, error } = this.infiniteScrollController
		return html`
			<div id='container'>
				${this.items.map(item => html`<div class='item'>${item}</div>`)}
				${!pending && !error ? html.nothing : html`
					<div id='status'>
						${error === undefined ? html`
							<mo-circular-progress></mo-circular-progress>
						` : html`
							<span>Loading failed.</span>
							<mo-button @click=${() => this.infiniteScrollController.reset()}>Retry</mo-button>
						`}
					</div>
				`}
			</div>
			<div id='count'>Loaded ${this.items.length} of ${StoryInfiniteScroll.total}</div>
		`
	}
}

customElements.define('story-infinite-scroll', StoryInfiniteScroll)

export const InfiniteScroll: StoryObj = {
	render: () => html`<story-infinite-scroll></story-infinite-scroll>`
}

export const FailingChunks: StoryObj = {
	name: 'With every third chunk failing',
	render: () => html`<story-infinite-scroll .failEvery=${3}></story-infinite-scroll>`
}