import { Component, component, css, html, query, state } from '@a11d/lit'
import { SwipeabilityController } from '@3mo/swipeability'

const detents = [64, 160, 256]

/** A bottom panel which peeks, half-opens and fills, one detent at a time. */
@component('story-detent-panel')
export class DetentPanel extends Component {
	@state() private offset = detents[0]!
	@state() private resting = detents[0]!

	@query('.surface') private readonly surface!: HTMLElement

	readonly swipeability = new SwipeabilityController(this, host => ({
		axis: 'block',
		direction: 'start',
		detents,
		get surface() { return host.surface },
		get detent() { return host.resting },
		handleSwipe: offset => host.offset = offset,
		handleSwipeEnd: detent => {
			host.offset = detent
			host.resting = detent
		},
	}))

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
				block-size: 20rem;
				overflow: clip;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-1);
			}

			.surface {
				position: absolute;
				inset-inline: 0;
				inset-block-start: 100%;
				block-size: 16rem;
				padding: 1rem;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-start-start-radius: 1rem;
				border-start-end-radius: 1rem;
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
			<div class='surface' style='translate: 0 ${-this.offset}px'>
				${['Peeking', 'Half open', 'Full'][detents.indexOf(this.resting)]}
			</div>
		`
	}
}