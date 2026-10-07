import { Component, component, css, html, query, state } from '@a11d/lit'
import { SwipeabilityController } from '@3mo/swipeability'

/** A card which swipes down, holding a box which scrolls. */
@component('story-scrolling-card')
export class ScrollingCard extends Component {
	@state() private offset = 0

	@query('.surface') private readonly surface!: HTMLElement

	readonly swipeability = new SwipeabilityController(this, host => ({
		axis: 'block',
		direction: 'end',
		detents: [0, 160],
		get surface() { return host.surface },
		handleSwipe: offset => host.offset = offset,
		handleSwipeEnd: detent => host.offset = detent,
	}))

	static override get styles() {
		return css`
			:host { display: block; max-inline-size: 24rem; }

			.surface {
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

			.scroller {
				block-size: 6rem;
				overflow: auto;
				margin-block-start: 0.75rem;
				padding: 0.5rem;
				border: 1px dashed var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
			}
		`
	}

	protected override get template() {
		return html`
			<div class='surface' style='translate: 0 ${this.offset}px'>
				Messages
				<div class='scroller'>
					${Array.from({ length: 12 }, (_, index) => html`<div>Message ${index + 1}</div>`)}
				</div>
			</div>
		`
	}
}
