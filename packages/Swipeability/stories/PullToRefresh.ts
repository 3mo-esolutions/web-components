import { Component, component, css, html, query, state } from '@a11d/lit'
import { SwipeabilityController } from '@3mo/swipeability'

/** A surface which refreshes when pulled all the way down, and springs back instead of resting there. */
@component('story-pull-to-refresh')
export class PullToRefresh extends Component {
	@state() private offset = 0
	@state() private refreshes = 0

	@query('.surface') private readonly surface!: HTMLElement

	readonly swipeability = new SwipeabilityController(this, host => ({
		axis: 'block',
		direction: 'end',
		threshold: 0.9,
		detents: [0, 96],
		detent: 0,
		get surface() { return host.surface },
		handleSwipe: offset => host.offset = offset,
		handleSwipeEnd: detent => {
			host.offset = 0
			if (detent > 0) {
				host.refreshes++
			}
		},
	}))

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
				max-inline-size: 24rem;
				block-size: 12rem;
				overflow: clip;
				border-radius: var(--mo-border-radius);
			}

			.indicator {
				position: absolute;
				inset-inline: 0;
				inset-block-start: 0;
				padding: 0.5rem;
				text-align: center;
				color: var(--mo-color-gray);
			}

			.surface {
				position: relative;
				padding: 1rem;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface);
				touch-action: none;
				user-select: none;

				&[data-swipeability=idle] {
					transition: translate 250ms cubic-bezier(0.2, 0, 0, 1);
				}
			}
		`
	}

	protected override get template() {
		return html`
			<div class='indicator'>${this.offset > 86 ? 'Release to refresh' : 'Pull to refresh'}</div>
			<div class='surface' style='translate: 0 ${this.offset}px'>Refreshed ${this.refreshes} times</div>
		`
	}
}