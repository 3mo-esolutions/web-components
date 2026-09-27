import { Component, component, css, html, state } from '@a11d/lit'
import { observeResize } from '@3mo/resize-observer'

/** A resizable box that shows its own size, read by the directive on every resize. */
@component('story-size-readout')
export class SizeReadout extends Component {
	@state() private size = ''

	static override get styles() {
		return css`
			div {
				display: grid; place-content: center;
				inline-size: 16rem; block-size: 8rem; min-inline-size: 6rem; min-block-size: 3rem;
				resize: both; overflow: auto;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				font-variant-numeric: tabular-nums;
			}
		`
	}

	protected override get template() {
		return html`
			<div ${observeResize(([entry]) => this.size = `${Math.round(entry!.contentRect.width)} × ${Math.round(entry!.contentRect.height)}`)}>
				${this.size}
			</div>
		`
	}
}