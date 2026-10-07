import { Component, component, css, html } from '@a11d/lit'
import { PointerController } from '@3mo/pointer-controller'

/** An area that shows whether it is hovered or pressed, and by which kind of pointer. */
@component('story-pointer-area')
export class PointerArea extends Component {
	readonly pointerController = new PointerController(this)

	static override get styles() {
		return css`
			:host {
				display: grid;
				place-content: center;
				inline-size: 400px;
				block-size: 300px;
				border: 2px dashed var(--mo-color-red);
				user-select: none;
			}

			:host([data-hover]) { border-color: var(--mo-color-blue); }
			:host([data-press]) { border-color: var(--mo-color-green); }
		`
	}

	protected override updated() {
		this.toggleAttribute('data-hover', this.pointerController.hover)
		this.toggleAttribute('data-press', this.pointerController.press)
	}

	protected override get template() {
		const { hover, press, type } = this.pointerController
		return html`${[hover ? 'hovered' : '', press ? 'pressed' : '', hover || press ? `by ${type}` : ''].filter(Boolean).join(' · ')}`
	}
}
