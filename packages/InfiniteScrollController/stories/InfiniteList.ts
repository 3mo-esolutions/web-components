import { Component, component, css, html, property, query, state } from '@a11d/lit'
import { InfiniteScrollController } from '@3mo/infinite-scroll-controller'
import '@3mo/button'
import '@3mo/circular-progress'

/** A list that loads twenty more items whenever it is scrolled near its end. */
@component('story-infinite-list')
export class InfiniteList extends Component {
	private static readonly chunkSize = 20

	@property({ type: Number }) total = 200
	@property({ type: Number }) failEvery = 0

	@state() private items = new Array<string>()

	@query('#container') private readonly container!: HTMLElement

	private chunk = 0

	readonly infiniteScrollController = new InfiniteScrollController(this, host => ({
		get container() { return host.container },
		fetchNext: () => host.fetchNext(),
	}))

	private async fetchNext() {
		await new Promise(resolve => setTimeout(resolve, 1000))
		this.chunk++
		if (this.failEvery && this.chunk % this.failEvery === 0) {
			throw new Error('Loading the next chunk failed.')
		}
		const count = Math.min(InfiniteList.chunkSize, this.total - this.items.length)
		this.items = [...this.items, ...Array.from({ length: count }, (_, index) => `Item ${this.items.length + index + 1}`)]
		return this.items.length < this.total
	}

	static override get styles() {
		return css`
			#container {
				block-size: 400px;
				max-inline-size: 480px;
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
					inline-size: 24px;
					block-size: 24px;
				}
			}

			#count {
				max-inline-size: 480px;
				padding: 8px;
				text-align: center;
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
						${error === undefined ? html`<mo-circular-progress></mo-circular-progress>` : html`
							<span>Loading failed.</span>
							<mo-button @click=${() => this.infiniteScrollController.reset()}>Retry</mo-button>
						`}
					</div>
				`}
			</div>
			<div id='count'>${this.items.length} of ${this.total}</div>
		`
	}
}
