import { Component, component, css, html, query, state } from '@a11d/lit'
import { SwipeabilityController } from '@3mo/swipeability'

/** A list row which swipes aside and parks at the width of the actions behind it. */
@component('story-swipeable-row')
export class SwipeableRow extends Component {
	@state() private offset = 0
	@state() private open = false

	@query('.surface') private readonly surface!: HTMLElement
	@query('.actions') private readonly actions!: HTMLElement

	readonly swipeability = new SwipeabilityController(this, host => ({
		axis: 'inline',
		direction: 'start',
		get surface() { return host.surface },
		get detents() { return [0, host.actions?.offsetWidth ?? 0] },
		get detent() { return host.open ? host.actions?.offsetWidth ?? 0 : 0 },
		handleSwipe: offset => host.offset = offset,
		handleSwipeEnd: detent => {
			host.offset = detent
			host.open = detent > 0
		},
	}))

	private close() {
		this.open = false
		this.offset = 0
	}

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
				max-inline-size: 24rem;
				overflow: clip;
				border-radius: var(--mo-border-radius);
			}

			.actions {
				position: absolute;
				inset-block: 0;
				inset-inline-end: 0;
				display: flex;

				button {
					inline-size: 4.5rem;
					border: none;
					color: white;
					font: inherit;
					cursor: pointer;
				}
			}

			.archive { background: var(--mo-color-blue); }
			.delete { background: var(--mo-color-red); }

			.surface {
				position: relative;
				padding: 1rem;
				border: 1px solid var(--mo-color-transparent-gray-3);
				background: var(--mo-color-surface);
				touch-action: pan-y;
				user-select: none;

				&[data-swipeability=idle] {
					transition: translate 250ms cubic-bezier(0.2, 0, 0, 1);
				}
			}
		`
	}

	protected override get template() {
		return html`
			<div class='actions'>
				<button class='archive' @click=${() => this.close()}>Archive</button>
				<button class='delete' @click=${() => this.close()}>Delete</button>
			</div>
			<div class='surface' style='translate: ${-this.offset}px 0'>Ada Lovelace sent you a message</div>
		`
	}
}