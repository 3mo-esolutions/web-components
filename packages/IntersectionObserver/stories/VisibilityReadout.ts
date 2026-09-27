import { Component, component, css, html, state } from '@a11d/lit'
import { observeIntersection } from '@3mo/intersection-observer'

/** A scroller that reports how much of the box inside it is visible, in steps of a quarter. */
@component('story-visibility-readout')
export class VisibilityReadout extends Component {
	@state() private ratio = 0

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.5rem; inline-size: 18rem; }
			.scroller { block-size: 10rem; overflow: auto; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius); }
			.spacer { block-size: 12rem; }
			.box { block-size: 5rem; margin-inline: 1rem; border-radius: var(--mo-border-radius); background: var(--mo-color-accent); }
		`
	}

	protected override get template() {
		return html`
			<div class='scroller'>
				<div class='spacer'></div>
				<div class='box' ${observeIntersection(([entry]) => this.ratio = entry!.intersectionRatio, { threshold: [0, 0.25, 0.5, 0.75, 1] })}></div>
				<div class='spacer'></div>
			</div>
			<span>${Math.round(this.ratio * 100)}% visible</span>
		`
	}
}