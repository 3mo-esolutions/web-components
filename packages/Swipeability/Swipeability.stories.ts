import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, html, query, state } from '@a11d/lit'
import p from './package.json'
import { SwipeabilityController } from './SwipeabilityController.js'

export default {
	title: 'Utilities / Swipeability',
	package: p,
} as Meta

/** Shared by every story: the surface transitions to its detent while idle and follows the finger while not. */
const surfaceStyles = css`
	.surface {
		box-sizing: border-box;
		background: var(--mo-color-surface, #fff);
		border: 1px solid var(--mo-color-transparent-gray-3, rgba(128, 128, 128, 0.2));
		border-radius: 0.5rem;
		padding: 1rem;
		touch-action: pan-y;
		user-select: none;

		&[data-swipeability=idle] {
			transition: translate 250ms cubic-bezier(0.2, 0, 0, 1);
		}

		&[data-swipeability=swiping] {
			cursor: grabbing;
		}
	}
`

/** Swipe a card off its own edge. One detent away from rest, and reaching it removes the card. */
@component('story-swipe-to-dismiss')
class SwipeToDismissStory extends Component {
	@state() private offset = 0
	@state() private dismissed = false
	@query('.surface') private readonly surface!: HTMLElement

	readonly controller = new SwipeabilityController(this, host => ({
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

	static override get styles() {
		return css`
			${surfaceStyles}
			:host { display: block; max-width: 24rem; }
			.surface { touch-action: pan-y; }
			button { margin-block-start: 1rem; }
		`
	}

	protected override get template() {
		return this.dismissed ? html`
			<button @click=${() => { this.dismissed = false; this.offset = 0 }}>Bring it back</button>
		` : html`
			<div class='surface' style='translate: ${this.offset}px 0; opacity: ${1 - Math.min(this.offset / (this.surface?.offsetWidth || 1), 1)}'>
				Swipe me to the end to dismiss.
			</div>
		`
	}
}

/** The list-row pattern: swiping the row aside parks it at the width of the actions behind it. */
@component('story-swipe-to-reveal')
class SwipeToRevealStory extends Component {
	@state() private offset = 0
	@state() private open = false
	@query('.surface') private readonly surface!: HTMLElement
	@query('.actions') private readonly actions!: HTMLElement

	readonly controller = new SwipeabilityController(this, host => ({
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

	static override get styles() {
		return css`
			${surfaceStyles}
			:host { display: block; max-width: 24rem; }
			.row { position: relative; overflow: clip; border-radius: 0.5rem; }
			.actions {
				position: absolute;
				inset-block: 0;
				inset-inline-end: 0;
				display: flex;
			}
			.actions button {
				border: none;
				inline-size: 4.5rem;
				color: #fff;
				cursor: pointer;
			}
			.archive { background: var(--mo-color-blue, #0077c8); }
			.delete { background: var(--mo-color-red, #dd3d31); }
			.surface { position: relative; border-radius: 0; }
		`
	}

	protected override get template() {
		return html`
			<div class='row'>
				<div class='actions'>
					<button class='archive' @click=${() => this.close()}>Archive</button>
					<button class='delete' @click=${() => this.close()}>Delete</button>
				</div>
				<div class='surface' style='translate: ${-this.offset}px 0'>
					Swipe me toward the start to reveal actions.
				</div>
			</div>
		`
	}

	private close() {
		this.open = false
		this.offset = 0
	}
}

/** More than two rest positions: a panel which peeks, half-opens and fills, one detent at a time. */
@component('story-swipe-detents')
class SwipeDetentsStory extends Component {
	private readonly positions = [64, 160, 256]

	@state() private offset = this.positions[0]!
	@state() private resting = this.positions[0]!
	@query('.surface') private readonly surface!: HTMLElement

	readonly controller = new SwipeabilityController(this, host => ({
		axis: 'block',
		direction: 'start',
		get surface() { return host.surface },
		get detents() { return host.positions },
		get detent() { return host.resting },
		handleSwipe: offset => host.offset = offset,
		handleSwipeEnd: detent => {
			host.offset = detent
			host.resting = detent
		},
	}))

	static override get styles() {
		return css`
			${surfaceStyles}
			:host { display: block; }
			.frame {
				position: relative;
				overflow: clip;
				block-size: 20rem;
				border-radius: 0.5rem;
				background: var(--mo-color-transparent-gray-1, rgba(128, 128, 128, 0.05));
			}
			.surface {
				position: absolute;
				inset-inline: 0;
				inset-block-start: 100%;
				block-size: 16rem;
				border-start-start-radius: 1rem;
				border-start-end-radius: 1rem;
				touch-action: none;
			}
			.label { font-variant-numeric: tabular-nums; opacity: 0.7; margin-block-start: 0.5rem; }
		`
	}

	protected override get template() {
		const index = this.positions.indexOf(this.resting)
		return html`
			<div class='frame'>
				<div class='surface' style='translate: 0 ${-this.offset}px'>
					<div>Drag me up and down between three rest positions.</div>
					<div class='label'>${['peeking', 'half', 'full'][index] ?? 'between'} · ${Math.round(this.offset)}px</div>
				</div>
			</div>
		`
	}
}

/** The gesture yields to anything beneath the finger which can still scroll the way it is going. */
@component('story-swipe-scroll-deference')
class SwipeScrollDeferenceStory extends Component {
	@state() private offset = 0
	@query('.surface') private readonly surface!: HTMLElement

	readonly controller = new SwipeabilityController(this, host => ({
		axis: 'block',
		direction: 'end',
		get surface() { return host.surface },
		get detents() { return [0, 160] },
		handleSwipe: offset => host.offset = offset,
		handleSwipeEnd: detent => host.offset = detent,
	}))

	static override get styles() {
		return css`
			${surfaceStyles}
			:host { display: block; max-width: 24rem; }
			.surface { touch-action: none; }
			.scroller {
				block-size: 6rem;
				overflow: auto;
				margin-block-start: 0.75rem;
				border: 1px dashed var(--mo-color-transparent-gray-3, rgba(128, 128, 128, 0.3));
				border-radius: 0.25rem;
				padding: 0.5rem;
			}
		`
	}

	protected override get template() {
		return html`
			<div class='surface' style='translate: 0 ${this.offset}px'>
				<div>Drag the padding to move me. Drag inside the box below and it scrolls instead — until it reaches its top, when the gesture becomes mine again.</div>
				<div class='scroller'>
					${new Array(12).fill(undefined).map((_, index) => html`<div>Line ${index + 1}</div>`)}
				</div>
			</div>
		`
	}
}

/** Reaching the detent need not park the surface there: here it fires an action and springs back. */
@component('story-swipe-pull-to-act')
class SwipePullToActStory extends Component {
	@state() private offset = 0
	@state() private count = 0
	@query('.surface') private readonly surface!: HTMLElement

	readonly controller = new SwipeabilityController(this, host => ({
		axis: 'block',
		direction: 'end',
		threshold: 0.9,
		get surface() { return host.surface },
		get detents() { return [0, 96] },
		detent: 0,
		handleSwipe: offset => host.offset = offset,
		handleSwipeEnd: detent => {
			host.offset = 0
			if (detent > 0) {
				host.count++
			}
		},
	}))

	static override get styles() {
		return css`
			${surfaceStyles}
			:host { display: block; max-width: 24rem; }
			.frame { position: relative; overflow: clip; block-size: 12rem; border-radius: 0.5rem; }
			.hint { position: absolute; inset-inline: 0; inset-block-start: 0; text-align: center; padding: 0.5rem; opacity: 0.7; }
			.surface { position: relative; touch-action: none; }
		`
	}

	protected override get template() {
		return html`
			<div class='frame'>
				<div class='hint'>${this.offset > 86 ? 'Release to refresh' : 'Pull down…'}</div>
				<div class='surface' style='translate: 0 ${this.offset}px'>
					Pulled ${this.count} ${this.count === 1 ? 'time' : 'times'}.
				</div>
			</div>
		`
	}
}

export const SwipeToDismiss: StoryObj = { render: () => html`<story-swipe-to-dismiss></story-swipe-to-dismiss>` }
export const SwipeToRevealActions: StoryObj = { render: () => html`<story-swipe-to-reveal></story-swipe-to-reveal>` }
export const MultipleDetents: StoryObj = { render: () => html`<story-swipe-detents></story-swipe-detents>` }
export const ScrollDeference: StoryObj = { render: () => html`<story-swipe-scroll-deference></story-swipe-scroll-deference>` }
export const PullToAct: StoryObj = { render: () => html`<story-swipe-pull-to-act></story-swipe-pull-to-act>` }

declare global {
	interface HTMLElementTagNameMap {
		'story-swipe-to-dismiss': SwipeToDismissStory
		'story-swipe-to-reveal': SwipeToRevealStory
		'story-swipe-detents': SwipeDetentsStory
		'story-swipe-scroll-deference': SwipeScrollDeferenceStory
		'story-swipe-pull-to-act': SwipePullToActStory
	}
}