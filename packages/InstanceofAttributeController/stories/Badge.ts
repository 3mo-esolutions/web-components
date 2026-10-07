import { Component, component, css, html } from '@a11d/lit'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'

/** A badge that shows its own `instanceof` attribute. */
@component('story-badge')
export class Badge extends Component {
	readonly instanceofAttributeController = new InstanceofAttributeController(this)

	static override get styles() {
		return css`
			:host { display: inline-flex; gap: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 999px; background: var(--mo-color-transparent-gray-3); }
			code { opacity: 0.7; }
		`
	}

	protected override get template() {
		return html`
			<slot></slot>
			<code>${this.getAttribute('instanceof')}</code>
		`
	}
}

/** A subclass, which inherits the controller and so is also an instance of `story-badge`. */
@component('story-warning-badge')
export class WarningBadge extends Badge {
	static override get styles() {
		return css`
			${super.styles}
			:host { background: var(--mo-color-yellow); color: black; }
		`
	}
}
