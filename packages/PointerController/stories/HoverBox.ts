import { Component, component, css, html, state } from '@a11d/lit'
import { PointerHoverController } from '@3mo/pointer-controller'

/** A box that shows whether it is hovered and how many hover changes it has seen. */
@component('story-hover-box')
export class HoverBox extends Component {
	@state() private changes = 0

	readonly hoverController = new PointerHoverController(this, {
		handleHoverChange: hover => {
			this.toggleAttribute('data-hover', hover)
			this.changes++
		},
	})

	static override get styles() {
		return css`
			:host {
				display: grid;
				place-content: center;
				gap: 6px;
				block-size: 160px;
				border: 3px dashed var(--mo-color-red);
				color: var(--mo-color-red);
				text-align: center;
				user-select: none;
			}

			:host([data-hover]) {
				border-color: var(--mo-color-green);
				color: var(--mo-color-green);
			}
		`
	}

	protected override get template() {
		return html`
			<strong>${this.hoverController.hover ? 'hovered' : 'not hovered'}</strong>
			<small>${this.changes} changes</small>
		`
	}
}