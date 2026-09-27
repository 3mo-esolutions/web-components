import { Component, component, css, html, query, state } from '@a11d/lit'
import { SwipeabilityController } from '@3mo/swipeability'
import '@3mo/button'

/** A card with two detents, at rest and one card width away, the second of which removes it. */
@component('story-dismissible-card')
export class DismissibleCard extends Component {
	@state() private offset = 0
	@state() private dismissed = false

	@query('.surface') private readonly surface!: HTMLElement

	readonly swipeability = new SwipeabilityController(this, host => ({
		axis: 'inline',
		direction: 'end',
		get surface() { return host.surface },
		get detents() { return [0, host.surface?.offsetWidth ?? 0] },
		detent: 0,
		handleSwipe: offset => host.offset = offset,
		handleSwipeEnd: detent => {
			host.offset = detent
			host.dismissed = detent > 0
		},
	}))

	private undo() {
		this.dismissed = false
		this.offset = 0
	}

	static override get styles() {
		return css`
			:host { display: block; max-inline-size: 24rem; }

			.surface {
				padding: 1rem;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
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
		return this.dismissed ? html`
			<mo-button type='outlined' @click=${() => this.undo()}>Undo</mo-button>
		` : html`
			<div class='surface' style='translate: ${this.offset}px 0; opacity: ${1 - Math.min(this.offset / (this.surface?.offsetWidth || 1), 1)}'>
				Ada Lovelace sent you a message
			</div>
		`
	}
}