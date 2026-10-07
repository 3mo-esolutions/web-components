import { Component, component, css, html } from '@a11d/lit'
import { IntersectionController } from '@3mo/intersection-observer'

/** A card that knows whether it is on screen, and dims while it is not. */
@component('story-in-view-card')
export class InViewCard extends Component {
	readonly intersectionController = new IntersectionController(this, {
		callback: ([entry]) => entry?.isIntersecting ?? false,
	})

	static override get styles() {
		return css`
			:host {
				display: block; padding: 1.5rem 1rem;
				border-radius: var(--mo-border-radius); background: var(--mo-color-transparent-gray-1);
				opacity: 0.2; transition: opacity 0.5s;
			}
			:host([in-view]) { opacity: 1; }
		`
	}

	protected override get template() {
		this.toggleAttribute('in-view', !!this.intersectionController.value)
		return html`<slot></slot>`
	}
}
