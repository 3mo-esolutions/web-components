import { Component, component, css, html, state } from '@a11d/lit'
import { observeMutation } from '@3mo/mutation-observer'

/** A list that counts the items slotted into it, recounting whenever the slot's content changes. */
@component('story-child-count')
export class ChildCount extends Component {
	@state() private count = 0

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.25rem; inline-size: 16rem; }
			small { color: var(--mo-color-gray); }
		`
	}

	protected override get template() {
		return html`
			<slot ${observeMutation(() => this.count = this.children.length)}></slot>
			<small>${this.count} items</small>
		`
	}
}
