import { Component, component, css, html } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'

/** A card that renders its heading and footer areas only while something is slotted into them. */
@component('story-slot-card')
export class SlotCard extends Component {
	readonly slotController = new SlotController(this)

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; inline-size: 18rem; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius); overflow: hidden; }
			header, footer { padding: 0.75rem 1rem; background: var(--mo-color-transparent-gray-1); }
			header { font-weight: 500; border-block-end: 1px solid var(--mo-color-transparent-gray-3); }
			footer { display: flex; justify-content: flex-end; gap: 0.5rem; border-block-start: 1px solid var(--mo-color-transparent-gray-3); }
			main { padding: 1rem; }
		`
	}

	protected override get template() {
		return html`
			${!this.slotController.hasAssignedContent('heading') ? html.nothing : html`
				<header>
					<slot name='heading'></slot>
				</header>
			`}
			<main>
				<slot></slot>
			</main>
			${!this.slotController.hasAssignedElements('footer') ? html.nothing : html`
				<footer>
					<slot name='footer'></slot>
				</footer>
			`}
		`
	}
}